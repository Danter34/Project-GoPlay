import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  model = { email: '', password: '' };
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    // 1. Validate: Kiểm tra thông tin bắt buộc
    if (!this.model.email || !this.model.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập Email và Mật khẩu!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    this.isLoading = true;

    // 2. Hiển thị Loading
    Swal.fire({
      title: 'Đang đăng nhập...',
      text: 'Vui lòng chờ trong giây lát',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 3. Gọi Service
    this.auth.login(this.model).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Popup Thành công & Chuyển trang
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: 'Chào mừng bạn quay trở lại.',
          timer: 1500, // Tự tắt sau 1.5 giây
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']); // Về trang chủ
        });
      },
      error: (err) => {
        this.isLoading = false;

        // Popup Lỗi
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: err.error?.message || 'Email hoặc mật khẩu không chính xác.',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }
}