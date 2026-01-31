import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://apigplay.qzz.io/api/ls';

  constructor(private http: HttpClient) { }

  sendContact(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getContacts(status: string = ''): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=${status}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Xóa
  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}