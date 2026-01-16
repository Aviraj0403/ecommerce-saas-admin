import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import type { 
  SalesReportData, 
  ProductReportData, 
  CustomerReportData,
  DateRange,
  ReportExportOptions
} from '@/types/reports.types'

// Fetch sales report data
export function useSalesReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ['salesReport', dateRange],
    queryFn: async (): Promise<SalesReportData> => {
      return await apiClient.get<SalesReportData>('/reports/sales', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      })
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  })
}

// Fetch product performance report
export function useProductReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ['productReport', dateRange],
    queryFn: async (): Promise<ProductReportData> => {
      return await apiClient.get<ProductReportData>('/reports/products', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      })
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  })
}

// Fetch customer analytics report
export function useCustomerReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ['customerReport', dateRange],
    queryFn: async (): Promise<CustomerReportData> => {
      return await apiClient.get<CustomerReportData>('/reports/customers', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      })
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  })
}

// Export report data
export async function exportReport(options: ReportExportOptions): Promise<void> {
  try {
    const response = await apiClient.getClient().post('/reports/export', options, {
      responseType: 'blob'
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    const filename = `${options.reportType}-report-${options.dateRange.startDate}-to-${options.dateRange.endDate}.${options.format}`
    link.setAttribute('download', filename)
    
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Report exported successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to export report')
    throw error
  }
}

// Utility function to get default date range (last 30 days)
export function getDefaultDateRange(): DateRange {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

// Utility function to get predefined date ranges
export function getPredefinedDateRanges() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const lastQuarter = new Date(today)
  lastQuarter.setMonth(lastQuarter.getMonth() - 3)
  
  const lastYear = new Date(today)
  lastYear.setFullYear(lastYear.getFullYear() - 1)

  return {
    today: {
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    yesterday: {
      startDate: yesterday.toISOString().split('T')[0],
      endDate: yesterday.toISOString().split('T')[0],
    },
    lastWeek: {
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    lastMonth: {
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    lastQuarter: {
      startDate: lastQuarter.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    lastYear: {
      startDate: lastYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
  }
}