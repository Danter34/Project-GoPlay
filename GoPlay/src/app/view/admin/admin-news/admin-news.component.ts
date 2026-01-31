import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css'],
  standalone: false
})
export class AdminNewsComponent implements OnInit {
  newsList: any[] = [];
  isLoading = false;

  // Biến cho Modal
  showModal = false;
  isEditMode = false;
  currentId = 0;
  
  formData = {
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    isPublished: true
  };

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.newsService.getAdminNews().subscribe({
      next: (res) => { this.newsList = res; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  // --- MODAL & FORM ---
  openCreate() {
    this.isEditMode = false;
    this.formData = { title: '', summary: '', content: '', imageUrl: '', isPublished: true };
    this.showModal = true;
  }

  openEdit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    // Copy đối tượng để tránh sửa trực tiếp vào bảng khi chưa lưu
    this.formData = { ...item }; 
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // --- UPLOAD ẢNH ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Hiện loading nhẹ hoặc thông báo
      const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      toast.fire({ icon: 'info', title: 'Đang tải ảnh lên...' });

      this.newsService.uploadImage(file).subscribe({
        next: (res: any) => {
          this.formData.imageUrl = res.imageUrl; // Backend trả về { imageUrl: "..." }
          toast.fire({ icon: 'success', title: 'Ảnh đã lên!' });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Lỗi', 'Không thể upload ảnh', 'error');
        }
      });
    }
  }

  removeImage() {
    this.formData.imageUrl = '';
  }

  // --- SUBMIT ---
  onSubmit() {
    if (!this.formData.title || !this.formData.content) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập Tiêu đề và Nội dung bài viết', 'warning');
      return;
    }

    this.isLoading = true;
    const request = this.isEditMode 
      ? this.newsService.update(this.currentId, this.formData)
      : this.newsService.create(this.formData);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.showModal = false;
        Swal.fire('Thành công', this.isEditMode ? 'Đã cập nhật bài viết' : 'Đã đăng bài mới', 'success');
        this.loadData();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Lỗi', err.error?.message || 'Có lỗi xảy ra', 'error');
      }
    });
  }

  // --- DELETE ---
  deleteItem(id: number) {
    Swal.fire({
      title: 'Xóa bài viết?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Xóa ngay'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.delete(id).subscribe({
          next: () => {
            Swal.fire('Đã xóa', '', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Lỗi', 'Không thể xóa bài viết', 'error')
        });
      }
    });
  }
}