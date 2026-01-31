import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking.model';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
  standalone: false
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingResponse[] = [];
  isLoading = true;

  // Biến cho Modal Đánh giá
  showReviewModal = false;
  selectedReviewFieldId = 0;
  selectedReviewBookingId = 0;
  selectedReviewFieldName = '';

  constructor(private bookingService: BookingService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // [CẬP NHẬT] Hủy đơn với SweetAlert2
  cancelBooking(bookingId: number) {
    Swal.fire({
      title: 'Bạn muốn hủy đơn này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // Màu đỏ báo hiệu hành động nguy hiểm
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Đồng ý hủy',
      cancelButtonText: 'Không, giữ lại'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Hiện Loading
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.bookingService.cancelBooking(bookingId).subscribe({
          next: () => {
            // Thông báo thành công
            Swal.fire({
              icon: 'success',
              title: 'Đã hủy đơn!',
              text: 'Đơn đặt sân của bạn đã được hủy thành công.',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadBookings(); // Tải lại danh sách
          },
          error: (err) => {
            // Thông báo lỗi
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: err.error?.message || 'Có lỗi xảy ra khi hủy đơn.',
              confirmButtonColor: '#e74c3c'
            });
          }
        });
      }
    });
  }

  // Mở Modal Đánh giá
  openReviewModal(booking: BookingResponse) {
    this.selectedReviewFieldId = booking.fieldId;
    this.selectedReviewBookingId = booking.bookingId;
    this.selectedReviewFieldName = booking.fieldName;
    this.showReviewModal = true;
  }

  onReviewSuccess() {
    this.showReviewModal = false;
    this.loadBookings(); 
    this.cdr.detectChanges();
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