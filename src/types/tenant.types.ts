export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

export interface UsageMetrics {
  products: { used: number; limit: number };
  orders: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
}

export interface TenantSubscription {
  id: string;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: UsageMetrics;
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
  updatedAt: string;
}
