import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user-profile.model';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  user: UserProfile | null = null;
  isLoading = false;
  isEditMode = false;
  
  showPasswordModal = false;
  passData = { currentPassword: '', newPassword: '', confirmNewPassword: '' };

  editData = {
    fullName: '',
    email: '',
    phone: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.resetEditData();
        this.isLoading = false;
      },
      error: (err) => { 
        this.isLoading = false; 
        console.error(err);
      }
    });
  }

  resetEditData() {
    if (this.user) {
      this.editData = {
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone || ''
      };
    }
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) this.resetEditData();
  }

  // [CẬP NHẬT] Submit Update Profile
  onSubmit() {
    // 1. Validate
    if (!this.editData.fullName || !this.editData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Họ tên và Email không được để trống!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // 2. Hỏi xác nhận
    Swal.fire({
      title: 'Lưu thay đổi?',
      text: "Thông tin hồ sơ của bạn sẽ được cập nhật.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Lưu ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Hiện Loading
        Swal.fire({
            title: 'Đang cập nhật...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.isLoading = true;
        this.authService.updateProfile(this.editData).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: 'Cập nhật hồ sơ thành công!',
              timer: 1500,
              showConfirmButton: false
            });
            this.isEditMode = false;
            this.loadProfile(); 
          },
          error: (err) => {
            this.isLoading = false;
            const msg = err.error || "Lỗi cập nhật hồ sơ";
            Swal.fire({
              icon: 'error',
              title: 'Thất bại',
              text: msg,
              confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }

  openPassModal() { 
      this.showPasswordModal = true; 
      this.passData = { currentPassword: '', newPassword: '', confirmNewPassword: '' }; 
  }
  
  closePassModal() { this.showPasswordModal = false; }
  
  // [CẬP NHẬT] Đổi mật khẩu
  onChangePassword() {
    // 1. Validate
    if (!this.passData.currentPassword || !this.passData.newPassword) {
       Swal.fire('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường', 'warning');
       return;
    }

    if (this.passData.newPassword !== this.passData.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Mật khẩu không khớp',
        text: 'Mật khẩu xác nhận không trùng khớp.',
        confirmButtonColor: '#e74c3c'
      });
      return;
    }
    
    // 2. Hiện Loading
    Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    this.authService.changePassword(this.passData).subscribe({
      next: () => { 
         
          Swal.fire({
            icon: 'success',
            title: 'Đổi mật khẩu thành công!',
            text: 'Vui lòng đăng nhập lại để tiếp tục.',
            confirmButtonText: 'Đăng nhập lại',
            allowOutsideClick: false
          }).then(() => {
             this.closePassModal();
             this.authService.logout(); 
          });
      },
      error: (err) => { 
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.error?.message || "Mật khẩu cũ không đúng hoặc có lỗi hệ thống.",
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }
}