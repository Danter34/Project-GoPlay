import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent {
  isSidebarOpen = false;

  openSidebar() {
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  keyword = '';

  constructor(private router: Router) {}

  onSearch() {
    if (!this.keyword.trim()) return;

    this.router.navigate(['/search'], {
      queryParams: { q: this.keyword }
    });
  }
}