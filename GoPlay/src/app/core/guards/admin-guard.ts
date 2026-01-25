import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class adminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        // Kiểm tra Role là 'OwnerField'
        if (user && user.role === 'Admin') {
          return true;
        } else {
          // Không phải chủ sân -> Đá về trang chủ
          alert('Bạn không có quyền truy cập trang quản lý Admin!');
          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
}