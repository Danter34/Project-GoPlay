import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-return',
  templateUrl: './payment-return.component.html',
  styleUrls: ['./payment-return.component.css'],
  standalone: false
})
export class PaymentReturnComponent implements OnInit {
  status: 'loading' | 'success' | 'failed' = 'loading';
  message = 'Đang xử lý kết quả thanh toán...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      

      if (params['vnp_ResponseCode']) {
        this.handleVnPay(params);
      } 

      else if (params['resultCode']) {
        this.handleMomo(params);
      } 
      else {
        this.status = 'failed';
        this.message = 'Không tìm thấy thông tin giao dịch.';
      }
    });
  }

  handleVnPay(params: any) {

    if (params['vnp_ResponseCode'] === '00') {
      this.callBackendConfirm(() => this.paymentService.checkVnPayReturn(params));
    } else {
      this.status = 'failed';
      this.message = 'Giao dịch VNPay thất bại hoặc bị hủy.';
    }
  }

  handleMomo(params: any) {

    if (params['resultCode'] === '0') {
      this.callBackendConfirm(() => this.paymentService.checkMomoReturn(params));
    } else {
      this.status = 'failed';
      this.message = 'Giao dịch MoMo thất bại hoặc bị hủy.';
    }
  }


  callBackendConfirm(apiCall: () => any) {
    apiCall().subscribe({
      next: (res: any) => {
        this.status = 'success';
        this.message = 'Thanh toán thành công! Đơn đặt sân đã được gửi.';
      },
      error: (err: any) => {
        console.error(err);
        this.status = 'failed';
        this.message = 'Lỗi xác thực giao dịch từ phía máy chủ.';
      }
    });
  }
}