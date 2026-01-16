export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

export interface TenantSubscription {
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodEnd: string;
}

export interface Tenant {
  id: string;
  businessName: string;
  email: string;
  subdomain: string;
  domain?: string;
  branding: TenantBranding;
  subscription: TenantSubscription;
  createdAt: string;
}
