import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerProfile, OwnerProfileUpdateDTO } from '../models/owner-profile.model';

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
  getOwnerProfile(): Observable<OwnerProfile> {
    return this.http.get<OwnerProfile>(`${this.apiUrl}/my-profile`);
  }

  updateOwnerProfile(id: number, data: OwnerProfileUpdateDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-by-id/${id}`, data);
  }
}