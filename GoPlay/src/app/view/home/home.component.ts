import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit {
  fields: Field[] = []; // Dữ liệu gốc (Toàn bộ sân)
  
  // --- BIẾN ĐỊA CHÍNH ---
  vnData: any[] = [];
  cities: any[] = [];
  districts: any[] = [];
  
  selectedCityCode: string = '';
  searchCity: string = '';
  searchDistrict: string = '';
  searchSportId: number = 0;

  // --- MODAL ---
  isModalOpen = false;
  selectedField: Field | null = null;

  // --- PHÂN TRANG (PAGINATION) ---
  currentPage: number = 1;
  itemsPerPage: number = 10; // Giới hạn 10 sân

  constructor(
    private fieldService: FieldService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadFields();
    this.loadVietnamData();
  }

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  
  // 1. Lấy danh sách sân của trang hiện tại
  get paginatedFields() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.fields.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // 2. Tính tổng số trang
  get totalPages() {
    return Math.ceil(this.fields.length / this.itemsPerPage);
  }

  // 3. Tạo mảng số trang [1, 2, 3...] để vẽ giao diện
  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // 4. Hàm chuyển trang
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Cuộn lên đầu danh sách khi chuyển trang
      const listElement = document.querySelector('.filter-bar');
      if (listElement) listElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // --- API LOGIC ---

  loadFields() {
    this.fieldService.getAll().subscribe({
      next: (data) => {
        this.fields = data;
        this.currentPage = 1; // Reset về trang 1 khi load mới
      },
      error: (err) => console.error('Lỗi API:', err)
    });
  }

  onSearch() {
    this.fieldService.filter(this.searchCity, this.searchDistrict, this.searchSportId)
      .subscribe({
        next: (data) => {
          this.fields = data;
          this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
        },
        error: (err) => console.error('Lỗi tìm kiếm:', err)
      });
  }

  // --- ĐỊA CHÍNH (Giữ nguyên) ---
  loadVietnamData() {
    const jsonUrl = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';
    this.http.get<any[]>(jsonUrl).subscribe({
      next: (data) => { this.vnData = data; this.cities = data; }
    });
  }

  onCityChange() {
    const city = this.vnData.find(c => c.Id === this.selectedCityCode);
    if (city) {
      this.searchCity = city.Name;
      this.districts = city.Districts;
    } else {
      this.searchCity = '';
      this.districts = [];
    }
    this.searchDistrict = ''; 
    this.onSearch();
  }

  onDistrictChange() { this.onSearch(); }

  // --- MODAL (Giữ nguyên) ---
  openBookingModal(field: Field) {
    this.selectedField = field;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedField = null;
  }

  submitBooking() {
    alert(`Đã gửi yêu cầu đặt sân: ${this.selectedField?.fieldName}`);
    this.closeModal();
  }
}