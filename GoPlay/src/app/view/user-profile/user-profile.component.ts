import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  // Chức năng Khởi tạo biến
  user: UserProfile | null = null;
  isLoading = false;
  isEditMode = false;
  
  // Chức năng Popup Mật khẩu
  showPasswordModal = false;
  passData = { currentPassword: '', newPassword: '', confirmNewPassword: '' };

  // Chức năng Biến form sửa
  editData = {
    fullName: '',
    email: '',
    phone: ''
  };

  constructor(private authService: AuthService) {}

  // Chức năng Load Profile
  ngOnInit(): void {
    this.loadProfile();
  }

  // Chức năng Gọi API lấy thông tin
  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.resetEditData();
        this.isLoading = false;
      },
      error: (err) => { this.isLoading = false; }
    });
  }

  // Chức năng Reset dữ liệu edit về giống user hiện tại
  resetEditData() {
    if (this.user) {
      this.editData = {
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone || ''
      };
    }
  }

  // Chức năng Bật/Tắt chế độ sửa
  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) this.resetEditData();
  }

  // Chức năng Submit form Update Profile
  onSubmit() {
    if (!this.editData.fullName || !this.editData.email) {
      alert("Họ tên và Email không được để trống");
      return;
    }
    this.isLoading = true;
    this.authService.updateProfile(this.editData).subscribe({
      next: (res) => {
        alert("Cập nhật hồ sơ thành công!");
        this.isEditMode = false;
        this.loadProfile(); 
      },
      error: (err) => {
        const msg = err.error || "Lỗi cập nhật hồ sơ";
        alert(msg);
        this.isLoading = false;
      }
    });
  }

  // Chức năng Mở Modal Pass
  openPassModal() { 
      this.showPasswordModal = true; 
      this.passData = { currentPassword: '', newPassword: '', confirmNewPassword: '' }; 
  }
  
  // Chức năng Đóng Modal Pass
  closePassModal() { this.showPasswordModal = false; }
  
  // Chức năng Đổi mật khẩu
  onChangePassword() {
    if (this.passData.newPassword !== this.passData.confirmNewPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    
    this.authService.changePassword(this.passData).subscribe({
      next: () => { 
          alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại."); 
          this.closePassModal();
          this.authService.logout();
      },
      error: (err) => { alert("Lỗi: " + (err.error || "Sai mật khẩu cũ")); }
    });
  }
}