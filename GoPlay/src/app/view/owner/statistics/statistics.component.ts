import { Component, OnInit, ViewChild } from '@angular/core';
import { StatisticsService } from '../../../services/statistics.service';
import { OwnerDashboardStats, RevenueByField } from '../../../models/statistics.model';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts'; // Import để lấy chart


import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  standalone: false
})
export class StatisticsComponent implements OnInit {
  

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  stats: OwnerDashboardStats = { totalRevenue: 0, totalBookings: 0, totalFields: 0 };
  fieldRevenues: RevenueByField[] = [];
  
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  filterDateFrom: string = '';
  filterDateTo: string = '';

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
    maintainAspectRatio: false,
  };

  constructor(private statService: StatisticsService) {
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

  loadDashboard() {
    this.statService.getDashboardStats().subscribe(data => this.stats = data);
  }

  loadChartData(year: number) {
    this.statService.getRevenueByMonth(year).subscribe(data => {
      this.barChartData = {
        labels: data.map(d => d.label),
        datasets: [
          { data: data.map(d => d.totalRevenue), label: `Doanh thu năm ${year}`, backgroundColor: '#00a651' }
        ]
      };
      

      this.chart?.update();
    });
  }

  onYearChange(event: any) {
    this.selectedYear = Number(event.target.value);
    this.loadChartData(this.selectedYear);
  }

  loadFieldData() {
    this.statService.getRevenueByField(this.filterDateFrom, this.filterDateTo).subscribe(data => {
      this.fieldRevenues = data;
    });
  }

  onFilterFieldClick() {
    this.loadFieldData();
  }


  async exportToExcel() {
    // 1. Tạo Workbook mới
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo Cáo Doanh Thu');

    // 2. Thêm Tiêu đề lớn
    worksheet.mergeCells('A1:D1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = `BÁO CÁO DOANH THU SÂN THỂ THAO - NĂM ${this.selectedYear}`;
    titleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A651' } }; // Nền xanh
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // 3. Định nghĩa cột
    worksheet.getRow(3).values = ['STT', 'Tên Sân', 'Số Lượt Đặt', 'Tổng Doanh Thu'];
    worksheet.columns = [
      { key: 'stt', width: 10 },
      { key: 'name', width: 30 },
      { key: 'bookings', width: 15 },
      { key: 'revenue', width: 25 }
    ];

    // Style cho Header bảng
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: 'center' };
    });

    // 4. Đổ dữ liệu vào bảng
    this.fieldRevenues.forEach((item, index) => {
      const row = worksheet.addRow([index + 1, item.fieldName, item.totalBookings, item.totalRevenue]);
      
      // Format tiền tệ
      row.getCell(4).numFmt = '#,##0"đ"';
      
      // Kẻ khung
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });


    if (this.chart && this.chart.chart) {
      // Chụp ảnh chart hiện tại ra Base64
      const chartImageBase64 = this.chart.chart.toBase64Image();

      // Đăng ký ảnh với workbook
      const imageId = workbook.addImage({
        base64: chartImageBase64,
        extension: 'png',
      });


      const lastRow = this.fieldRevenues.length + 5; 

      worksheet.addImage(imageId, {
        tl: { col: 0, row: lastRow }, 
        ext: { width: 600, height: 350 } 
      });
    }

    // 6. Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    this.saveAsExcelFile(buffer, 'BaoCao_DoanhThu');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const date = new Date();
    const dateString = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}_${date.getHours()}${date.getMinutes()}`;
    saveAs(data, `${fileName}_${dateString}.xlsx`);
  }
}