import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldService } from '../../services/field.service';
import { Field } from '../../models/field.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit {
  fields: Field[] = [];
  currentUserId: number = 0;

  // --- PHÂN TRANG ---
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // --- ĐỊA CHÍNH ---
  vnData: any[] = [];
  cities: any[] = [];
  districts: any[] = [];

  selectedCityCode = '';
  searchCity = '';
  searchDistrict = '';
  searchSportId = 0;

  // --- MODAL CONFIG ---
  showBookingModal = false; // Thống nhất dùng biến này giống FieldDetail
  selectedField: Field | null = null;

  constructor(
    private fieldService: FieldService,
    private http: HttpClient,
    private authService: AuthService, 
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadFields();
    this.loadVietnamData();
  }

  // ... (Giữ nguyên các hàm loadFields, onSearch, changePage, loadVietnamData, onCityChange, onDistrictChange) ...
  // Để gọn code mình ẩn các hàm không thay đổi đi, bạn giữ nguyên chúng nhé.
  loadFields(page: number = 1) {
    this.fieldService.getAllPaged(page, this.itemsPerPage).subscribe({
      next: res => {
        this.fields = res.items;
        this.totalItems = res.totalItems;
        this.currentPage = res.page;
      },
      error: err => console.error('API error', err)
    });
  }

  onSearch(page: number = 1) {
    this.fieldService.filter(this.searchCity, this.searchDistrict, this.searchSportId, page, this.itemsPerPage).subscribe({
      next: res => {
        this.fields = res.items;
        this.totalItems = res.totalItems;
        this.currentPage = res.page;
      },
      error: err => console.error('Search error', err)
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.onSearch(page);
    document.querySelector('.filter-bar')?.scrollIntoView({ behavior: 'smooth' });
  }

  loadVietnamData() {
    const jsonUrl = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';
    this.http.get<any[]>(jsonUrl).subscribe({
      next: data => { this.vnData = data; this.cities = data; }
    });
  }

  onCityChange() {
    const city = this.vnData.find(c => c.Id === this.selectedCityCode);
    this.searchCity = city ? city.Name : '';
    this.districts = city ? city.Districts : [];
    this.searchDistrict = '';
    this.onSearch(1);
  }

  onDistrictChange() { this.onSearch(1); }

  // --- MODAL LOGIC (ĐÃ SỬA) ---
  openBookingModal(field: Field) {
    // Không check login nữa để khách vãng lai đặt được
    this.selectedField = field;
    this.showBookingModal = true;
  }

  closeModal() {
    this.showBookingModal = false;
    this.selectedField = null;
  }
}