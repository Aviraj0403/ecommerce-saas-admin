import { toast } from '@/lib/toast';

export function handleAuthError(error: any, redirectToLogin = true): void {
  // Clear auth data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Clear any other auth-related data
    localStorage.removeItem('cart');
    localStorage.removeItem('tenant_id');
  }

  // Show user-friendly message
  toast.error('Your session has expired', 'Please log in again to continue');

  // Redirect to login with return URL
  if (redirectToLogin && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const returnUrl = currentPath !== '/login' ? `?returnUrl=${encodeURIComponent(currentPath)}` : '';
    
    // Small delay to allow toast to show
    setTimeout(() => {
      window.location.href = `/login${returnUrl}`;
    }, 1000);
  }
}

export function handleForbiddenError(error: any): void {
  toast.error('Access denied', 'You do not have permission to perform this action');
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401;
}

export function isForbiddenError(error: any): boolean {
  return error?.response?.status === 403;
}