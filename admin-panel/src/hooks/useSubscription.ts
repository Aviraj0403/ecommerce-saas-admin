import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import type {
  SubscriptionResponse,
  PlansResponse,
  UpgradePlanData,
  DowngradePlanData,
  Subscription
} from '@/types/subscription.types';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get<SubscriptionResponse>('/subscription'),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get<PlansResponse>('/subscription/plans'),
  });
}

export function useUpgradePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpgradePlanData) => 
      apiClient.post<Subscription>('/subscription/upgrade', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success(`Successfully upgraded to ${data.planName} plan!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upgrade plan');
    },
  });
}

export function useDowngradePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DowngradePlanData) => 
      apiClient.post<Subscription>('/subscription/downgrade', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success(`Successfully downgraded to ${data.planName} plan`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to downgrade plan');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/subscription/cancel'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/subscription/reactivate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription reactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reactivate subscription');
    },
  });
}