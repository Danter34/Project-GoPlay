import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5210/api'; 
  constructor(private http: HttpClient) {}


  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/admin-dashboard`);
  }

  
  getPendingOwners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/owner-profiles/pending`);
  }

  approveOwner(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/owner-profiles/${id}/approve`, {});
  }

  rejectOwner(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/owner-profiles/${id}/reject`, {});
  }

  
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/users`); 
  }

  setUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/users/${userId}/role`, { role });
  }
  getPartnerProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner-profiles/admin/profile/${userId}`);
  }


  getPartnerRevenue(userId: number, year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/admin/revenue/${userId}?year=${year}`);
  }

 
  getPartnerFields(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/fields/admin/fields/${userId}`);
  }
  getAllSportTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/sport-types/get-all`);
}

createSportType(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/sport-types/create`, data);
}

updateSportType(id: number, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/sport-types/update-by-id/${id}`, data);
}

deleteSportType(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/sport-types/delete-by-id/${id}`);
}


getAllTimeSlots(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/timeslots/get-all`);
}

createTimeSlot(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/timeslots/create`, data);
}

updateTimeSlot(id: number, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/timeslots/update-by-id/${id}`, data);
}

deleteTimeSlot(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/timeslots/delete-by-id/${id}`);
}
}