import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';


import Swal from 'sweetalert2';

@Component({
  selector: 'app-approve-owner',
  templateUrl: './approve-owner.component.html',
  styleUrls: ['./approve-owner.component.css'],
  standalone: false
})
export class ApproveOwnerComponent implements OnInit {
  pendingList: any[] = [];
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending() {
    this.isLoading = true;
    this.adminService.getPendingOwners().subscribe({
      next: (res) => { this.pendingList = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  // Duyệt hồ sơ
  approve(id: number) {
    Swal.fire({
      title: 'Xác nhận DUYỆT?',
      text: "User này sẽ chính thức trở thành Đối Tác (Chủ Sân) và có quyền đăng sân lên hệ thống.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60', // Màu xanh lá
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Duyệt ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Hiện Loading
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.adminService.approveOwner(id).subscribe({
          next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã duyệt hồ sơ chủ sân.',
                timer: 1500,
                showConfirmButton: false
            });
            this.loadPending();
          },
          error: (err) => {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.error?.message || 'Có lỗi xảy ra khi duyệt.',
                confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }

  // [CẬP NHẬT] Từ chối hồ sơ
  reject(id: number) {
    Swal.fire({
      title: 'Từ chối hồ sơ?',
      text: "Hành động này sẽ hủy yêu cầu đăng ký của User. Bạn có chắc chắn không?",
      icon: 'warning', // Icon cảnh báo
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // Màu đỏ báo hiệu hành động phủ định
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Hiện Loading
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.adminService.rejectOwner(id).subscribe({
          next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Đã từ chối!',
                text: 'Hồ sơ đã bị loại bỏ.',
                timer: 1500,
                showConfirmButton: false
            });
            this.loadPending();
          },
          error: (err) => {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.error?.message || 'Có lỗi xảy ra khi từ chối.',
                confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }
}