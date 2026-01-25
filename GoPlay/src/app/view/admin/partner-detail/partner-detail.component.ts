import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-partner-detail',
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.css'],
  standalone: false
})
export class PartnerDetailComponent implements OnInit {
  userId: number = 0;
  profile: any = null;
  fields: any[] = [];
  isLoading = true;

  // --- [MỚI] BIẾN QUẢN LÝ MODAL ---
  selectedField: any = null;
  showFieldModal: boolean = false;

  // Cấu hình Chart.js
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        data: [],
        label: 'Doanh thu (VNĐ)',
        fill: true,
        tension: 0.4,
        borderColor: '#36b9cc',
        backgroundColor: 'rgba(54, 185, 204, 0.1)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.isLoading = true;
    const year = new Date().getFullYear();

    // 1. Load Profile
    this.adminService.getPartnerProfile(this.userId).subscribe(res => {
      this.profile = res;
    });

    // 2. Load Fields
    this.adminService.getPartnerFields(this.userId).subscribe(res => {
      // API trả về PagedResult, lấy items
      this.fields = res.items || [];
    });

    // 3. Load Revenue & Chart
    this.adminService.getPartnerRevenue(this.userId, year).subscribe({
      next: (res: any[]) => {
        const revenueData = res.map(item => item.totalRevenue);
        this.lineChartData.datasets[0].data = revenueData;
        this.lineChartData = { ...this.lineChartData }; 
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openFieldModal(field: any) {
    this.selectedField = field;
    this.showFieldModal = true;
  }

  closeFieldModal() {
    this.showFieldModal = false;
    this.selectedField = null;
  }
}