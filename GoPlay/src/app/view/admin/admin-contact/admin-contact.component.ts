import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-contact',
  templateUrl: './admin-contact.component.html',
  styleUrls: ['./admin-contact.component.css'],
  standalone: false
})
export class AdminContactComponent implements OnInit {
  contacts: any[] = [];
  isLoading = false;
  filterStatus = 'All'; // 'All', 'New', 'Replied'

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.contactService.getContacts(this.filterStatus).subscribe({
      next: (res) => {
        this.contacts = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onFilterChange() {
    this.loadData();
  }

  // Xem chi tiết nội dung tin nhắn
  viewMessage(item: any) {
    Swal.fire({
      title: `Tin nhắn từ: ${item.name}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Email:</strong> <a href="mailto:${item.email}">${item.email}</a></p>
          <p><strong>Ngày gửi:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
          <hr>
          <p style="white-space: pre-wrap;">${item.message}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Đánh dấu đã trả lời',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#27ae60'
    }).then((result) => {
      if (result.isConfirmed && item.status === 'New') {
        this.updateStatus(item.id, 'Replied');
      }
    });
  }

  updateStatus(id: number, newStatus: string) {
    this.contactService.updateStatus(id, newStatus).subscribe({
      next: () => {
        // Cập nhật lại list local để không cần load lại API
        const item = this.contacts.find(c => c.id === id);
        if (item) item.status = newStatus;
        
        Swal.fire({
            icon: 'success', 
            title: 'Cập nhật thành công!', 
            timer: 1500, 
            showConfirmButton: false
        });
      }
    });
  }

  deleteItem(id: number) {
    Swal.fire({
      title: 'Xóa tin nhắn?',
      text: "Bạn có chắc chắn muốn xóa liên hệ này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((res) => {
      if (res.isConfirmed) {
        this.contactService.deleteContact(id).subscribe({
          next: () => {
            Swal.fire('Đã xóa', '', 'success');
            this.loadData();
          }
        });
      }
    });
  }
}