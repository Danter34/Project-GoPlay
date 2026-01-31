import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://apigplay.qzz.io/api/payments';

  constructor(private http: HttpClient) {}

  createPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }
 // Kiểm tra kết quả MoMo
  checkMomoReturn(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/momo-return`, { params, responseType: 'text' });
  }

  // Kiểm tra kết quả VNPay
  checkVnPayReturn(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/vnpay-return`, { params, responseType: 'text' });
  }
}