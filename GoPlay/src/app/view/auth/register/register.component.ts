import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  model = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // 1. Validate: Kiểm tra thông tin bắt buộc
    if (!this.model.fullName || !this.model.email || !this.model.password || !this.model.phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ họ tên, email, số điện thoại và mật khẩu!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // 2. Validate: Kiểm tra khớp mật khẩu
    if (this.model.password !== this.model.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Mật khẩu không khớp',
        text: 'Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại!',
        confirmButtonColor: '#e74c3c'
      });
      return;
    }

    // 3. Hiển thị Loading
    this.isLoading = true;
    Swal.fire({
      title: 'Đang đăng ký...',
      text: 'Vui lòng chờ trong giây lát',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // 4. Gọi Service
    this.authService.register(this.model).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Popup Thành công -> Chuyển sang Login
        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Tài khoản đã được tạo. Chuyển đến trang đăng nhập...',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        
        // Popup Lỗi
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: err.error?.message || 'Email hoặc số điện thoại có thể đã tồn tại.',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }
}