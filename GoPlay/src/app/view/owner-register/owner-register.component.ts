import { Component, OnInit } from '@angular/core'; // Thêm OnInit
import { Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth.service'; // 1. Import AuthService

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
  
  // Biến lưu thông tin user hiện tại
  currentUser: any = null;
  // Biến trạng thái checkbox
  isUsingUserPhone = false;

  constructor(
    private ownerService: OwnerService, 
    private router: Router,
    private authService: AuthService // 2. Inject AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // 4. Hàm xử lý khi tick vào checkbox
  onUseUserPhoneChange() {
    if (this.isUsingUserPhone) {
      if (this.currentUser && this.currentUser.phone) {
        this.model.phone = this.currentUser.phone;
      } else {
        alert('Tài khoản của bạn chưa cập nhật số điện thoại.');
        this.isUsingUserPhone = false; // Bỏ tick nếu không có sđt
      }
    } else {
      this.model.phone = '';
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.ownerService.registerOwner(this.model).subscribe({
      next: (res) => {
        alert('Đăng ký hồ sơ thành công! Đang chuyển về trang chủ...');
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Có lỗi xảy ra.'));
        this.isLoading = false;
      }
    });
  }
}