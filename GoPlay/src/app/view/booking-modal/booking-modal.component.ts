import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { TimeSlot } from '../../models/booking.model';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

// Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking-modal',
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css'],
  standalone: false,
  providers: [DatePipe]
})
export class BookingModalComponent implements OnInit, OnChanges {
  @Input() field: any;
  @Output() close = new EventEmitter<void>();

  selectedDate: string = '';
  timeSlots: TimeSlot[] = [];
  bookedSlotIds: number[] = []; 
  selectedSlotIds: number[] = [];
  slotStatuses: { [key: number]: string } = {};
  
  currentUserId: number = 0;
  guestName: string = '';
  guestPhone: string = '';
  selectedPaymentMethod: string = 'VnPay';

  isLoading = false;
  totalPrice = 0;

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadTimeSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] && this.field) {
      if (this.timeSlots.length > 0) {
        this.checkAvailability();
      }
    }
  }

  loadTimeSlots() {
    this.isLoading = true;
    this.bookingService.getAllTimeSlots().subscribe(data => {
      this.timeSlots = data;
      this.checkAvailability(); 
      this.isLoading = false;
    });
  }

  onDateChange() {
    this.selectedSlotIds = [];
    this.totalPrice = 0;
    this.checkAvailability();
  }

  checkAvailability() {
    if (!this.field || !this.selectedDate) return;

    this.bookingService.getBookingsByFieldAndDate(this.field.fieldId, this.selectedDate)
      .subscribe(bookings => {
        this.bookedSlotIds = [];
        this.slotStatuses = {};

        bookings.forEach((b: any) => {
          if (b.status !== 'Cancelled') {
            b.bookingTimeSlots?.forEach((bts: any) => {
              const slotId = Number(bts.slotId);
              this.bookedSlotIds.push(slotId);
              this.slotStatuses[slotId] = b.status; 
            });
          }
        });
      });
  }

  isSlotPast(slot: TimeSlot): boolean {
    const now = new Date();
    const selectedDate = new Date(this.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return true;
    if (selectedDate > today) return false;

    if (selectedDate.getTime() === today.getTime()) {
      const parts = slot.startTime.toString().split(':');
      const slotHour = parseInt(parts[0], 10);
      const slotMinute = parseInt(parts[1], 10); // Logic này đã đúng cho 30 phút
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (slotHour < currentHour) return true;
      if (slotHour === currentHour && slotMinute < currentMinute) return true;
    }
    return false;
  }

  getSlotClass(slot: any): string {
    if (this.bookedSlotIds.includes(slot.slotId)) {
      const status = this.slotStatuses[slot.slotId];
      if (status === 'Completed') return 'completed';
      if (status === 'Confirmed') return 'booked'; 
      if (status === 'Pending') return 'pending'; 
      if (status === 'AwaitingPayment') return 'awaiting'; 
      return 'booked';
    }
    if (this.selectedSlotIds.includes(slot.slotId)) return 'selected';
    if (this.isSlotPast(slot)) return 'past-slot'; 
    return 'available';
  }

  toggleSlot(slot: any) {
    const id = Number(slot.slotId);
    if (this.bookedSlotIds.includes(id)) return;
    if (this.isSlotPast(slot)) return;

    const index = this.selectedSlotIds.indexOf(id);
    if (index > -1) {
      this.selectedSlotIds.splice(index, 1);
    } else {
      this.selectedSlotIds.push(id);
    }
    this.calculateTotal();
  }

  calculateTotal() {
    // [LOGIC MỚI]
    // Giá sân (this.field.price) là giá theo GIỜ.
    // Hệ thống mới: 1 slot = 30 phút.
    // => Giá 1 slot = Giá sân / 2
    const pricePerSlot = (this.field?.price || 0) / 2;
    
    this.totalPrice = this.selectedSlotIds.length * pricePerSlot;
  }

 submitBooking() {
    // 1. Validate: Chưa chọn giờ
    if (this.selectedSlotIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn giờ',
        text: 'Vui lòng chọn ít nhất 1 khung giờ bạn muốn đặt!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // 2. Validate: Khách vãng lai thiếu info
    if (this.currentUserId === 0) {
      if (!this.guestName.trim() || !this.guestPhone.trim()) {
        Swal.fire({
          icon: 'info',
          title: 'Thiếu thông tin liên hệ',
          text: 'Vui lòng nhập Họ tên và Số điện thoại để chúng tôi giữ sân cho bạn.',
          confirmButtonColor: '#3498db'
        });
        return;
      }
    }

    // 3. Confirm: Xác nhận thanh toán
    const depositAmount = this.totalPrice * 0.3;
    const paymentName = this.selectedPaymentMethod === 'VNPay' ? 'VNPAY' : 'MoMo';
    

    const totalHours = this.selectedSlotIds.length / 2;

    Swal.fire({
      title: 'Xác nhận đặt sân?',
      html: `
        <div style="text-align: left; font-size: 1.1em;">
          <p><strong>Ngày đá:</strong> ${this.datePipe.transform(this.selectedDate, 'dd/MM/yyyy')}</p>
          <p><strong>Thời gian:</strong> ${totalHours} giờ (${this.selectedSlotIds.length} slot)</p>
          <p><strong>Tổng tiền:</strong> ${this.totalPrice.toLocaleString()}đ</p>
          <hr>
          <p style="color: #c0392b; font-weight: bold;">
            CỌC TRƯỚC (30%): ${depositAmount.toLocaleString()}đ
          </p>
          <p style="font-size: 0.9em; color: #7f8c8d;">
            (Thanh toán qua cổng ${paymentName})
          </p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Thanh toán ngay',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#95a5a6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processBooking();
      }
    });
  }

  processBooking() {
    // 4. Loading Popup
    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Đang tạo đơn hàng và chuyển hướng thanh toán',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const dto: any = {
      fieldId: this.field.fieldId,
      bookingDate: this.selectedDate,
      slotIds: this.selectedSlotIds
    };

    if (this.currentUserId === 0) {
      dto.guestName = this.guestName;
      dto.guestPhone = this.guestPhone;
    }

    this.isLoading = true;
    this.bookingService.createBooking(dto).subscribe({
      next: (bookingRes) => {
        this.createPayment(bookingRes.bookingId);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
            icon: 'error',
            title: 'Đặt sân thất bại',
            text: err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
            confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  createPayment(bookingId: number) {
    const paymentReq = {
      bookingId: bookingId,
      method: this.selectedPaymentMethod
    };
    this.paymentService.createPayment(paymentReq).subscribe({
      next: (res: any) => {
        if (res.payUrl) {
            // Chuyển hướng thanh toán
            window.location.href = res.payUrl;
        } else {
            Swal.fire('Lỗi', 'Không nhận được link thanh toán', 'error');
            this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Lỗi', 'Không thể kết nối cổng thanh toán.', 'error');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}