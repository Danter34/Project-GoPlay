import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  stats: any = {
    totalUsers: 0,
    totalOwners: 0,
    pendingOwners: 0,
    totalFields: 0,
    totalBookings: 0,
    totalRevenueSystem: 0
  };
  
  isLoading = true;

  // --- CẤU HÌNH BIỂU ĐỒ (Trader Style) ---
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [], // Dữ liệu sẽ được nạp sau khi API trả về
        label: 'Doanh thu tích lũy (VNĐ)',
        backgroundColor: 'rgba(28, 200, 138, 0.2)', // Màu nền xanh lá nhạt (Trader style)
        borderColor: '#1cc88a', // Đường viền xanh lá đậm
        pointBackgroundColor: '#fff',
        pointBorderColor: '#1cc88a',
        pointHoverBackgroundColor: '#1cc88a',
        pointHoverBorderColor: '#fff',
        fill: 'origin', // Tô màu vùng bên dưới (Area Chart)
        tension: 0.4 // Độ cong của đường (0 = thẳng tắp, 0.4 = mềm mại)
      }
    ],
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      x: {
        grid: {
          display: false // Ẩn lưới dọc cho giống biểu đồ chứng khoán
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)' // Lưới ngang mờ
        }
      }
    },
    plugins: {
      legend: { display: true }
    }
  };

  public lineChartType: ChartType = 'line';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        
     
        this.simulateChartData(this.stats.totalRevenueSystem);
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thống kê Dashboard:', err);
        this.isLoading = false;
      }
    });
  }


 simulateChartData(totalRevenue: number) {
    const dataPoints = [];
    const currentMonth = new Date().getMonth() + 1; 
    

    const averagePerMonth = totalRevenue / currentMonth; 
    
    let accumulatedRevenue = 0;

    for (let i = 1; i <= 12; i++) {
      if (i <= currentMonth) {

        if (i === currentMonth) {

            accumulatedRevenue = totalRevenue;
        } else {
        
            const monthlyRevenue = averagePerMonth * (0.8 + Math.random() * 0.4);
            accumulatedRevenue += monthlyRevenue;
        }
        dataPoints.push(Math.round(accumulatedRevenue));
      } else {

        dataPoints.push(null); 
      }
    }

    this.lineChartData.datasets[0].data = dataPoints;
    this.chart?.update(); 
  }
}