import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { UserProfile, UpdateUserProfileDTO } from '../models/user-profile.model';
import { ChangePasswordDTO } from '../models/user-profile.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://apigplay.qzz.io/api/auth';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserFromStorage();
  }
  private normalizeUser(token: string): any {
    const decoded: any = jwtDecode(token);
    return {
      ...decoded,
      // Ưu tiên role thường -> Role hoa -> Role theo link Microsoft
      id: decoded.nameid || decoded.sub || decoded.Id || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      role: decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    };
  }
  getCurrentUserId(): number {
    const user = this.userSubject.value;
    return user ? Number(user.id) : 0;
  }

  private loadUserFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        if (this.isTokenExpired(token)) {
          this.logout();
        } else {
          try {
            //  Dùng hàm chuẩn hóa
            const user = this.normalizeUser(token);
            this.userSubject.next(user);
          } catch (e) {
            localStorage.removeItem('authToken');
          }
        }
      }
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' });
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('authToken', res.token);
        }
        // Dùng hàm chuẩn hóa
        const user = this.normalizeUser(res.token);
        this.userSubject.next(user);
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
    }
    this.userSubject.next(null);
    window.location.href = '/';
  }

  get isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }

  private isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }
  // Lấy thông tin user
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  // Cập nhật thông tin user
  updateProfile(data: UpdateUserProfileDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { responseType: 'text' });
  }
  // Chức năng Đổi mật khẩu
  changePassword(data: ChangePasswordDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data, { responseType: 'text' });
  }
}