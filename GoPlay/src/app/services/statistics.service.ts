import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerDashboardStats, RevenueByField, RevenueByTime } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:5210/api/statistics'; 

  constructor(private http: HttpClient) {}


  getDashboardStats(): Observable<OwnerDashboardStats> {
    return this.http.get<OwnerDashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getRevenueByMonth(year: number): Observable<RevenueByTime[]> {
    return this.http.get<RevenueByTime[]>(`${this.apiUrl}/revenue-by-month?year=${year}`);
  }


  getRevenueByField(from?: string, to?: string): Observable<RevenueByField[]> {
    let params = new HttpParams();
    if (from) params = params.append('from', from);
    if (to) params = params.append('to', to);

    return this.http.get<RevenueByField[]>(`${this.apiUrl}/revenue-by-field`, { params });
  }
}