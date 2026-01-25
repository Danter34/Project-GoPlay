import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service'; // Đường dẫn trỏ tới service

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone:false
})
export class DashboardComponent implements OnInit {
  // Khởi tạo object map với DTO của Backend
  stats: any = {
    totalUsers: 0,
    totalOwners: 0,
    pendingOwners: 0,
    totalFields: 0,
    totalBookings: 0,
    totalRevenueSystem: 0
  };
  
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
       
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thống kê Dashboard:', err);
        this.isLoading = false;
      }
    });
  }
}