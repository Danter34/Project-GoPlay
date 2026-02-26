# 🎯 GoPlay - Smart Sports Booking System

GoPlay là một nền tảng **Web App hiện đại** giúp tối ưu hóa việc tìm kiếm và đặt sân thể thao (Bóng đá, Cầu lông, Pickleball, Tennis...).  
Hệ thống cung cấp giải pháp quản trị doanh thu trực quan cho chủ sân và trải nghiệm đặt lịch linh hoạt cho người dùng.

---

# 🌟 Tính Năng Nổi Bật

## 1️⃣ Trải Nghiệm Người Dùng (User)

### 📍 Bản đồ tương tác (Mapbox)
- Tìm kiếm sân trực quan bằng **Mapbox GL JS**
- Custom Marker theo từng loại môn thể thao
- Tự động định vị người dùng
- Zoom/FlyTo sân gần nhất theo bộ lọc

### ⏱️ Đặt sân theo Slot 30 phút
- Hệ thống chia thời gian thành slot 30 phút
- Cho phép đặt linh hoạt (VD: 17:30 - 19:00)
- Tự động tính giá:
  - 2 slot = 1 giờ
  - 4 slot = 2 giờ
- Kiểm tra trùng lịch (Conflict Detection) tuyệt đối

### 💳 Thanh toán trực tuyến
- Tích hợp Sandbox Payment (VNPay / MoMo)
- Quản lý tiền cọc an toàn
- Kiểm soát trạng thái thanh toán

### ⭐ Đánh giá & Phản hồi
- Người dùng có thể:
  - Để lại nhận xét
  - Chấm điểm trải nghiệm
  - Theo dõi lịch sử đặt sân

---

## 2️⃣ Quản Trị Cho Chủ Sân (Partner)

### 📊 Dashboard "Trader Style"
- Biểu đồ vùng (Cumulative Area Chart)
- Theo dõi doanh thu tích lũy theo thời gian thực
- Hỗ trợ phân tích tăng trưởng kinh doanh

### ⚡ Quản lý vận hành Real-time
- Duyệt / Hủy / Dời lịch đơn hàng
- Cơ chế Optimistic UI
- Cập nhật trạng thái tức thì không reload trang

### 🤖 Tự động hóa (Background Services)
- Hệ thống quét mỗi 15 phút
- Tự động:
  - Giải phóng slot quá hạn check-out
  - Hủy đơn chưa thanh toán
- Sử dụng Hosted Services (IHostedService)

---

# 🛠️ Công Nghệ Sử Dụng

## 🎨 Frontend
- Framework: **Angular 17+**
- Map: **Mapbox GL JS**
- Charts: **Chart.js + ng2-charts**
- UI/UX: **Bootstrap 5**
- Alert & Modal: **SweetAlert2**

## ⚙️ Backend
- Framework: **ASP.NET Core Web API (.NET 8)**
- ORM: **Entity Framework Core**
- Database: **SQL Server**
- Background Tasks: **IHostedService**

---

# 💡 Điểm Nhấn Kỹ Thuật (Technical Highlights)

## 🔥 Complex Booking Logic
- Chia nhỏ slot 30 phút
- Xử lý Conflict Detection trong môi trường đa người dùng
- Transaction-safe booking
- Locking logic đảm bảo không double-booking

## 🗺️ Optimized Geospatial Search
- Tối ưu hiển thị Marker
- Lazy load dữ liệu theo viewport
- Xử lý sự kiện bản đồ mượt mà
- Giảm thiểu re-render không cần thiết

## 📈 Revenue Tracking Algorithm
- Tính toán doanh thu tích lũy
- Đồng bộ real-time
- Hỗ trợ phân tích theo:
  - Ngày
  - Tháng
  - Khoảng thời gian tùy chọn
