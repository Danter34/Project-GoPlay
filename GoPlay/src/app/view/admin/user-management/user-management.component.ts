import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

// [MỚI] Import SweetAlert2
import Swal from 'sweetalert2';

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
  
  pageType: 'user' | 'owner' = 'user'; 
  pageTitle = 'Danh Sách Khách Hàng';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pageType = data['type']; 
      
      this.pageTitle = this.pageType === 'user' 
        ? 'Danh Sách Khách Hàng & Admin' 
        : 'Danh Sách Đối Tác (Chủ Sân)';
        
      this.loadUsers();
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

    if (this.pageType === 'user') {
      temp = this.allUsers.filter(u => u.role === 'User' || u.role === 'Admin');
    } else {
      temp = this.allUsers.filter(u => u.role === 'OwnerField');
    }

    const term = this.searchText.toLowerCase();
    this.displayedUsers = temp.filter(u => 
      u.fullName?.toLowerCase().includes(term) || 
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term)
    );
  }

  // [CẬP NHẬT] Hàm đổi quyền dùng SweetAlert2
  changeRole(user: any, newRole: string) {
    // Nếu chọn lại quyền cũ thì không làm gì
    if (user.role === newRole) return;
    
    // 1. Cấu hình nội dung cảnh báo tùy theo tình huống
    let title = 'Xác nhận đổi quyền?';
    let text = `Bạn muốn đổi quyền của tài khoản "${user.email}" thành [${newRole}]?`;
    let icon: any = 'question';
    let confirmColor = '#3498db'; // Màu xanh mặc định

    // Cảnh báo ĐỎ nếu hạ quyền Chủ Sân (Nguy hiểm)
    if (user.role === 'OwnerField' && newRole !== 'OwnerField') {
       title = 'CẢNH BÁO QUAN TRỌNG!';
       text = `Bạn đang hạ quyền Chủ Sân xuống ${newRole}. Họ sẽ MẤT QUYỀN quản lý sân bãi và doanh thu hiện tại. Bạn có chắc chắn không?`;
       icon = 'warning';
       confirmColor = '#e74c3c'; // Màu đỏ
    }

    // 2. Hiện Popup xác nhận
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Đồng ý cập nhật',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // 3. Hiện Loading khi gọi API
        Swal.fire({
            title: 'Đang cập nhật...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.adminService.setUserRole(user.userId, newRole).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: `Đã cập nhật vai trò người dùng thành ${newRole}.`,
              timer: 1500,
              showConfirmButton: false
            });
            // Load lại data để user đó chuyển sang danh sách đúng (hoặc biến mất khỏi list hiện tại)
            this.loadUsers(); 
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: err.error?.message || 'Không thể cập nhật quyền hạn.',
              confirmButtonColor: '#e74c3c'
            });
            this.loadUsers(); // Reset lại UI (dropdown) về giá trị cũ
          }
        });
      } else {
        // Nếu bấm Hủy -> Load lại để reset dropdown về giá trị cũ
        this.loadUsers();
      }
    });
  }
}