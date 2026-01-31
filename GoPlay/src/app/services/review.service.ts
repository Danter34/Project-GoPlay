import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'https://apigplay.qzz.io/api/reviews';

  constructor(private http: HttpClient) {}

  createReview(data: { fieldId: number, rating: number, comment: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}