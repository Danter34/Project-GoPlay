import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly API_URL = 'https://apigplay.qzz.io';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    // 🔥 SSR không xử lý token
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(request);
    }

    // 🔥 CHỈ GẮN TOKEN CHO API CỦA MÌNH
    if (!request.url.startsWith(this.API_URL)) {
      return next.handle(request);
    }

    const token = localStorage.getItem('authToken');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
