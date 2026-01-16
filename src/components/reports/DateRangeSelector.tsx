import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { getPredefinedDateRanges } from '@/hooks/useReports'
import type { DateRange } from '@/types/reports.types'

interface DateRangeSelectorProps {
  dateRange: DateRange
  onChange: (dateRange: DateRange) => void
}

export function DateRangeSelector({ dateRange, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  
  const predefinedRanges = getPredefinedDateRanges()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handlePredefinedRange = (range: DateRange) => {
    onChange(range)
    setIsOpen(false)
    setCustomMode(false)
  }

  const handleCustomRange = () => {
    setCustomMode(true)
    setIsOpen(false)
  }

  const getCurrentRangeLabel = () => {
    const ranges = getPredefinedDateRanges()
    
    // Check if current range matches any predefined range
    for (const [key, range] of Object.entries(ranges)) {
      if (range.startDate === dateRange.startDate && range.endDate === dateRange.endDate) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      }
    }
    
    // Custom range
    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Calendar className="w-4 h-4" />
        <span>{getCurrentRangeLabel()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="space-y-1">
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.today)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Today
              </button>
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.yesterday)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Yesterday
              </button>
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.lastWeek)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Last 7 days
              </button>
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.lastMonth)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Last 30 days
              </button>
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.lastQuarter)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Last 3 months
              </button>
              <button
                onClick={() => handlePredefinedRange(predefinedRanges.lastYear)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Last year
              </button>
              <hr className="my-2" />
              <button
                onClick={handleCustomRange}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Custom range
              </button>
            </div>
          </div>
        </div>
      )}

      {customMode && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Date Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => onChange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => onChange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCustomMode(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCustomMode(false)}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(isOpen || customMode) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsOpen(false)
            setCustomMode(false)
          }}
        />
      )}
    </div>
  )
}