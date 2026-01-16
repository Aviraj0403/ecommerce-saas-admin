import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import type {
  TenantSettings,
  UpdateBusinessSettingsData,
  UpdateBrandingSettingsData,
  UpdatePaymentSettingsData,
  UpdateDeliverySettingsData,
  TestConnectionResponse
} from '@/types/settings.types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.get<TenantSettings>('/settings'),
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessSettingsData) => 
      apiClient.put<TenantSettings>('/settings/business', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Business settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update business settings');
    },
  });
}

export function useUpdateBrandingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBrandingSettingsData) => 
      apiClient.put<TenantSettings>('/settings/branding', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Branding settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update branding settings');
    },
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePaymentSettingsData) => 
      apiClient.put<TenantSettings>('/settings/payment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Payment settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment settings');
    },
  });
}

export function useUpdateDeliverySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDeliverySettingsData) => 
      apiClient.put<TenantSettings>('/settings/delivery', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Delivery settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update delivery settings');
    },
  });
}

export function useTestRazorpayConnection() {
  return useMutation({
    mutationFn: (credentials: { keyId: string; keySecret: string }) => 
      apiClient.post<TestConnectionResponse>('/settings/test/razorpay', credentials),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Razorpay connection successful');
      } else {
        toast.error(data.message || 'Razorpay connection failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to test Razorpay connection');
    },
  });
}

export function useTestShiprocketConnection() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      apiClient.post<TestConnectionResponse>('/settings/test/shiprocket', credentials),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Shiprocket connection successful');
      } else {
        toast.error(data.message || 'Shiprocket connection failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to test Shiprocket connection');
    },
  });
}

export function useTestDelhiveryConnection() {
  return useMutation({
    mutationFn: (credentials: { token: string }) => 
      apiClient.post<TestConnectionResponse>('/settings/test/delhivery', credentials),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Delhivery connection successful');
      } else {
        toast.error(data.message || 'Delhivery connection failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to test Delhivery connection');
    },
  });
}