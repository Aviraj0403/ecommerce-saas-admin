import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useCustomers, useUpdateCustomerStatus, useExportCustomers, type Customer } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Search, 
  Download,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [spentRange, setSpentRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: customersData, isLoading, error } = useCustomers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    emailVerified: verificationFilter === 'verified' ? true : verificationFilter === 'unverified' ? false : undefined,
    minTotalSpent: spentRange.min ? parseFloat(spentRange.min) : undefined,
    maxTotalSpent: spentRange.max ? parseFloat(spentRange.max) : undefined,
    registrationDateFrom: dateRange.start || undefined,
    registrationDateTo: dateRange.end || undefined,
  });

  const updateCustomerStatusMutation = useUpdateCustomerStatus();
  const exportCustomersMutation = useExportCustomers();

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleToggleCustomerStatus = async (customer: Customer) => {
    try {
      await updateCustomerStatusMutation.mutateAsync({
        id: customer.id,
        isActive: !customer.isActive,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExportCustomers = () => {
    exportCustomersMutation.mutate({
      search: globalFilter,
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      emailVerified: verificationFilter === 'verified' ? true : verificationFilter === 'unverified' ? false : undefined,
      minTotalSpent: spentRange.min ? parseFloat(spentRange.min) : undefined,
      maxTotalSpent: spentRange.max ? parseFloat(spentRange.max) : undefined,
      registrationDateFrom: dateRange.start || undefined,
      registrationDateTo: dateRange.end || undefined,
    });
  };

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }: any) => (
        <button
          className="flex items-center gap-2 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Customer
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp size={14} />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </button>
      ),
      cell: ({ getValue, row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt={getValue()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-medium text-sm">
                {getValue().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                 onClick={() => handleViewCustomer(row.original)}>
              {getValue()}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ getValue, row }: any) => (
        <div className="text-sm">
          <div className="text-gray-900">{getValue()}</div>
          <div className="flex items-center gap-2 mt-1">
            {row.original.emailVerified && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Email ✓
              </span>
            )}
            {row.original.phoneVerified && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Phone ✓
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalOrders',
      header: ({ column }: any) => (
        <button
          className="flex items-center gap-2 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Orders
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp size={14} />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </button>
      ),
      cell: ({ getValue, row }: any) => (
        <div className="text-sm">
          <div className="font-medium">{getValue()} orders</div>
          <div className="text-gray-500">
            ₹{row.original.averageOrderValue.toLocaleString()} avg
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: ({ column }: any) => (
        <button
          className="flex items-center gap-2 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Spent
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp size={14} />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </button>
      ),
      cell: ({ getValue }: any) => (
        <div className="font-medium">₹{getValue().toLocaleString()}</div>
      ),
    },
    {
      accessorKey: 'lastOrderDate',
      header: 'Last Order',
      cell: ({ getValue }: any) => {
        const date = getValue();
        return (
          <div className="text-sm text-gray-600">
            {date ? format(new Date(date), 'MMM dd, yyyy') : 'Never'}
          </div>
        );
      },
    },
    {
      accessorKey: 'registrationDate',
      header: ({ column }: any) => (
        <button
          className="flex items-center gap-2 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Joined
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp size={14} />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </button>
      ),
      cell: ({ getValue }: any) => (
        <div className="text-sm text-gray-600">
          {format(new Date(getValue()), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const isActive = getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewCustomer(row.original)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View customer details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleToggleCustomerStatus(row.original)}
            disabled={updateCustomerStatusMutation.isPending}
            className={`p-1 transition-colors ${
              row.original.isActive
                ? 'text-gray-400 hover:text-red-600'
                : 'text-gray-400 hover:text-green-600'
            }`}
            title={row.original.isActive ? 'Deactivate customer' : 'Activate customer'}
          >
            {row.original.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: customersData?.customers || [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: customersData?.totalPages || 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load customers" />;
  }

  const customers = customersData?.customers || [];
  const analytics = customersData?.analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">
            Manage your customer base and analyze customer behavior
          </p>
        </div>
        <button
          onClick={handleExportCustomers}
          disabled={exportCustomersMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Download size={20} />
          {exportCustomersMutation.isPending ? 'Exporting...' : 'Export Customers'}
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.activeCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.newCustomersThisMonth.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Lifetime Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{analytics.averageLifetimeValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Verification Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Verification</option>
            <option value="verified">Email Verified</option>
            <option value="unverified">Email Unverified</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Spent Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total Spent:</span>
            <input
              type="number"
              placeholder="Min"
              value={spentRange.min}
              onChange={(e) => setSpentRange(prev => ({ ...prev, min: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max"
              value={spentRange.max}
              onChange={(e) => setSpentRange(prev => ({ ...prev, max: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Joined:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(spentRange.min || spentRange.max || dateRange.start || dateRange.end) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSpentRange({ min: '', max: '' });
                setDateRange({ start: '', end: '' });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Advanced Filters
            </button>
          </div>
        )}
      </div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="No customers match your current filters"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      customersData?.total || 0
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{customersData?.total || 0}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
