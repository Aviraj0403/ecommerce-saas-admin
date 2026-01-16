export interface DateRange {
  startDate: string
  endDate: string
}

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  aovGrowth: number
}

export interface SalesChartData {
  date: string
  revenue: number
  orders: number
}

export interface CategorySalesData {
  category: string
  revenue: number
  orders: number
  percentage: number
}

export interface SalesReportData {
  metrics: SalesMetrics
  chartData: SalesChartData[]
  categoryBreakdown: CategorySalesData[]
}

export interface ProductPerformanceMetrics {
  totalProducts: number
  activeProducts: number
  outOfStockProducts: number
  lowStockProducts: number
}

export interface TopSellingProduct {
  id: string
  name: string
  image: string
  totalSold: number
  revenue: number
  category: string
}

export interface ProductTrendData {
  date: string
  sales: number
  views: number
}

export interface ProductReportData {
  metrics: ProductPerformanceMetrics
  topSellingProducts: TopSellingProduct[]
  trendData: ProductTrendData[]
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  retentionRate: number
  customerGrowth: number
  averageLifetimeValue: number
}

export interface CustomerAcquisitionData {
  date: string
  newCustomers: number
  totalCustomers: number
}

export interface CustomerReportData {
  metrics: CustomerMetrics
  acquisitionData: CustomerAcquisitionData[]
  retentionData: {
    month: string
    retentionRate: number
  }[]
}

export interface ReportExportOptions {
  format: 'csv' | 'excel'
  reportType: 'sales' | 'products' | 'customers'
  dateRange: DateRange
}

export type ReportTab = 'sales' | 'products' | 'customers'

export interface ReportFilters {
  dateRange: DateRange
  category?: string
  status?: string
}