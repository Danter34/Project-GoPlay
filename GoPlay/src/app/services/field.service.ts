import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Field } from '../models/field.model';
import { PagedResult } from '../models/paged-result.model';
@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private apiUrl = 'http://localhost:5210/api';

  constructor(private http: HttpClient) { }

   getAllPaged(page: number = 1, pageSize: number = 10)
    : Observable<PagedResult<Field>> {

    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Field>>(
      `${this.apiUrl}/fields/get-all`,
      { params }
    );
  }
  getById(id: number): Observable<Field> {
  return this.http.get<Field>(`${this.apiUrl}/fields/get-by-id/${id}`);
}

  filter(city?: string, district?: string, sportTypeId?: number, page = 1, pageSize = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (city) params = params.set('city', city);
    if (district) params = params.set('district', district);
    if (sportTypeId) params = params.set('sportTypeId', sportTypeId);

    return this.http.get<PagedResult<Field>>(
      `${this.apiUrl}/fields/filter`,
      { params }
    );
  }
  search(query: any) {
    let params = new HttpParams({ fromObject: query });

    return this.http.get<PagedResult<Field>>(
      `${this.apiUrl}/fields/search`,
      { params }
    );
  }
 // field.service.ts
getAllForMap(): Observable<Field[]> {
  // Lấy danh sách sân bóng (tăng pageSize để hiển thị nhiều điểm trên bản đồ)
  return this.http.get<any>(`${this.apiUrl}/fields/get-all?page=1&pageSize=100`).pipe(
    map(res => {
      // res.items chứa danh sách sân bóng từ API của bạn
      return (res.items || []).filter((f: any) => f.latitude != null && f.longitude != null);
    })
  );
}
}