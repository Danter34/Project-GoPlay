import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../services/booking.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css'],
  standalone: false
})
export class BookingListComponent implements OnInit {

  myFields: any[] = [];
  bookings: any[] = [];
  selectedField: any = null;
  isLoading = false;

  showChangeTimeModal = false;
  changeModeData: any = {
    booking: null,
    newDate: '',
    slots: [],
    bookedSlotIds: [],
    selectedNewSlotIds: [],
    oldTotalPrice: 0,
    newTotalPrice: 0,
    depositAmount: 0,
    remainingAmount: 0
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadOwnerFields();
    this.bookingService.getAllTimeSlots().subscribe(data => {
      this.changeModeData.slots = data;
    });
  }

  
  formatDateLocal(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getCurrentDateString(): string {
    return this.formatDateLocal(new Date());
  }

  loadOwnerFields() {
    this.isLoading = true;
    this.bookingService.getOwnerFields().subscribe({
      next: (res: any) => { this.myFields = res.items || []; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  onSelectField(field: any) { this.selectedField = field; this.loadBookings(field.fieldId); }
  
  loadBookings(fieldId: number) {
    this.isLoading = true;
    this.bookingService.getBookingsByField(fieldId).subscribe({
      next: (res: any) => { this.bookings = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  backToFields() { this.selectedField = null; this.bookings = []; }


  updateStatus(id: number, newStatus: string) {
    const statusText = newStatus === 'Confirmed' ? 'DUYỆT' : 
                       newStatus === 'Cancelled' ? 'HỦY' : 'HOÀN TẤT';
    
    const color = newStatus === 'Confirmed' ? '#27ae60' : 
                  newStatus === 'Cancelled' ? '#c0392b' : '#2980b9';

    Swal.fire({
      title: `Xác nhận ${statusText} đơn hàng?`,
      text: `Bạn có chắc chắn muốn chuyển trạng thái đơn #${id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: '#95a5a6',
      confirmButtonText: `Đồng ý ${statusText}`,
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Show loading nhẹ
        this.bookingService.updateBookingStatus(id, newStatus).subscribe({
          next: () => {
            const booking = this.bookings.find(b => b.bookingId === id);
            
            // 2. Nếu tìm thấy, cập nhật trạng thái mới luôn
            if (booking) {
              booking.status = newStatus;
            }
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: `Đã cập nhật trạng thái đơn #${id}`,
              timer: 1500,
              showConfirmButton: false
            });
            this.loadBookings(this.selectedField.fieldId);
          },
          error: (err: any) => {
            this.isLoading = false;
            Swal.fire('Lỗi', err.error?.message || 'Có lỗi xảy ra', 'error');
          }
        });
      }
    });
  }


  
  openChangeTimeModal(booking: any) {
    this.changeModeData.booking = booking;
    this.changeModeData.newDate = this.formatDateLocal(booking.bookingDate);
    this.changeModeData.selectedNewSlotIds = [];
    this.changeModeData.oldTotalPrice = booking.totalPrice;
    this.changeModeData.depositAmount = booking.totalPrice * 0.3; // Hoặc lấy từ DB
    this.changeModeData.newTotalPrice = 0;
    this.changeModeData.remainingAmount = 0;

    this.loadBookedSlotsForDate();
    this.showChangeTimeModal = true;
  }

 
  onDateChange(event: any) {
    this.changeModeData.newDate = event.target.value;
    this.changeModeData.selectedNewSlotIds = [];
    this.updatePricePreview();
    this.loadBookedSlotsForDate();
  }

  loadBookedSlotsForDate() {
    if (!this.selectedField) return;
    this.bookingService.getBookedSlots(this.selectedField.fieldId, this.changeModeData.newDate)
      .subscribe((bookedIds: number[]) => {
        this.changeModeData.bookedSlotIds = bookedIds || [];
      });
  }

  isSlotDisabled(slot: any): boolean {
    if (this.changeModeData.bookedSlotIds.includes(slot.slotId)) return true;
    const now = new Date();
    const selectedDateStart = new Date(this.changeModeData.newDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (selectedDateStart.getTime() < todayStart.getTime()) return true;
    if (selectedDateStart.getTime() === todayStart.getTime()) {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      if (slotTime < now) return true;
    }
    return false;
  }

  toggleSlot(slotId: number) {
    const index = this.changeModeData.selectedNewSlotIds.indexOf(slotId);
    if (index > -1) this.changeModeData.selectedNewSlotIds.splice(index, 1);
    else this.changeModeData.selectedNewSlotIds.push(slotId);
    
    this.updatePricePreview();
  }

  updatePricePreview() {
    const pricePerHour = this.selectedField.price || 0;
    const pricePerSlot = pricePerHour / 2;
    this.changeModeData.newTotalPrice = this.changeModeData.selectedNewSlotIds.length * pricePerSlot;
    this.changeModeData.remainingAmount = this.changeModeData.newTotalPrice - this.changeModeData.depositAmount;
  }

  // [CẬP NHẬT] Hàm Submit đổi giờ dùng SweetAlert2
  submitChangeTime() {
    if (this.changeModeData.selectedNewSlotIds.length === 0) {
      Swal.fire('Chưa chọn giờ', 'Vui lòng chọn ít nhất 1 khung giờ mới!', 'warning');
      return;
    }

    const payAtField = this.changeModeData.remainingAmount;
    let htmlContent = `
      <div style="text-align: left; font-size: 1.1em;">
        <p><strong>Ngày mới:</strong> ${this.formatDateLocal(this.changeModeData.newDate)}</p>
        <p><strong>Tổng tiền mới:</strong> ${this.changeModeData.newTotalPrice.toLocaleString()}đ</p>
        <p><strong>Đã cọc (30% cũ):</strong> ${this.changeModeData.depositAmount.toLocaleString()}đ</p>
        <hr>
        <p style="color: ${payAtField > 0 ? '#c0392b' : '#27ae60'}; font-weight: bold; font-size: 1.2em;">
          ${payAtField > 0 ? `KHÁCH CẦN TRẢ THÊM: ${payAtField.toLocaleString()}đ` : `KHÁCH ĐƯỢC HOÀN/DƯ: ${Math.abs(payAtField).toLocaleString()}đ`}
        </p>
      </div>
    `;

    Swal.fire({
      title: 'Xác nhận đổi lịch?',
      html: htmlContent,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận đổi',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#95a5a6'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading khi đang gọi API
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const payload = {
          bookingId: this.changeModeData.booking.bookingId,
          newDate: this.changeModeData.newDate,
          newSlotIds: this.changeModeData.selectedNewSlotIds
        };

        this.bookingService.updateBookingTime(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: 'Đã cập nhật lịch đặt sân mới.',
              timer: 1500,
              showConfirmButton: false
            });
            this.showChangeTimeModal = false;
            this.loadBookings(this.selectedField.fieldId);
          },
          error: (err: any) => {
            Swal.fire('Lỗi', err.error?.message || "Lỗi hệ thống.", 'error');
          }
        });
      }
    });
  }
}