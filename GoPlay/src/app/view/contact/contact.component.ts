import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: false
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    message: ''
  };
  isLoading = false;

  constructor(private contactService: ContactService) {}

  onSubmit() {
    // 1. Validate
    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ Tên, Email và Nội dung!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // 2. Validate Email format (cơ bản)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactData.email)) {
      Swal.fire('Lỗi', 'Email không hợp lệ', 'error');
      return;
    }

    this.isLoading = true;

    // 3. Gửi API
    this.contactService.sendContact(this.contactData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Gửi thành công!',
          text: 'Cảm ơn bạn đã liên hệ. Admin sẽ phản hồi sớm nhất.',
          confirmButtonColor: '#27ae60'
        });
        // Reset form
        this.contactData = { name: '', email: '', message: '' };
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Lỗi', 'Không thể gửi tin nhắn lúc này.', 'error');
        console.error(err);
      }
    });
  }
}