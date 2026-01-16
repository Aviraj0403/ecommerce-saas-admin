import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { Order } from '@/types/order.types';

// Fetch user orders
export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      return await apiClient.get<Order[]>('/orders');
    },
  });
};

// Fetch single order
export const useOrder = (orderId: string) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      return await apiClient.get<Order>(`/orders/${orderId}`);
    },
    enabled: !!orderId,
  });
};

// Cancel order
export const useCancelOrder = () => {
  return useMutation<Order, Error, string>({
    mutationFn: async (orderId) => {
      return await apiClient.patch<Order>(`/orders/${orderId}/cancel`);
    },
    onSuccess: (order) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      
      // Show success message
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });
};
