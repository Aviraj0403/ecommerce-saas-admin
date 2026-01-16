import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSettings,
  useUpdateBusinessSettings,
  useUpdateBrandingSettings,
  useUpdatePaymentSettings,
  useUpdateDeliverySettings,
  useTestRazorpayConnection,
  useTestShiprocketConnection,
  useTestDelhiveryConnection
} from '@/hooks/useSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  Building2,
  Palette,
  CreditCard,
  Truck,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';

type TabType = 'business' | 'branding' | 'payment' | 'delivery';

const businessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().optional(),
  businessEmail: z.string().email('Invalid email address'),
  businessPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  taxId: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
});

const brandingSchema = z.object({
  logo: z.string().url('Invalid URL').optional().or(z.literal('')),
  favicon: z.string().url('Invalid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  fontFamily: z.string().min(1, 'Font family is required'),
  customCSS: z.string().optional(),
});

const paymentSchema = z.object({
  razorpay: z.object({
    keyId: z.string().min(1, 'Razorpay Key ID is required'),
    keySecret: z.string().min(1, 'Razorpay Key Secret is required'),
    webhookSecret: z.string().optional(),
    enabled: z.boolean(),
  }),
  cod: z.object({
    enabled: z.boolean(),
    minOrderAmount: z.number().min(0).optional(),
    maxOrderAmount: z.number().min(0).optional(),
  }),
});

const deliverySchema = z.object({
  shiprocket: z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().optional(),
    channelId: z.string().optional(),
    enabled: z.boolean(),
  }),
  delhivery: z.object({
    token: z.string().optional(),
    enabled: z.boolean(),
  }),
  selfDelivery: z.object({
    enabled: z.boolean(),
    charges: z.number().min(0, 'Charges must be positive'),
    freeDeliveryThreshold: z.number().min(0).optional(),
  }),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('business');
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showShiprocketPassword, setShowShiprocketPassword] = useState(false);
  const [showDelhiveryToken, setShowDelhiveryToken] = useState(false);

  const { data: settings, isLoading, error } = useSettings();
  
  const updateBusinessSettings = useUpdateBusinessSettings();
  const updateBrandingSettings = useUpdateBrandingSettings();
  const updatePaymentSettings = useUpdatePaymentSettings();
  const updateDeliverySettings = useUpdateDeliverySettings();
  
  const testRazorpay = useTestRazorpayConnection();
  const testShiprocket = useTestShiprocketConnection();
  const testDelhivery = useTestDelhiveryConnection();

  const businessForm = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: '',
      businessDescription: '',
      businessEmail: '',
      businessPhone: '',
      businessAddress: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
      },
      taxId: '',
      website: '',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });

  const brandingForm = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logo: '',
      favicon: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      customCSS: '',
    },
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      razorpay: {
        keyId: '',
        keySecret: '',
        webhookSecret: '',
        enabled: false,
      },
      cod: {
        enabled: true,
        minOrderAmount: 0,
        maxOrderAmount: 50000,
      },
    },
  });

  const deliveryForm = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      shiprocket: {
        email: '',
        password: '',
        channelId: '',
        enabled: false,
      },
      delhivery: {
        token: '',
        enabled: false,
      },
      selfDelivery: {
        enabled: true,
        charges: 50,
        freeDeliveryThreshold: 500,
      },
    },
  });

  // Update forms when settings data is loaded
  useEffect(() => {
    if (settings) {
      businessForm.reset(settings.business);
      brandingForm.reset(settings.branding);
      paymentForm.reset(settings.payment);
      deliveryForm.reset(settings.delivery);
    }
  }, [settings, businessForm, brandingForm, paymentForm, deliveryForm]);

  const tabs = [
    { id: 'business' as TabType, name: 'Business', icon: Building2 },
    { id: 'branding' as TabType, name: 'Branding', icon: Palette },
    { id: 'payment' as TabType, name: 'Payment', icon: CreditCard },
    { id: 'delivery' as TabType, name: 'Delivery', icon: Truck },
  ];

  const onBusinessSubmit = async (data: any) => {
    try {
      await updateBusinessSettings.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onBrandingSubmit = async (data: any) => {
    try {
      await updateBrandingSettings.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onPaymentSubmit = async (data: any) => {
    try {
      await updatePaymentSettings.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onDeliverySubmit = async (data: any) => {
    try {
      await updateDeliverySettings.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTestRazorpay = async () => {
    const values = paymentForm.getValues();
    if (values.razorpay.keyId && values.razorpay.keySecret) {
      await testRazorpay.mutateAsync({
        keyId: values.razorpay.keyId,
        keySecret: values.razorpay.keySecret,
      });
    }
  };

  const handleTestShiprocket = async () => {
    const values = deliveryForm.getValues();
    if (values.shiprocket.email && values.shiprocket.password) {
      await testShiprocket.mutateAsync({
        email: values.shiprocket.email,
        password: values.shiprocket.password,
      });
    }
  };

  const handleTestDelhivery = async () => {
    const values = deliveryForm.getValues();
    if (values.delhivery.token) {
      await testDelhivery.mutateAsync({
        token: values.delhivery.token,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load settings" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Business Settings */}
          {activeTab === 'business' && (
            <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      {...businessForm.register('businessName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {businessForm.formState.errors.businessName && (
                      <p className="text-red-600 text-sm mt-1">
                        {businessForm.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email *
                    </label>
                    <input
                      {...businessForm.register('businessEmail')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {businessForm.formState.errors.businessEmail && (
                      <p className="text-red-600 text-sm mt-1">
                        {businessForm.formState.errors.businessEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone *
                    </label>
                    <input
                      {...businessForm.register('businessPhone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {businessForm.formState.errors.businessPhone && (
                      <p className="text-red-600 text-sm mt-1">
                        {businessForm.formState.errors.businessPhone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      {...businessForm.register('website')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                    {businessForm.formState.errors.website && (
                      <p className="text-red-600 text-sm mt-1">
                        {businessForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    {...businessForm.register('businessDescription')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your business..."
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Business Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        {...businessForm.register('businessAddress.street')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        {...businessForm.register('businessAddress.city')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        {...businessForm.register('businessAddress.state')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        {...businessForm.register('businessAddress.country')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        {...businessForm.register('businessAddress.postalCode')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    <input
                      {...businessForm.register('taxId')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="GST/VAT Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone *
                    </label>
                    <select
                      {...businessForm.register('timezone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      {...businessForm.register('currency')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateBusinessSettings.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {updateBusinessSettings.isPending && <LoadingSpinner size="sm" />}
                  <span>Save Business Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* Branding Settings */}
          {activeTab === 'branding' && (
            <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Identity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      {...brandingForm.register('logo')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                    {brandingForm.formState.errors.logo && (
                      <p className="text-red-600 text-sm mt-1">
                        {brandingForm.formState.errors.logo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Favicon URL
                    </label>
                    <input
                      {...brandingForm.register('favicon')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/favicon.ico"
                    />
                    {brandingForm.formState.errors.favicon && (
                      <p className="text-red-600 text-sm mt-1">
                        {brandingForm.formState.errors.favicon.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Color Scheme</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          {...brandingForm.register('primaryColor')}
                          type="color"
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          {...brandingForm.register('primaryColor')}
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="#3B82F6"
                        />
                      </div>
                      {brandingForm.formState.errors.primaryColor && (
                        <p className="text-red-600 text-sm mt-1">
                          {brandingForm.formState.errors.primaryColor.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          {...brandingForm.register('secondaryColor')}
                          type="color"
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          {...brandingForm.register('secondaryColor')}
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="#1F2937"
                        />
                      </div>
                      {brandingForm.formState.errors.secondaryColor && (
                        <p className="text-red-600 text-sm mt-1">
                          {brandingForm.formState.errors.secondaryColor.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accent Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          {...brandingForm.register('accentColor')}
                          type="color"
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          {...brandingForm.register('accentColor')}
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="#10B981"
                        />
                      </div>
                      {brandingForm.formState.errors.accentColor && (
                        <p className="text-red-600 text-sm mt-1">
                          {brandingForm.formState.errors.accentColor.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family *
                  </label>
                  <select
                    {...brandingForm.register('fontFamily')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom CSS
                  </label>
                  <textarea
                    {...brandingForm.register('customCSS')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="/* Add your custom CSS here */"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add custom CSS to override default styles. Use with caution.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateBrandingSettings.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {updateBrandingSettings.isPending && <LoadingSpinner size="sm" />}
                  <span>Save Branding Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                
                {/* Razorpay Settings */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-md font-medium text-gray-900">Razorpay</h4>
                      <span className="text-sm text-gray-500">Online Payments</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        {...paymentForm.register('razorpay.enabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key ID *
                      </label>
                      <input
                        {...paymentForm.register('razorpay.keyId')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="rzp_test_..."
                      />
                      {paymentForm.formState.errors.razorpay?.keyId && (
                        <p className="text-red-600 text-sm mt-1">
                          {paymentForm.formState.errors.razorpay.keyId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key Secret *
                      </label>
                      <div className="relative">
                        <input
                          {...paymentForm.register('razorpay.keySecret')}
                          type={showRazorpaySecret ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showRazorpaySecret ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {paymentForm.formState.errors.razorpay?.keySecret && (
                        <p className="text-red-600 text-sm mt-1">
                          {paymentForm.formState.errors.razorpay.keySecret.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook Secret
                      </label>
                      <input
                        {...paymentForm.register('razorpay.webhookSecret')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional webhook secret"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleTestRazorpay}
                        disabled={testRazorpay.isPending}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {testRazorpay.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-md font-medium text-gray-900">Cash on Delivery</h4>
                      <span className="text-sm text-gray-500">COD</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        {...paymentForm.register('cod.enabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order Amount (₹)
                      </label>
                      <input
                        {...paymentForm.register('cod.minOrderAmount', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Order Amount (₹)
                      </label>
                      <input
                        {...paymentForm.register('cod.maxOrderAmount', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatePaymentSettings.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {updatePaymentSettings.isPending && <LoadingSpinner size="sm" />}
                  <span>Save Payment Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* Delivery Settings */}
          {activeTab === 'delivery' && (
            <form onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Providers</h3>
                
                {/* Shiprocket Settings */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-md font-medium text-gray-900">Shiprocket</h4>
                      <span className="text-sm text-gray-500">Third-party Logistics</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        {...deliveryForm.register('shiprocket.enabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        {...deliveryForm.register('shiprocket.email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          {...deliveryForm.register('shiprocket.password')}
                          type={showShiprocketPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowShiprocketPassword(!showShiprocketPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showShiprocketPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Channel ID
                      </label>
                      <input
                        {...deliveryForm.register('shiprocket.channelId')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional channel ID"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleTestShiprocket}
                        disabled={testShiprocket.isPending}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {testShiprocket.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delhivery Settings */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-md font-medium text-gray-900">Delhivery</h4>
                      <span className="text-sm text-gray-500">Third-party Logistics</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        {...deliveryForm.register('delhivery.enabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Token
                      </label>
                      <div className="relative">
                        <input
                          {...deliveryForm.register('delhivery.token')}
                          type={showDelhiveryToken ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDelhiveryToken(!showDelhiveryToken)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showDelhiveryToken ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleTestDelhivery}
                        disabled={testDelhivery.isPending}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {testDelhivery.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Self Delivery Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-md font-medium text-gray-900">Self Delivery</h4>
                      <span className="text-sm text-gray-500">In-house Delivery</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        {...deliveryForm.register('selfDelivery.enabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Charges (₹)
                      </label>
                      <input
                        {...deliveryForm.register('selfDelivery.charges', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Free Delivery Threshold (₹)
                      </label>
                      <input
                        {...deliveryForm.register('selfDelivery.freeDeliveryThreshold', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateDeliverySettings.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {updateDeliverySettings.isPending && <LoadingSpinner size="sm" />}
                  <span>Save Delivery Settings</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}