import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  isSidebarOpen = false;
  currentUser: any = null;
  isUserMenuOpen = false;
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  openSidebar() {
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  keyword = '';

  constructor(
    private router: Router,
    public authService: AuthService 
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }
onLogout() {
    this.isUserMenuOpen = false; 
    this.closeSidebar();         
    this.authService.logout();  
  }

  onSearch() {
    if (!this.keyword.trim()) return;

    this.router.navigate(['/search'], {
      queryParams: { q: this.keyword }
    });
  }
}