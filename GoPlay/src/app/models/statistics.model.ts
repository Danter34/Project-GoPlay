export interface OwnerDashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalFields: number;
}

export interface RevenueByTime {
  label: string;      // "Tháng 1", "Tháng 2"...
  totalRevenue: number;
}

export interface RevenueByField {
  fieldId: number;
  fieldName: string;
  totalRevenue: number;
  totalBookings: number;
}