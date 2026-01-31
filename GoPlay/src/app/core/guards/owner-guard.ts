import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 canActivate() {
  return this.authService.user$.pipe(
    take(1),
    map(user => {
      if (user?.role === 'OwnerField') {
        return true;
      }

      return this.router.createUrlTree(['/']);
    })
  );
}
}
