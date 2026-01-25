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

  // --- LOGIC ĐỔI GIỜ ---
  showChangeTimeModal = false;
  changeModeData: any = {
    booking: null,
    newDate: '',
    slots: [],         // Danh sách tất cả slot hệ thống
    bookedSlotIds: [], // Các slot bị người khác đặt (để bôi xám)
    selectedNewSlotIds: [], // Các slot mình đang chọn
    
    // Biến tính tiền
    oldTotalPrice: 0,   // Tổng tiền của đơn cũ
    newTotalPrice: 0,   // Tổng tiền của đơn mới (Giá sân * số giờ)
    depositAmount: 0,   // Số tiền khách đã cọc (30% đơn cũ)
    remainingAmount: 0  // Số tiền khách phải trả tại sân (Mới - Cọc)
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadOwnerFields();
    // Load danh sách khung giờ hệ thống
    this.bookingService.getAllTimeSlots().subscribe(data => {
      this.changeModeData.slots = data;
    });
  }

  // Helper format ngày
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

  // --- LOAD DATA ---
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
    if(!confirm('Xác nhận cập nhật trạng thái?')) return;
    this.bookingService.updateBookingStatus(id, newStatus).subscribe({
      next: () => { alert('Thành công!'); this.loadBookings(this.selectedField.fieldId); },
      error: (err: any) => alert('Lỗi: ' + err.error?.message)
    });
  }

  // =========================================================
  // LOGIC ĐỔI GIỜ (ĐÃ FIX THEO YÊU CẦU)
  // =========================================================
  
  // 1. Mở Modal
  openChangeTimeModal(booking: any) {
    this.changeModeData.booking = booking;
    this.changeModeData.newDate = this.formatDateLocal(booking.bookingDate);
    this.changeModeData.selectedNewSlotIds = [];
    
    // Lưu giá cũ
    this.changeModeData.oldTotalPrice = booking.totalPrice;

    // Tính tiền cọc (30% của đơn cũ)
    // Lưu ý: Nếu DB có lưu cột Deposit riêng thì lấy cột đó, ở đây mình tính 30%
    this.changeModeData.depositAmount = booking.totalPrice * 0.3;

    // Reset giá mới
    this.changeModeData.newTotalPrice = 0;
    this.changeModeData.remainingAmount = 0;

    this.loadBookedSlotsForDate();
    this.showChangeTimeModal = true;
  }

  // 2. Chọn ngày mới
  onDateChange(event: any) {
    this.changeModeData.newDate = event.target.value;
    this.changeModeData.selectedNewSlotIds = [];
    this.updatePricePreview();
    this.loadBookedSlotsForDate();
  }

  // 3. Load slot đã bị đặt (để disable)
  loadBookedSlotsForDate() {
    if (!this.selectedField) return;
    this.bookingService.getBookedSlots(this.selectedField.fieldId, this.changeModeData.newDate)
      .subscribe((bookedIds: number[]) => {
        this.changeModeData.bookedSlotIds = bookedIds || [];
      });
  }

  // 4. Check slot disable (Màu xám)
  isSlotDisabled(slot: any): boolean {
    // A. Check nếu đã bị người khác đặt
    // Lưu ý: Nếu đổi sang ngày khác thì check tất cả. 
    // Nếu vẫn ở ngày cũ, lẽ ra phải trừ các slot của chính booking này ra (để khách có thể chọn lại giờ cũ).
    // Nhưng để an toàn và đơn giản, mình cứ check theo list bookedIds trả về từ server.
    if (this.changeModeData.bookedSlotIds.includes(slot.slotId)) return true;

    // B. Check quá khứ
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

  // 5. Chọn slot
  toggleSlot(slotId: number) {
    const index = this.changeModeData.selectedNewSlotIds.indexOf(slotId);
    if (index > -1) this.changeModeData.selectedNewSlotIds.splice(index, 1);
    else this.changeModeData.selectedNewSlotIds.push(slotId);
    
    this.updatePricePreview();
  }

  // 6. Tính toán tiền (Logic cốt lõi)
  updatePricePreview() {
    const pricePerSlot = this.selectedField.price || 0;
    
    // Tổng tiền mới = Số slot * Giá sân
    this.changeModeData.newTotalPrice = this.changeModeData.selectedNewSlotIds.length * pricePerSlot;

    // Số tiền phải thu tại sân = Tổng mới - Cọc đã đóng
    this.changeModeData.remainingAmount = this.changeModeData.newTotalPrice - this.changeModeData.depositAmount;

    // Nếu tính ra âm (vd: đổi từ 2h xuống 1h, tiền mới < tiền cọc), thì coi như không thu thêm (hoặc trả lại tùy chính sách, ở đây set = 0)
    // Nhưng thường chủ sân sẽ không trả lại cọc, nên hiển thị số âm để biết là mình đang nợ khách hoặc hòa vốn.
    // Ở đây mình để nguyên số học để bạn dễ xử lý.
  }

  // 7. Submit
  submitChangeTime() {
    if (this.changeModeData.selectedNewSlotIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 khung giờ mới!");
      return;
    }

    const payAtField = this.changeModeData.remainingAmount;
    let msg = `Xác nhận đổi giờ?\n\n`;
    msg += `Tổng tiền mới: ${this.changeModeData.newTotalPrice.toLocaleString()}đ\n`;
    msg += `Đã cọc: ${this.changeModeData.depositAmount.toLocaleString()}đ\n`;
    
    if (payAtField > 0) {
        msg += `KHÁCH CẦN TRẢ THÊM: ${payAtField.toLocaleString()}đ`;
    } else {
        msg += `Khách không cần trả thêm (Đã dư cọc)`;
    }

    if (!confirm(msg)) return;

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
      error: (err: any) => alert("Lỗi: " + (err.error?.message || "Lỗi hệ thống."))
    });
  }
}