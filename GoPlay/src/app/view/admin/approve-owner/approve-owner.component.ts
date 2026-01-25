import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-approve-owner',
  templateUrl: './approve-owner.component.html',
  styleUrls: ['./approve-owner.component.css'],
  standalone:false
})
export class ApproveOwnerComponent implements OnInit {
  pendingList: any[] = [];
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending() {
    this.isLoading = true;
    this.adminService.getPendingOwners().subscribe({
      next: (res) => { this.pendingList = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  approve(id: number) {
    if (!confirm('Xác nhận DUYỆT hồ sơ này? User sẽ trở thành Chủ Sân.')) return;
    this.adminService.approveOwner(id).subscribe({
      next: () => { alert('Đã duyệt thành công!'); this.loadPending(); },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }

  reject(id: number) {
    if (!confirm('Xác nhận TỪ CHỐI hồ sơ này?')) return;
    this.adminService.rejectOwner(id).subscribe({
      next: () => { alert('Đã từ chối!'); this.loadPending(); },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }
}