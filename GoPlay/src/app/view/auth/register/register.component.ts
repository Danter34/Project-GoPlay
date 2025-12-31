import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
    password: '',
    confirmPassword: ''
  };
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.model.password !== this.model.confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    this.isLoading = true;
    this.auth.register(this.model).subscribe({
      next: (res) => {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Lỗi đăng ký: ' + (err.error || 'Email đã tồn tại'));
        this.isLoading = false;
      }
    });
  }
}