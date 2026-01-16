import { toast } from '@/lib/toast';

export function handleAuthError(error: any, redirectToLogin = true): void {
  // Clear auth data
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');

  // Show user-friendly message
  toast.error('Your session has expired', {
    description: 'Please log in again to continue',
    duration: 4000,
  });

  // Redirect to login
  if (redirectToLogin) {
    // Small delay to allow toast to show
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
}

export function handleForbiddenError(error: any): void {
  toast.error('Access denied', {
    description: 'You do not have permission to perform this action',
    duration: 5000,
  });
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401;
}

export function isForbiddenError(error: any): boolean {
  return error?.response?.status === 403;
}