import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css'],
  standalone: false
})
export class BookingListComponent implements OnInit {
  // Dữ liệu chính
  myFields: any[] = [];
  bookings: any[] = [];
  selectedField: any = null;
  isLoading = false;

  // --- LOGIC ĐỔI GIỜ NÂNG CAO ---
  showChangeTimeModal = false;
  changeModeData: any = {
    booking: null,
    newDate: '',       // Ngày mới chọn (Format YYYY-MM-DD để gán vào input type=date)
    slots: [],         // Danh sách tất cả slot hệ thống
    bookedSlotIds: [], // Các slot bị người khác đặt (để bôi xám)
    selectedNewSlotIds: [], // Các slot mình đang chọn
    oldPrice: 0,
    newPrice: 0,
    diffPrice: 0       // Tiền chênh lệch
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadOwnerFields();
    // Load danh sách khung giờ hệ thống 1 lần duy nhất
    this.bookingService.getAllTimeSlots().subscribe(data => {
      this.changeModeData.slots = data;
    });
  }

  // --- HÀM HELPER MỚI ĐỂ XỬ LÝ NGÀY THÁNG VIỆT NAM ---
  // Chuyển đổi Date object thành chuỗi "YYYY-MM-DD" theo giờ địa phương (không bị lùi ngày)
  formatDateLocal(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Thêm số 0 nếu tháng < 10
    const day = ('0' + date.getDate()).slice(-2);          // Thêm số 0 nếu ngày < 10
    return `${year}-${month}-${day}`;
  }

  // ... Các hàm loadOwnerFields, onSelectField, loadBookings, backToFields, updateStatus GIỮ NGUYÊN ...
  loadOwnerFields() {
    this.isLoading = true;
    this.bookingService.getOwnerFields().subscribe({
      next: (res) => { this.myFields = res.items || []; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
  onSelectField(field: any) { this.selectedField = field; this.loadBookings(field.fieldId); }
  loadBookings(fieldId: number) {
    this.isLoading = true;
    this.bookingService.getBookingsByField(fieldId).subscribe({
      next: (res) => { this.bookings = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
  backToFields() { this.selectedField = null; this.bookings = []; }
  updateStatus(id: number, newStatus: string) {
      if(!confirm('Xác nhận cập nhật trạng thái?')) return;
      this.bookingService.updateBookingStatus(id, newStatus).subscribe({
          next: () => { alert('Thành công!'); this.loadBookings(this.selectedField.fieldId); },
          error: (err) => alert('Lỗi: ' + err.error?.message)
      });
  }

  // --- LOGIC MODAL ĐỔI GIỜ ---

  // 1. Mở Modal
  openChangeTimeModal(booking: any) {
    this.changeModeData.booking = booking;
    
    // [SỬA LẠI CHỖ NÀY] Sử dụng hàm formatDateLocal thay vì toISOString()
    this.changeModeData.newDate = this.formatDateLocal(booking.bookingDate);
    
    this.changeModeData.selectedNewSlotIds = []; // Reset chọn
    this.changeModeData.oldPrice = booking.totalPrice;
    this.changeModeData.newPrice = 0;
    this.changeModeData.diffPrice = 0;

    // Load các slot đã bị đặt trong ngày đó
    this.loadBookedSlotsForDate();
    this.showChangeTimeModal = true;
  }

  // 2. Khi chủ sân đổi ngày trên lịch
  onDateChange(event: any) {
    this.changeModeData.newDate = event.target.value;
    this.changeModeData.selectedNewSlotIds = []; // Reset chọn slot khi đổi ngày
    this.updatePricePreview();
    this.loadBookedSlotsForDate();
  }

  // 3. Gọi API lấy danh sách slot đã bị đặt (để bôi xám)
  loadBookedSlotsForDate() {
    if (!this.selectedField) return;
    
    const date = this.changeModeData.newDate;
    // Gọi API check xem ngày đó sân này slot nào đã có người chốt
    this.bookingService.getBookedSlots(this.selectedField.fieldId, date)
      .subscribe(bookedIds => {
        this.changeModeData.bookedSlotIds = bookedIds || [];
      });
  }

  // 4. Hàm check xem slot có bị khóa không (Màu xám)
  isSlotDisabled(slot: any): boolean {
    // A. Check nếu đã bị người khác đặt
    if (this.changeModeData.bookedSlotIds.includes(slot.slotId)) {
       return true; 
    }

    // B. Check quá khứ (Cập nhật logic so sánh ngày giờ địa phương)
    const now = new Date(); // Thời điểm hiện tại
    
    // Tạo Date object từ chuỗi YYYY-MM-DD đang chọn (lúc 00:00:00 giờ địa phương)
    const selectedDateStart = new Date(this.changeModeData.newDate);
    // Reset giờ về 0 để so sánh chuẩn
    selectedDateStart.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Nếu ngày chọn < ngày hôm nay -> Disable (Quá khứ)
    if (selectedDateStart.getTime() < todayStart.getTime()) return true;

    // Nếu ngày chọn > ngày hôm nay -> OK (Tương lai), chỉ cần check A ở trên
    if (selectedDateStart.getTime() > todayStart.getTime()) return false;

    // Nếu BẰNG ngày hôm nay -> Check tiếp giờ
    if (selectedDateStart.getTime() === todayStart.getTime()) {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      
      // Tạo thời điểm của slot trong ngày hôm nay
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      
      // Nếu giờ slot < giờ hiện tại -> Disable
      if (slotTime < now) return true; 
    }

    return false;
  }

  // 5. Chọn / Bỏ chọn Slot
  toggleSlot(slotId: number) {
    const index = this.changeModeData.selectedNewSlotIds.indexOf(slotId);
    if (index > -1) {
      this.changeModeData.selectedNewSlotIds.splice(index, 1);
    } else {
      this.changeModeData.selectedNewSlotIds.push(slotId);
    }
    this.updatePricePreview();
  }

  // 6. Tính tiền chênh lệch
  updatePricePreview() {
    // Giả sử giá sân nằm trong selectedField.price
    const pricePerSlot = this.selectedField.price || 0; 
    
    this.changeModeData.newPrice = this.changeModeData.selectedNewSlotIds.length * pricePerSlot;
    this.changeModeData.diffPrice = this.changeModeData.newPrice - this.changeModeData.oldPrice;
  }

  // 7. Lấy ngày hiện tại (để chặn chọn quá khứ ở datepicker)
  getCurrentDateString(): string {
    // [SỬA LẠI CHỖ NÀY] Sử dụng hàm formatDateLocal thay vì toISOString()
    return this.formatDateLocal(new Date());
  }

  // 8. Submit
  submitChangeTime() {
    if (this.changeModeData.selectedNewSlotIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 khung giờ mới!");
      return;
    }

    // Cảnh báo tiền nong
    if (this.changeModeData.diffPrice > 0) {
      const diff = this.changeModeData.diffPrice.toLocaleString();
      if (!confirm(`Khách cần thanh toán thêm: ${diff}đ.\nBạn đã thu tiền chưa?`)) return;
    }

    const payload = {
      bookingId: this.changeModeData.booking.bookingId,
      newDate: this.changeModeData.newDate,
      newSlotIds: this.changeModeData.selectedNewSlotIds
    };

    this.bookingService.updateBookingTime(payload).subscribe({
      next: () => {
        alert("Cập nhật thành công!");
        this.showChangeTimeModal = false;
        this.loadBookings(this.selectedField.fieldId);
      },
      error: (err) => alert("Lỗi: " + (err.error?.message || "Khung giờ bị trùng hoặc lỗi hệ thống."))
    });
  }
}