import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  // Đổi API URL cho đúng với Controller Owner
  private apiUrl = 'https://apigplay.qzz.io/api/owner-profiles'; 

  constructor(private http: HttpClient) { }

  registerOwner(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}