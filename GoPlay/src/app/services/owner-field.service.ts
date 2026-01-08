import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnerFieldService {
  private baseUrl = 'https://apigplay.qzz.io/api'; 

  constructor(private http: HttpClient) {}

  // 1. Lấy danh sách sân của tôi
  getMyFields(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/fields/my-fields?page=${page}&pageSize=${pageSize}`);
  }

  // 2. Lấy chi tiết 1 sân (Để fill vào form sửa)
  getFieldById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/fields/get-by-id/${id}`); 
  }

  // 3. Tạo sân mới
  createField(data: any, images: File[]): Observable<any> {
    const formData = new FormData();
    this.appendFormData(formData, data); // Hàm helper bên dưới

    if (images) {
      images.forEach(file => formData.append('images', file));
    }

    return this.http.post(`${this.baseUrl}/fields/create`, formData);
  }

  // 4. Cập nhật sân
  updateField(id: number, data: any, newImages: File[], deleteImageIds: number[]): Observable<any> {
    const formData = new FormData();
    this.appendFormData(formData, data);

    // Ảnh mới
    if (newImages && newImages.length > 0) {
      newImages.forEach(file => formData.append('newImages', file));
    }

    // Ảnh cần xóa (Gửi mảng số nguyên)
    if (deleteImageIds && deleteImageIds.length > 0) {
      deleteImageIds.forEach(id => formData.append('deleteImageIds', id.toString()));
    }

    return this.http.put(`${this.baseUrl}/fields/update/${id}`, formData);
  }

  // 5. Xóa sân
  deleteField(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fields/delete/${id}`);
  }

  // Helper để đóng gói dữ liệu chung
  private appendFormData(formData: FormData, data: any) {
    formData.append('fieldName', data.fieldName);
    formData.append('price', data.price.toString());
    formData.append('sportTypeId', data.sportTypeId.toString());
    
    formData.append('location.city', data.location.city);
    formData.append('location.district', data.location.district);
    formData.append('location.address', data.location.address);
    // Nếu có tọa độ thì gửi, không thì thôi hoặc gửi 0
    if (data.location.latitude) formData.append('location.latitude', data.location.latitude.toString());
    if (data.location.longitude) formData.append('location.longitude', data.location.longitude.toString());
  }
}