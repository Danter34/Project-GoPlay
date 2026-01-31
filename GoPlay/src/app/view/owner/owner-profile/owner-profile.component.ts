import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../../services/owner.service';
import { OwnerProfile } from '../../../models/owner-profile.model';


import Swal from 'sweetalert2';

@Component({
  selector: 'app-owner-profile',
  templateUrl: './owner-profile.component.html',
  styleUrls: ['./owner-profile.component.css'],
  standalone: false
})
export class OwnerProfileComponent implements OnInit {
  profile: OwnerProfile | null = null;
  isLoading = false;
  isEditMode = false;

  editData = {
    businessName: '',
    phone: '',
    taxCode: '',
    identityNumber: '' 
  };

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.ownerService.getOwnerProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.isLoading = false;
        this.resetEditData();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        Swal.fire('Lỗi', 'Không thể tải thông tin hồ sơ', 'error');
      }
    });
  }

  resetEditData() {
    if (this.profile) {
      this.editData = {
        businessName: this.profile.businessName,
        phone: this.profile.phone,
        taxCode: this.profile.taxCode || '',
        identityNumber: this.profile.identityNumber
      };
    }
  }

  toggleEdit() {
    // Nếu đang ở chế độ sửa mà bấm hủy -> Hỏi xác nhận nếu đã nhập dữ liệu (Optional)
    if (this.isEditMode) {
        this.isEditMode = false;
        this.resetEditData();
    } else {
        this.isEditMode = true;
    }
  }

  onSubmit() {
    if (!this.profile) return;
    
    // 1. Validate dữ liệu
    if (!this.editData.businessName || !this.editData.phone) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập Tên doanh nghiệp và Số điện thoại!',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    // 2. Hỏi xác nhận trước khi lưu
    Swal.fire({
        title: 'Xác nhận thay đổi?',
        text: "Bạn có chắc chắn muốn cập nhật thông tin hồ sơ?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Lưu thay đổi',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            this.performUpdate();
        }
    });
  }

  // Tách hàm xử lý API riêng để code gọn hơn
  performUpdate() {
    // Hiện loading popup
    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    this.isLoading = true;

    // Gọi API update

    this.ownerService.updateOwnerProfile(this.profile!.ownerProfileId, this.editData)
      .subscribe({
        next: () => {
          this.isLoading = false;
          
          // Thông báo thành công
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Hồ sơ đã được cập nhật.',
            timer: 2000,
            showConfirmButton: false
          });

          this.isEditMode = false;
          this.loadProfile(); // Load lại dữ liệu mới nhất
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          
          // Thông báo lỗi chi tiết từ Server
          const msg = err.error?.message || err.error?.title || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
          
          Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại',
            text: msg,
            confirmButtonColor: '#e74c3c'
          });
        }
      });
  }
}