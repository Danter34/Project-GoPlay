import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sport-type-management',
  templateUrl: './sport-type-management.component.html',
  standalone: false
})
export class SportTypeManagementComponent implements OnInit {
  sportTypes: any[] = [];
  isLoading = false;
  
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

  prepareCreate() {
    this.isEditing = false;
    this.formData = { sportName: '' };
  }

  prepareEdit(item: any) {
    this.isEditing = true;
    this.currentId = item.sportTypeId;
    this.formData = { sportName: item.sportName };
  }


  onSubmit() {
    // 1. Validate: Kiểm tra rỗng
    if (!this.formData.sportName.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập tên môn thể thao!',
            confirmButtonColor: '#f39c12'
        });
        return; 
    }

    // 2. Hiện Loading
    Swal.fire({
        title: this.isEditing ? 'Đang cập nhật...' : 'Đang thêm mới...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // Hàm xử lý thành công
    const handleSuccess = (msg: string) => {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: msg,
            timer: 1500,
            showConfirmButton: false
        });
        this.loadData();
        this.formData = { sportName: '' }; 
    };

    // Hàm xử lý lỗi
    const handleError = (err: any) => {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Có lỗi xảy ra.',
            confirmButtonColor: '#e74c3c'
        });
    };

    if (this.isEditing) {
      this.adminService.updateSportType(this.currentId, this.formData).subscribe({
        next: () => handleSuccess('Cập nhật tên môn thành công!'),
        error: handleError
      });
    } else {
      this.adminService.createSportType(this.formData).subscribe({
        next: () => handleSuccess('Thêm môn thể thao mới thành công!'),
        error: handleError
      });
    }
  }

  deleteItem(id: number) {
    Swal.fire({
      title: 'Xóa môn thể thao?',
      text: "CẢNH BÁO: Bạn không thể xóa môn này nếu đã có sân đang sử dụng nó. Bạn có chắc chắn muốn thử?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // Màu đỏ
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Hiện Loading
        Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.adminService.deleteSportType(id).subscribe({
          next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Môn thể thao đã được xóa khỏi hệ thống.',
                timer: 1500,
                showConfirmButton: false
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
                icon: 'error',
                title: 'Không thể xóa',
                text: err.error?.message || 'Đang có sân bãi thuộc môn thể thao này. Vui lòng xóa sân trước.',
                confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }
}