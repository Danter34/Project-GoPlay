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

  // ...
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
      
        // Ẩn Header/Footer nếu là trang Login, Register HOẶC trang Owner
        if (url.includes('/login') || url.includes('/register') || url.includes('/owner')) {
          this.showLayout = false;
        } else {
          this.showLayout = true;
        }
      }
    });
  }
}