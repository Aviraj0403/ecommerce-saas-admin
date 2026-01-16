import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { Address, AddressFormData } from '@/types/address.types';

// Fetch user addresses
export const useAddresses = () => {
  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      return await apiClient.get<Address[]>('/addresses');
    },
  });
};

// Create address
export const useCreateAddress = () => {
  return useMutation<Address, Error, AddressFormData>({
    mutationFn: async (data) => {
      return await apiClient.post<Address>('/addresses', data);
    },
    onSuccess: () => {
      // Invalidate addresses query
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      
      // Show success message
      toast.success('Address added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address');
    },
  });
};

// Update address
export const useUpdateAddress = () => {
  return useMutation<Address, Error, { id: string; data: AddressFormData }>({
    mutationFn: async ({ id, data }) => {
      return await apiClient.put<Address>(`/addresses/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate addresses query
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      
      // Show success message
      toast.success('Address updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update address');
    },
  });
};

// Delete address
export const useDeleteAddress = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return await apiClient.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      // Invalidate addresses query
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      
      // Show success message
      toast.success('Address deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    },
  });
};

// Set default address
export const useSetDefaultAddress = () => {
  return useMutation<Address, Error, string>({
    mutationFn: async (id) => {
      return await apiClient.patch<Address>(`/addresses/${id}/default`);
    },
    onSuccess: () => {
      // Invalidate addresses query
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      
      // Show success message
      toast.success('Default address updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    },
  });
};
