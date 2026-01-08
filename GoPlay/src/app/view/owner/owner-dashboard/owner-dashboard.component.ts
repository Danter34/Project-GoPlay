import { Component, OnInit } from '@angular/core';
import { OwnerFieldService } from '../../../services/owner-field.service';

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
    if (confirm('Bạn có chắc muốn xóa sân này không?')) {
      this.fieldService.deleteField(id).subscribe({
        next: () => {
          alert('Xóa thành công');
          this.loadFields();
        },
        error: () => alert('Xóa thất bại')
      });
    }
  }
}