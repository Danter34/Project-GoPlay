import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = 'https://apigplay.qzz.io/api'; 

  constructor(private http: HttpClient) {}

  // --- 1. NEWS API ---

  // Lấy danh sách cho khách (chỉ bài hiện)
  getPublicNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/news`);
  }

  // Lấy danh sách cho Admin (tất cả bài)
  getAdminNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/news/admin`);
  }

  // Lấy chi tiết
  getDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/${id}`);
  }

  // Thêm mới
  create(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/news`, data);
  }

  // Cập nhật
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/news/${id}`, data);
  }

  // Xóa
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/news/${id}`);
  }

  // --- 2. IMAGE UPLOAD API ---

  // Upload ảnh tin tức
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/newsimage/upload`, formData);
  }
}