export interface BusinessSettings {
  businessName: string;
  businessDescription?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  taxId?: string;
  website?: string;
  timezone: string;
  currency: string;
}

export interface BrandingSettings {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface PaymentSettings {
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
    enabled: boolean;
  };
  cod: {
    enabled: boolean;
    minOrderAmount?: number;
    maxOrderAmount?: number;
  };
}

export interface DeliverySettings {
  shiprocket: {
    email: string;
    password: string;
    channelId?: string;
    enabled: boolean;
  };
  delhivery: {
    token: string;
    enabled: boolean;
  };
  selfDelivery: {
    enabled: boolean;
    charges: number;
    freeDeliveryThreshold?: number;
  };
}

export interface TenantSettings {
  id: string;
  business: BusinessSettings;
  branding: BrandingSettings;
  payment: PaymentSettings;
  delivery: DeliverySettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBusinessSettingsData {
  businessName?: string;
  businessDescription?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: Partial<BusinessSettings['businessAddress']>;
  taxId?: string;
  website?: string;
  timezone?: string;
  currency?: string;
}

export interface UpdateBrandingSettingsData {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  customCSS?: string;
}

export interface UpdatePaymentSettingsData {
  razorpay?: Partial<PaymentSettings['razorpay']>;
  cod?: Partial<PaymentSettings['cod']>;
}

export interface UpdateDeliverySettingsData {
  shiprocket?: Partial<DeliverySettings['shiprocket']>;
  delhivery?: Partial<DeliverySettings['delhivery']>;
  selfDelivery?: Partial<DeliverySettings['selfDelivery']>;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: any;
}