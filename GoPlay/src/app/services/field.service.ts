import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Field } from '../models/field.model';
import { PagedResult } from '../models/paged-result.model';
@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private apiUrl = 'https://apigplay.qzz.io/api/fields';

  constructor(private http: HttpClient) { }

   getAllPaged(page: number = 1, pageSize: number = 10)
    : Observable<PagedResult<Field>> {

    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Field>>(
      `${this.apiUrl}/get-all`,
      { params }
    );
  }
  getById(id: number): Observable<Field> {
  return this.http.get<Field>(`${this.apiUrl}/get-by-id/${id}`);
}

  filter(city?: string, district?: string, sportTypeId?: number, page = 1, pageSize = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (city) params = params.set('city', city);
    if (district) params = params.set('district', district);
    if (sportTypeId) params = params.set('sportTypeId', sportTypeId);

    return this.http.get<PagedResult<Field>>(
      `${this.apiUrl}/filter`,
      { params }
    );
  }
  search(query: any) {
  let params = new HttpParams({ fromObject: query });

  return this.http.get<PagedResult<Field>>(
    `${this.apiUrl}/search`,
    { params }
  );
}
  
}