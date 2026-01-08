import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // 1. Thêm Inject và PLATFORM_ID
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // 2. Thêm hàm check platform

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // 3. Inject PLATFORM_ID vào constructor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // 4. Bọc logic lấy token trong điều kiện kiểm tra Browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');

      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request);
  }
}