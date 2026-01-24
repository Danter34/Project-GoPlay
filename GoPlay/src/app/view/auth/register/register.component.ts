import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone : false
})
export class RegisterComponent {
  // Thêm trường phone vào model
  model = {
    fullName: '',
    email: '',
    phone: '', // <--- MỚI
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.model.password !== this.model.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    this.isLoading = true;
    
    // Gọi service đăng ký
    this.authService.register(this.model).subscribe({
      next: (res) => {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  }
}