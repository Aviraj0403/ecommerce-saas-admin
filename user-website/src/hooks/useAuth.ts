import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  FirebaseAuthData,
  OTPRequest,
  OTPVerification,
} from '@/types';

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: RegisterData) => apiClient.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Registration successful!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}

export function useFirebaseAuth() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: FirebaseAuthData) =>
      apiClient.post<AuthResponse>('/auth/firebase', data),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Authentication failed');
    },
  });
}

export function useSendOTP() {
  return useMutation({
    mutationFn: (data: OTPRequest) => apiClient.post('/auth/otp/send', data),
    onSuccess: () => {
      toast.success('OTP sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });
}

export function useVerifyOTP() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: OTPVerification) =>
      apiClient.post<AuthResponse>('/auth/otp/verify', data),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Logout locally even if API call fails
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const firebaseAuthMutation = useFirebaseAuth();
  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    firebaseAuth: firebaseAuthMutation.mutate,
    sendOTP: sendOTPMutation.mutate,
    verifyOTP: verifyOTPMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticatingWithFirebase: firebaseAuthMutation.isPending,
    isSendingOTP: sendOTPMutation.isPending,
    isVerifyingOTP: verifyOTPMutation.isPending,
  };
}
