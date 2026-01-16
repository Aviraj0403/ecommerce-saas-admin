import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/auth-store';

interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

// Update user profile
export const useUpdateProfile = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<any, Error, UpdateProfileData>({
    mutationFn: async (data) => {
      return await apiClient.patch('/users/profile', data);
    },
    onSuccess: (response) => {
      // Update user in auth store
      updateUser(response);
      
      // Show success message
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};
