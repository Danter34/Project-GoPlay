import { Component, OnInit } from '@angular/core';
import { OwnerFieldService } from '../../../services/owner-field.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css'],
  standalone: false
})
export class OwnerDashboardComponent implements OnInit {
  fields: any[] = [];
  totalItems = 0;
  page = 1;
  pageSize = 10;
  isLoading = false;

  constructor(private fieldService: OwnerFieldService) {}

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields() {
    this.isLoading = true;
    this.fieldService.getMyFields(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.fields = res.items;
        this.totalItems = res.totalItems;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }


  onDelete(id: number) {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Hành động này sẽ xóa sân vĩnh viễn và không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', 
      cancelButtonColor: '#95a5a6', 
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Đang xử lý...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.fieldService.deleteField(id).subscribe({
          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Đã xóa!',
              text: 'Sân bóng đã được xóa thành công.',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadFields(); // Tải lại danh sách
          },
          error: (err) => {
            console.error(err);
            // Xóa thất bại
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: 'Không thể xóa sân này. Vui lòng thử lại sau.',
              confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }
}