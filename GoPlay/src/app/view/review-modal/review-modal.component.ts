import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReviewService } from '../../services/review.service';


import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css'],
  standalone: false
})
export class ReviewModalComponent {
  @Input() fieldId: number = 0;
  @Input() fieldName: string = '';
  

  @Input() bookingId: number = 0; 

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  rating: number = 5;
  comment: string = '';
  stars = [1, 2, 3, 4, 5];
  isLoading = false;

  constructor(private reviewService: ReviewService) {}

  setRating(star: number) {
    this.rating = star;
  }

  submitReview() {
    // 1. Validate: Kiểm tra nội dung
    if (!this.comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập nội dung',
        text: 'Vui lòng chia sẻ cảm nhận của bạn về sân này nhé!',
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: '#f39c12' // Màu cam cảnh báo
      });
      return;
    }

    this.isLoading = true;
    const dto = {
      fieldId: this.fieldId,
      bookingId: this.bookingId,
      rating: this.rating,
      comment: this.comment
    };

    this.reviewService.createReview(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.success.emit();
        // 2. Success: Thông báo thành công đẹp mắt
        Swal.fire({
          icon: 'success',
          title: 'Cảm ơn bạn!',
          text: 'Đánh giá của bạn đã được ghi nhận.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isLoading = false;
        
        // 3. Error: Báo lỗi chi tiết
        Swal.fire({
          icon: 'error',
          title: 'Gửi thất bại',
          text: err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#e74c3c' // Màu đỏ lỗi
        });
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}