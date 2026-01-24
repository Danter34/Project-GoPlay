import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css'],
  standalone: false
})
export class ReviewModalComponent {
  @Input() fieldId: number = 0;
  @Input() fieldName: string = '';
  
  // [QUAN TRỌNG] Thêm dòng này để fix lỗi
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
    if (!this.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    this.isLoading = true;
    const dto = {
      fieldId: this.fieldId,
      bookingId: this.bookingId, // Gửi bookingId xuống API
      rating: this.rating,
      comment: this.comment
    };

    this.reviewService.createReview(dto).subscribe({
      next: () => {
        alert('Cảm ơn bạn đã đánh giá!');
        this.success.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Lỗi khi gửi đánh giá');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}