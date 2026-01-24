import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSlot, BookingCreateDTO, Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:5210/api'; 

  constructor(private http: HttpClient) {}

  // --- TimeSlot API ---
  getAllTimeSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/timeslots/get-all`);
  }

  // --- Booking API ---
  createBooking(dto: BookingCreateDTO): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings/create`, dto);
  }

  getBookingsByFieldAndDate(fieldId: number, date: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/by-field/${fieldId}/date/${date}`);
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/my-bookings`);
  }
  getOwnerFields(): Observable<any> {
    // Lưu ý: Backend trả về PagedResult, ta lấy pageSize lớn để hiện hết
    return this.http.get<any>(`${this.apiUrl}/fields/my-fields?page=1&pageSize=10`);
  }
 getBookingsByField(fieldId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/owner/field/${fieldId}`);
  }
  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/owner/${id}/status`, { status });
  }
  cancelBooking(id: number): Observable<any> {
  //
  return this.http.put(`${this.apiUrl}/bookings/cancel/${id}`, {});
  
}
getBookedSlots(fieldId: number, date: string): Observable<number[]> {
    // API này trả về mảng slotId [1, 2, 5...] đã có người đặt
    return this.http.get<number[]>(`${this.apiUrl}/bookings/booked-slots?fieldId=${fieldId}&date=${date}`);
  }

 updateBookingTime(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/update-time`, payload);
  }
}