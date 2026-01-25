import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // [MỚI] Import ActivatedRoute
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: false
})
export class UserManagementComponent implements OnInit {
  allUsers: any[] = [];
  displayedUsers: any[] = [];
  searchText = '';
  isLoading = false;
  
  // Biến xác định trang hiện tại ('user' hoặc 'owner')
  pageType: 'user' | 'owner' = 'user'; 
  pageTitle = 'Danh Sách Khách Hàng';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute // [MỚI] Inject Route
  ) {}

  ngOnInit(): void {
    // Lắng nghe sự thay đổi của URL (để khi click chuyển menu nó reload lại data)
    this.route.data.subscribe(data => {
      this.pageType = data['type']; // Lấy 'user' hoặc 'owner' từ router
      
      // Set tiêu đề tương ứng
      this.pageTitle = this.pageType === 'user' 
        ? 'Danh Sách Khách Hàng & Admin' 
        : 'Danh Sách Đối Tác (Chủ Sân)';
        
      this.loadUsers(); // Load lại dữ liệu
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.filterData();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  filterData() {
    let temp = [];

    // Lọc theo Page Type (Thay vì Tab)
    if (this.pageType === 'user') {
      temp = this.allUsers.filter(u => u.role === 'User' || u.role === 'Admin');
    } else {
      temp = this.allUsers.filter(u => u.role === 'OwnerField');
    }

    // Lọc theo Search Text
    const term = this.searchText.toLowerCase();
    this.displayedUsers = temp.filter(u => 
      u.fullName?.toLowerCase().includes(term) || 
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term)
    );
  }

  changeRole(user: any, newRole: string) {
    if (user.role === newRole) return;
    
    if (user.role === 'OwnerField' && newRole !== 'OwnerField') {
       if (!confirm(`Cảnh báo: Hạ quyền Chủ Sân xuống ${newRole}? Họ sẽ mất quyền quản lý sân.`)) {
         this.loadUsers(); return;
       }
    } else if (!confirm(`Đổi quyền của ${user.email} thành ${newRole}?`)) {
        this.loadUsers(); return;
    }

    this.adminService.setUserRole(user.userId, newRole).subscribe({
      next: () => {
        alert('Cập nhật thành công!');
        // Sau khi đổi quyền, user đó sẽ biến mất khỏi danh sách hiện tại (đúng logic)
        this.loadUsers(); 
      },
      error: (err) => {
        alert('Lỗi: ' + err.error?.message);
        this.loadUsers();
      }
    });
  }
}