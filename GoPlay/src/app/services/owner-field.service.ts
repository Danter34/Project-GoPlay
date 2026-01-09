import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnerFieldService {
  private baseUrl = 'https://apigplay.qzz.io/api';

  constructor(private http: HttpClient) {}

  getMyFields(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/fields/my-fields?page=${page}&pageSize=${pageSize}`);
  }

  getFieldById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/fields/get-by-id/${id}`);
  }

  createField(data: any, images: File[]): Observable<any> {
    const formData = new FormData();
    this.appendFormData(formData, data);
    
    if (images && images.length > 0) {
      images.forEach(file => formData.append('images', file));
    }

    return this.http.post(`${this.baseUrl}/fields/create`, formData);
  }

  updateField(id: number, data: any, newImages: File[], deleteImageIds: number[]): Observable<any> {
    const formData = new FormData();
    this.appendFormData(formData, data);

    if (newImages && newImages.length > 0) {
      newImages.forEach(file => formData.append('newImages', file));
    }

    if (deleteImageIds && deleteImageIds.length > 0) {
      deleteImageIds.forEach(dId => formData.append('deleteImageIds', dId.toString()));
    }

    return this.http.put(`${this.baseUrl}/fields/update/${id}`, formData);
  }

  deleteField(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fields/delete/${id}`);
  }

  // Helper function
  private appendFormData(formData: FormData, data: any) {
    formData.append('fieldName', data.fieldName);
    formData.append('price', data.price.toString());
    formData.append('sportTypeId', data.sportTypeId.toString());
    formData.append('description', data.description || '');

    
    formData.append('location.city', data.location.city);
    formData.append('location.district', data.location.district);
    formData.append('location.address', data.location.address);
    
    if (data.location.latitude) formData.append('location.latitude', data.location.latitude.toString());
    if (data.location.longitude) formData.append('location.longitude', data.location.longitude.toString());
  }
}