import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import {
  CreateOrderData,
  Order,
  RazorpayOrderResponse,
  RazorpayPaymentResponse,
  PaymentMethod,
} from '@/types/order.types';
import { Address } from '@/types/address.types';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'next/navigation';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Fetch user addresses
export const useAddresses = () => {
  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      return await apiClient.get<Address[]>('/addresses');
    },
  });
};

// Create Razorpay order
export const useCreateRazorpayOrder = () => {
  return useMutation<RazorpayOrderResponse, Error, { amount: number }>({
    mutationFn: async ({ amount }) => {
      return await apiClient.post<RazorpayOrderResponse>('/payments/razorpay/create-order', {
        amount,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment order');
    },
  });
};

// Create order
export const useCreateOrder = () => {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation<Order, Error, CreateOrderData>({
    mutationFn: async (data) => {
      return await apiClient.post<Order>('/orders', data);
    },
    onSuccess: (order) => {
      // Clear cart
      clearCart();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });
};

// Load Razorpay SDK
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Process Razorpay payment
export const useRazorpayPayment = () => {
  const createRazorpayOrder = useCreateRazorpayOrder();
  const createOrder = useCreateOrder();

  const processPayment = async (
    amount: number,
    orderData: CreateOrderData,
    userEmail: string,
    userName: string,
    userPhone: string
  ) => {
    try {
      // Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder.mutateAsync({ amount });

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Your Store',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayPaymentResponse) => {
          // Payment successful - create order
          await createOrder.mutateAsync({
            ...orderData,
            paymentMethod: PaymentMethod.RAZORPAY,
            paymentId: response.razorpay_payment_id,
          });
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        toast.error(response.error.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  return {
    processPayment,
    isLoading: createRazorpayOrder.isPending || createOrder.isPending,
  };
};
