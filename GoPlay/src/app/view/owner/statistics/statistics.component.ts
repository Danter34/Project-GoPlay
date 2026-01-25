import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../../services/statistics.service';
import { OwnerDashboardStats, RevenueByField, RevenueByTime } from '../../../models/statistics.model';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  standalone: false
})
export class StatisticsComponent implements OnInit {
  // Data Tổng quan
  stats: OwnerDashboardStats = { totalRevenue: 0, totalBookings: 0, totalFields: 0 };
  
  // Data Bảng chi tiết sân
  fieldRevenues: RevenueByField[] = [];
  
  // Filter cho biểu đồ tháng
  selectedYear: number = new Date().getFullYear();
  years: number[] = []; // List năm để chọn (VD: 2024, 2025, 2026)

  // Filter cho bảng sân
  filterDateFrom: string = '';
  filterDateTo: string = '';

  // --- CẤU HÌNH BIỂU ĐỒ (Chart.js) ---
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Doanh thu (VNĐ)', backgroundColor: '#00a651', hoverBackgroundColor: '#008c44' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Để chart co giãn theo div
  };

  constructor(private statService: StatisticsService) {
    // Tạo list 5 năm gần đây
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadChartData(this.selectedYear);
    this.loadFieldData();
  }

  // 1. Load thống kê tổng
  loadDashboard() {
    this.statService.getDashboardStats().subscribe(data => this.stats = data);
  }

  // 2. Load biểu đồ theo năm
  loadChartData(year: number) {
    this.statService.getRevenueByMonth(year).subscribe(data => {
      // Map dữ liệu từ API vào Chart
      this.barChartData = {
        labels: data.map(d => d.label), // ["Tháng 1", "Tháng 2"...]
        datasets: [
          { data: data.map(d => d.totalRevenue), label: `Doanh thu năm ${year}`, backgroundColor: '#00a651' }
        ]
      };
    });
  }

  onYearChange(event: any) {
    this.selectedYear = Number(event.target.value);
    this.loadChartData(this.selectedYear);
  }

  // 3. Load bảng chi tiết theo sân
  loadFieldData() {
    this.statService.getRevenueByField(this.filterDateFrom, this.filterDateTo).subscribe(data => {
      this.fieldRevenues = data;
    });
  }

  onFilterFieldClick() {
    this.loadFieldData();
  }
}