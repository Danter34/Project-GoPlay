import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-time-slot-management',
  templateUrl: './time-slot-management.component.html',
  standalone: false
})
export class TimeSlotManagementComponent implements OnInit {
  timeSlots: any[] = [];
  isLoading = false;
  
  isEditing = false;
  currentId = 0;
  formData = { startTime: '', endTime: '', isActive: true };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadData(); }

  loadData() {
    this.isLoading = true;
    this.adminService.getAllTimeSlots().subscribe({
      next: (res) => { this.timeSlots = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  prepareCreate() {
    this.isEditing = false;
    this.formData = { startTime: '00:00', endTime: '01:00', isActive: true };
  }

  prepareEdit(item: any) {
    this.isEditing = true;
    this.currentId = item.slotId;
    // Format lại giờ để hiện đúng trên input type="time" (HH:mm)
    this.formData = { 
      startTime: item.startTime.substring(0, 5), 
      endTime: item.endTime.substring(0, 5),
      isActive: item.isActive 
    };
  }

  onSubmit() {
    // Thêm giây vào để khớp TimeSpan backend (HH:mm:ss)
    const payload = {
      ...this.formData,
      startTime: this.formData.startTime + ':00',
      endTime: this.formData.endTime + ':00'
    };

    if (this.isEditing) {
      this.adminService.updateTimeSlot(this.currentId, payload).subscribe({
        next: () => { alert('Cập nhật thành công!'); this.loadData(); },
        error: (err) => alert('Lỗi: ' + err.error?.message)
      });
    } else {
      this.adminService.createTimeSlot(payload).subscribe({
        next: () => { alert('Thêm mới thành công!'); this.loadData(); },
        error: (err) => alert('Lỗi: ' + err.error?.message)
      });
    }
  }

  deleteItem(id: number) {
    if (confirm('Xóa khung giờ này?')) {
      this.adminService.deleteTimeSlot(id).subscribe({
        next: () => { alert('Đã xóa!'); this.loadData(); },
        error: (err) => alert('Lỗi xóa: ' + err.error?.message)
      });
    }
  }
}