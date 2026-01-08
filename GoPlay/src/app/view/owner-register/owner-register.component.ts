import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-owner-register',
  templateUrl: './owner-register.component.html',
  styleUrls: ['./owner-register.component.css'],
  standalone: false
})
export class OwnerRegisterComponent {
  model = {
    businessName: '',
    phone: '',
    identityNumber: '',
    taxCode: ''
  };
  isLoading = false;

  constructor(private ownerService: OwnerService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.ownerService.registerOwner(this.model).subscribe({
      next: (res) => {
        alert('Đăng ký hồ sơ thành công! Đang chuyển về trang chủ...');
        this.router.navigate(['/']); // Về trang chủ theo yêu cầu
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Có lỗi xảy ra.'));
        this.isLoading = false;
      }
    });
  }
}