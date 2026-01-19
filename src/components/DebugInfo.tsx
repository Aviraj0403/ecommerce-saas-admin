import { useAuthStore } from '@/store/auth-store';
import { useTenantStore } from '@/store/tenant-store';

export function DebugInfo() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { tenant, tenantId } = useTenantStore();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Auth Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Tenant ID: {tenantId || 'None'}</div>
        <div>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</div>
        <div>Project ID: {import.meta.env.VITE_PROJECT_ID || 'Not set'}</div>
        <div>Current Path: {window.location.pathname}</div>
      </div>
    </div>
  );
}