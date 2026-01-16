import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface DashboardMetrics {
  revenue: {
    total: number;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    period: string;
  };
  products: {
    total: number;
    change: number;
    period: string;
  };
  customers: {
    total: number;
    change: number;
    period: string;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  salesCount: number;
  revenue: number;
}

// Fetch dashboard metrics
export const useDashboardMetrics = () => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      return await apiClient.get<DashboardMetrics>('/admin/dashboard/metrics');
    },
  });
};

// Fetch revenue data for charts
export const useRevenueData = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  return useQuery<RevenueData[]>({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: async () => {
      return await apiClient.get<RevenueData[]>(`/admin/dashboard/revenue?period=${period}`);
    },
  });
};

// Fetch recent orders
export const useRecentOrders = () => {
  return useQuery<RecentOrder[]>({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: async () => {
      return await apiClient.get<RecentOrder[]>('/admin/dashboard/recent-orders');
    },
  });
};

// Fetch top-selling products
export const useTopProducts = () => {
  return useQuery<TopProduct[]>({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async () => {
      return await apiClient.get<TopProduct[]>('/admin/dashboard/top-products');
    },
  });
};