import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Field } from '../models/field.model';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private apiUrl = 'https://apigplay.qzz.io/api/fields';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.apiUrl}/get-all`);
  }

  getById(id: number): Observable<Field> {
    return this.http.get<Field>(`${this.apiUrl}/get-by-id/${id}`);
  }

  filter(city?: string, district?: string, sportTypeId?: number): Observable<Field[]> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (district) params = params.set('district', district);
    if (sportTypeId) params = params.set('sportTypeId', sportTypeId);

    return this.http.get<Field[]>(`${this.apiUrl}/filter`, { params });
  }
}