import { Component, OnInit } from '@angular/core';
import { OwnerService } from '../../../services/owner.service';
import { OwnerProfile } from '../../../models/owner-profile.model';

@Component({
  selector: 'app-owner-profile',
  templateUrl: './owner-profile.component.html',
  styleUrls: ['./owner-profile.component.css'],
  standalone: false
})
export class OwnerProfileComponent implements OnInit {
  profile: OwnerProfile | null = null;
  isLoading = false;
  isEditMode = false;

  // [SỬA] Thêm identityNumber vào biến tạm
  editData = {
    businessName: '',
    phone: '',
    taxCode: '',
    identityNumber: '' 
  };

  constructor(private ownerService: OwnerService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.ownerService.getOwnerProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.isLoading = false;
        this.resetEditData();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // [SỬA] Map cả IdentityNumber vào editData (dù không sửa nhưng vẫn phải gửi đi)
  resetEditData() {
    if (this.profile) {
      this.editData = {
        businessName: this.profile.businessName,
        phone: this.profile.phone,
        taxCode: this.profile.taxCode || '',
        identityNumber: this.profile.identityNumber // <-- QUAN TRỌNG
      };
    }
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.resetEditData(); 
    }
  }

  onSubmit() {
    if (!this.profile) return;
    
    if (!this.editData.businessName || !this.editData.phone) {
        alert("Vui lòng nhập Tên doanh nghiệp và SĐT");
        return;
    }

    this.isLoading = true;
    // Gọi API update
    this.ownerService.updateOwnerProfile(this.profile.ownerProfileId, this.editData)
      .subscribe({
        next: () => {
          alert('Cập nhật hồ sơ thành công!');
          this.isEditMode = false;
          this.loadProfile(); 
        },
        error: (err) => {
          console.error(err);
          // In lỗi chi tiết ra alert để dễ debug
          const msg = err.error?.title || 'Lỗi cập nhật hồ sơ';
          alert(msg);
          this.isLoading = false;
        }
      });
  }
}