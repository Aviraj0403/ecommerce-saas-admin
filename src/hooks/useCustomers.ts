import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  registrationDate: string;
  addresses: CustomerAddress[];
  analytics: CustomerAnalytics;
}

export interface CustomerAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerAnalytics {
  lifetimeValue: number;
  totalOrders: number;
  averageOrderValue: number;
  purchaseFrequency: number; // orders per month
  lastPurchaseDate?: string;
  favoriteCategories: string[];
  ordersByMonth: { month: string; orders: number; revenue: number }[];
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'totalSpent' | 'totalOrders' | 'registrationDate' | 'lastOrderDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
  analytics: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    averageLifetimeValue: number;
  };
}

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () =>
      apiClient.get<CustomersResponse>('/admin/customers', {
        params: filters,
      }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => apiClient.get<Customer>(`/admin/customers/${id}`),
    enabled: !!id,
  });
}

export interface CustomerOrdersResponse {
  orders: any[]; // Using any for now since we're reusing Order type from useOrders
  total: number;
  page: number;
  totalPages: number;
}

export function useCustomerOrders(customerId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['customer-orders', customerId, page, limit],
    queryFn: () =>
      apiClient.get<CustomerOrdersResponse>(`/admin/customers/${customerId}/orders`, {
        params: { page, limit },
      }),
    enabled: !!customerId,
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.put(`/admin/customers/${id}/status`, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success(`Customer ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update customer status');
    },
  });
}

export function useExportCustomers() {
  return useMutation({
    mutationFn: (filters: CustomerFilters) =>
      apiClient.get('/admin/customers/export', {
        params: filters,
        responseType: 'blob',
      }),
    onSuccess: (data) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data as string]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Customers exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export customers');
    },
  });
}