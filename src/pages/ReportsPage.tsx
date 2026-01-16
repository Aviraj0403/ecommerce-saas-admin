import { useState } from 'react'
import { Download, TrendingUp, Package, Users } from 'lucide-react'
import { SalesReport } from '@/components/reports/SalesReport'
import { ProductReport } from '@/components/reports/ProductReport'
import { CustomerReport } from '@/components/reports/CustomerReport'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { getDefaultDateRange } from '@/hooks/useReports'
import type { ReportTab, DateRange } from '@/types/reports.types'

const tabs = [
  { id: 'sales' as ReportTab, name: 'Sales', icon: TrendingUp },
  { id: 'products' as ReportTab, name: 'Products', icon: Package },
  { id: 'customers' as ReportTab, name: 'Customers', icon: Users },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales')
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange())
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true)
    try {
      const { exportReport } = await import('@/hooks/useReports')
      await exportReport({
        format,
        reportType: activeTab,
        dateRange,
      })
    } catch (error) {
      // Error handled by exportReport function
    } finally {
      setIsExporting(false)
    }
  }

  const renderActiveReport = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesReport dateRange={dateRange} />
      case 'products':
        return <ProductReport dateRange={dateRange} />
      case 'customers':
        return <CustomerReport dateRange={dateRange} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Analyze your store performance and customer behavior</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector
            dateRange={dateRange}
            onChange={setDateRange}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Report Content */}
      <div className="min-h-[600px]">
        {renderActiveReport()}
      </div>
    </div>
  )
}