import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
    this.isLoading = true;
    this.auth.login(this.model).subscribe({
      next: (res) => {
        // Token đã được lưu trong Service
        this.router.navigate(['/']); // Về trang chủ
      },
      error: (err) => {
        alert('Đăng nhập thất bại! Kiểm tra lại email hoặc mật khẩu.');
        this.isLoading = false;
      }
    });
  }
}