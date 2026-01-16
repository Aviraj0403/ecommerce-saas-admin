export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  planType: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'free' | 'basic' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
  description: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

export interface PlanLimits {
  products: number;
  orders: number;
  storage: number; // in GB
  apiCalls: number;
  users: number;
}

export interface UsageMetrics {
  products: {
    used: number;
    limit: number;
  };
  orders: {
    used: number;
    limit: number;
  };
  storage: {
    used: number; // in GB
    limit: number;
  };
  apiCalls: {
    used: number;
    limit: number;
  };
  users: {
    used: number;
    limit: number;
  };
}

export interface SubscriptionResponse {
  subscription: Subscription;
  currentPlan: Plan;
  usage: UsageMetrics;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface UpgradePlanData {
  planId: string;
  paymentMethodId?: string;
}

export interface DowngradePlanData {
  planId: string;
  reason?: string;
}