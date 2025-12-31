import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://apigplay.qzz.io/api/auth'; // Đổi port theo API của bạn
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable(); // Observable để Header lắng nghe

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserFromStorage();
  }

  // 1. Kiểm tra xem có token trong máy không khi web load lại
  private loadUserFromStorage() {
   if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        if (this.isTokenExpired(token)) {
          this.logout();
        } else {
          try {
            const decoded: any = jwtDecode(token);
            this.userSubject.next(decoded);
          } catch (e) {
            // Nếu token lỗi format thì xóa đi
            localStorage.removeItem('authToken');
          }
        }
      }
    }
  }

  // 2. Đăng ký
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' });
  }

  // 3. Đăng nhập
 login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        // 5. Kiểm tra trước khi lưu token
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('authToken', res.token);
        }
        const decoded: any = jwtDecode(res.token);
        this.userSubject.next(decoded);
      })
    );
  }

  // 4. Đăng xuất
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
    }
    this.userSubject.next(null);
    window.location.href = '/';
  }

  // 5. Kiểm tra đăng nhập chưa
  get isLoggedIn(): boolean {
    // 7. Kiểm tra khi get trạng thái
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }

  // Helper: Check token hết hạn
  private isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }
}