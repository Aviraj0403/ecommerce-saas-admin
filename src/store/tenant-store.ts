import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant, TenantBranding } from '@/types/tenant.types';
import { initializeTenantResolution } from '@/lib/tenant';

interface TenantState {
  tenant: Tenant | null;
  tenantId: string;
  branding: TenantBranding;
  isLoading: boolean;
  setTenant: (tenant: Tenant) => void;
  updateBranding: (branding: Partial<TenantBranding>) => void;
  setLoading: (loading: boolean) => void;
  clearTenant: () => void;
  initializeTenant: () => void;
}

const defaultBranding: TenantBranding = {
  primaryColor: '#3b82f6',
  secondaryColor: '#2563eb',
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenant: null,
      tenantId: '',
      branding: defaultBranding,
      isLoading: false,

      initializeTenant: () => {
        const resolution = initializeTenantResolution()
        set({ tenantId: resolution.tenantId })
      },

      setTenant: (tenant) => {
        set({
          tenant,
          tenantId: tenant.id,
          branding: { ...defaultBranding, ...tenant.branding },
        });
        
        // Store tenant ID for API requests
        localStorage.setItem('tenant_id', tenant.id)
        
        // Apply branding to document
        if (tenant.branding) {
          if (tenant.branding.primaryColor) {
            document.documentElement.style.setProperty(
              '--color-primary',
              tenant.branding.primaryColor
            );
          }
          if (tenant.branding.secondaryColor) {
            document.documentElement.style.setProperty(
              '--color-secondary',
              tenant.branding.secondaryColor
            );
          }
          if (tenant.branding.favicon) {
            const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            if (favicon) {
              favicon.href = tenant.branding.favicon;
            }
          }
        }
      },

      updateBranding: (branding) => {
        set((state) => ({
          branding: { ...state.branding, ...branding },
          tenant: state.tenant
            ? { ...state.tenant, branding: { ...state.tenant.branding, ...branding } }
            : null,
        }));

        // Apply updated branding
        if (branding.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
        }
        if (branding.secondaryColor) {
          document.documentElement.style.setProperty(
            '--color-secondary',
            branding.secondaryColor
          );
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearTenant: () => {
        set({ tenant: null, tenantId: '', branding: defaultBranding });
        localStorage.removeItem('tenant_id')
      },
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        tenant: state.tenant,
        tenantId: state.tenantId,
        branding: state.branding,
      }),
    }
  )
);
