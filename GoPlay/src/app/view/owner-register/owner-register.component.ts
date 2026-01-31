import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-owner-register',
  templateUrl: './owner-register.component.html',
  styleUrls: ['./owner-register.component.css'],
  standalone: false
})
export class OwnerRegisterComponent implements OnInit {
  model = {
    businessName: '',
    phone: '',
    identityNumber: '',
    taxCode: ''
  };
  isLoading = false;
  
  currentUser: any = null;
  isUsingUserPhone = false;

  constructor(
    private ownerService: OwnerService, 
    private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onUseUserPhoneChange() {
    if (this.isUsingUserPhone) {
      if (this.currentUser && this.currentUser.phone) {
        this.model.phone = this.currentUser.phone;
      } else {
        // [MỚI] Thay alert bằng Swal thông báo nhẹ nhàng
        Swal.fire({
          icon: 'info',
          title: 'Thông tin chưa đầy đủ',
          text: 'Tài khoản của bạn chưa cập nhật số điện thoại.',
          confirmButtonText: 'Đã hiểu',
          confirmButtonColor: '#3498db'
        });
        this.isUsingUserPhone = false; 
      }
    } else {
      this.model.phone = '';
    }
  }

  onSubmit() {
    // 1. Validate Form: Kiểm tra dữ liệu bắt buộc
    if (!this.model.businessName || !this.model.phone || !this.model.identityNumber) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng điền đầy đủ Tên doanh nghiệp, SĐT và CMND/CCCD.',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    this.isLoading = true;

    // 2. Gọi API đăng ký
    this.ownerService.registerOwner(this.model).subscribe({
      next: (res) => {
        this.isLoading = false;
        

        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Hồ sơ chủ sân của bạn đã được tạo. Đang chuyển về trang chủ...',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        

        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }
}