import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core'; // Thêm OnChanges
import { BookingService } from '../../services/booking.service';
import { TimeSlot } from '../../models/booking.model';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-booking-modal',
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css'],
  standalone: false,
  providers: [DatePipe]
})
export class BookingModalComponent implements OnInit, OnChanges { // Implement OnChanges
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
      // Nếu đã có slot rồi thì chỉ cần check lại trạng thái booking
      if (this.timeSlots.length > 0) {
        this.checkAvailability();
      }
    }
  }

  loadTimeSlots() {
    this.isLoading = true;
    this.bookingService.getAllTimeSlots().subscribe(data => {
      this.timeSlots = data;
      this.checkAvailability(); // Load xong slot thì check ngay lập tức
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

    // Không cần set isLoading=true ở đây để tránh nháy giao diện liên tục khi đổi ngày
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
    
    // So sánh ngày (chỉ lấy phần ngày/tháng/năm)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Nếu chọn ngày quá khứ (Hôm qua...) -> Disable hết
    if (selectedDate < today) return true;

    // 2. Nếu chọn ngày tương lai -> Không disable
    if (selectedDate > today) return false;

    // 3. Nếu chọn HÔM NAY -> Check giờ
    if (selectedDate.getTime() === today.getTime()) {
      
      const parts = slot.startTime.toString().split(':');
      const slotHour = parseInt(parts[0], 10);
      const slotMinute = parseInt(parts[1], 10);

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Nếu giờ slot nhỏ hơn giờ hiện tại -> Quá khứ
      if (slotHour < currentHour) return true;
      
      // Nếu cùng giờ nhưng phút slot nhỏ hơn -> Quá khứ
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

    // Chặn click nếu đã đặt
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
    this.totalPrice = this.selectedSlotIds.length * (this.field?.price || 0);
  }

  submitBooking() {
    if (this.selectedSlotIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 khung giờ!');
      return;
    }
    if (this.currentUserId === 0) {
      if (!this.guestName.trim() || !this.guestPhone.trim()) {
        alert('Vui lòng nhập Họ tên và Số điện thoại để chúng tôi liên hệ!');
        return;
      }
    }
    if (!confirm(`Xác nhận đặt sân? Bạn sẽ thanh toán cọc 30% qua ${this.selectedPaymentMethod}.`)) return;

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
        alert(err.error?.message || 'Lỗi đặt sân');
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
        if (res.payUrl) window.location.href = res.payUrl;
      },
      error: () => {
        this.isLoading = false;
        alert('Lỗi tạo cổng thanh toán.');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}