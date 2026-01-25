import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-sport-type-management',
  templateUrl: './sport-type-management.component.html',
  standalone: false
})
export class SportTypeManagementComponent implements OnInit {
  sportTypes: any[] = [];
  isLoading = false;
  
  // Biến form
  isEditing = false;
  currentId = 0;
  formData = { sportName: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getAllSportTypes().subscribe({
      next: (res) => { this.sportTypes = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  // Chuẩn bị thêm mới
  prepareCreate() {
    this.isEditing = false;
    this.formData = { sportName: '' };
  }

  // Chuẩn bị sửa
  prepareEdit(item: any) {
    this.isEditing = true;
    this.currentId = item.sportTypeId;
    this.formData = { sportName: item.sportName };
  }

  // Submit Form (Thêm hoặc Sửa)
  onSubmit() {
    if (!this.formData.sportName.trim()) { alert('Vui lòng nhập tên môn!'); return; }

    if (this.isEditing) {
      this.adminService.updateSportType(this.currentId, this.formData).subscribe({
        next: () => { alert('Cập nhật thành công!'); this.loadData(); },
        error: (err) => alert('Lỗi: ' + err.error?.message)
      });
    } else {
      this.adminService.createSportType(this.formData).subscribe({
        next: () => { alert('Thêm mới thành công!'); this.loadData(); },
        error: (err) => alert('Lỗi: ' + err.error?.message)
      });
    }
  }

  deleteItem(id: number) {
    if (confirm('Xóa môn thể thao này? (Lưu ý: Không thể xóa nếu đã có sân sử dụng)')) {
      this.adminService.deleteSportType(id).subscribe({
        next: () => { alert('Đã xóa!'); this.loadData(); },
        error: (err) => alert('Lỗi xóa: ' + (err.error?.message || 'Đang có sân sử dụng môn này.'))
      });
    }
  }
}