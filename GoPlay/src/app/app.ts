import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // 1. Import Router

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: false
})
export class App {
  title = 'GoPlay';
  
  // Biến để kiểm soát việc hiện Header/Footer
  showLayout: boolean = true;

  constructor(private router: Router) {
    // 2. Lắng nghe sự kiện chuyển trang
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Kiểm tra URL hiện tại
        const currentUrl = event.urlAfterRedirects;
        
        // Nếu URL chứa 'login' hoặc 'register' thì ẩn Layout
        if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
          this.showLayout = false;
        } else {
          this.showLayout = true;
        }
      }
    });
  }
}