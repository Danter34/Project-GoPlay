import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking.model';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
  standalone: false
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingResponse[] = [];
  isLoading = true;

  // [MỚI] Biến cho Modal Đánh giá
  showReviewModal = false;
  selectedReviewFieldId = 0;
  selectedReviewBookingId = 0;
  selectedReviewFieldName = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

 loadBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data: any) => { // Cast any hoặc BookingResponse[]
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này không?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          alert('Hủy đơn thành công!');
          this.loadBookings(); 
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Có lỗi xảy ra khi hủy đơn.');
        }
      });
    }
  }

  // [MỚI] Hàm mở Modal Đánh giá
openReviewModal(booking: BookingResponse) {
    this.selectedReviewFieldId = booking.fieldId;
    this.selectedReviewBookingId = booking.bookingId;
    this.selectedReviewFieldName = booking.fieldName;
    this.showReviewModal = true;
  }

  onReviewSuccess() {
    this.showReviewModal = false;
    this.loadBookings(); // Load lại để cập nhật hasReviewed = true
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'status-success';      
      case 'Completed': return 'status-completed';    
      case 'Pending': return 'status-warning';        
      case 'AwaitingPayment': return 'status-warning';
      case 'Cancelled': return 'status-danger';       
      default: return 'status-default';
    }
  }
}