import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

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
    this.formData = { 
      startTime: item.startTime.substring(0, 5), 
      endTime: item.endTime.substring(0, 5),
      isActive: item.isActive 
    };
  }

  onSubmit() {
    // 1. Validate: Kiểm tra xem đã nhập giờ chưa
    if (!this.formData.startTime || !this.formData.endTime) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng chọn giờ bắt đầu và giờ kết thúc!',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    // 2. Validate: Giờ kết thúc phải lớn hơn giờ bắt đầu
    if (this.formData.startTime >= this.formData.endTime) {
        Swal.fire({
            icon: 'error',
            title: 'Giờ không hợp lệ',
            text: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.',
            confirmButtonColor: '#e74c3c'
        });
        return;
    }

    // Chuẩn bị payload
    const payload = {
      ...this.formData,
      startTime: this.formData.startTime + ':00',
      endTime: this.formData.endTime + ':00'
    };

    // 3. Hiện Loading
    Swal.fire({
        title: this.isEditing ? 'Đang cập nhật...' : 'Đang thêm mới...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // Hàm xử lý chung cho Success
    const handleSuccess = (msg: string) => {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: msg,
            timer: 1500,
            showConfirmButton: false
        });
        this.loadData();
       
    };

    // Hàm xử lý chung cho Error
    const handleError = (err: any) => {
        Swal.fire({
            icon: 'error',
            title: 'Thất bại',
            text: err.error?.message || 'Có lỗi xảy ra.',
            confirmButtonColor: '#e74c3c'
        });
    };

    if (this.isEditing) {
      this.adminService.updateTimeSlot(this.currentId, payload).subscribe({
        next: () => handleSuccess('Cập nhật khung giờ thành công!'),
        error: handleError
      });
    } else {
      this.adminService.createTimeSlot(payload).subscribe({
        next: () => handleSuccess('Thêm khung giờ mới thành công!'),
        error: handleError
      });
    }
  }

  // [CẬP NHẬT] Xóa dùng SweetAlert2
  deleteItem(id: number) {
    Swal.fire({
      title: 'Xóa khung giờ?',
      text: "Hành động này sẽ xóa khung giờ khỏi hệ thống đặt sân.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        
        Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.adminService.deleteTimeSlot(id).subscribe({
          next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Khung giờ đã được xóa.',
                timer: 1500,
                showConfirmButton: false
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.error?.message || 'Không thể xóa khung giờ này (Có thể đang được sử dụng).',
                confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }
}