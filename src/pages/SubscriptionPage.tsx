import { useState } from 'react';
import { 
  useSubscription, 
  usePlans, 
  useUpgradePlan, 
  useDowngradePlan,
  useCancelSubscription,
  useReactivateSubscription
} from '@/hooks/useSubscription';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  Crown, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  X,
  Package,
  ShoppingCart,
  Database,
  Zap,
  Users,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import type { Plan } from '@/types/subscription.types';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [downgradeReason, setDowngradeReason] = useState('');

  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  
  const upgradePlan = useUpgradePlan();
  const downgradePlan = useDowngradePlan();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();

  const subscription = subscriptionData?.subscription;
  const currentPlan = subscriptionData?.currentPlan;
  const usage = subscriptionData?.usage;
  const plans = plansData?.plans || [];

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleUpgrade = async (plan: Plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleDowngrade = async (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDowngradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;
    
    try {
      await upgradePlan.mutateAsync({ planId: selectedPlan.id });
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan) return;
    
    try {
      await downgradePlan.mutateAsync({ 
        planId: selectedPlan.id,
        reason: downgradeReason 
      });
      setShowDowngradeModal(false);
      setSelectedPlan(null);
      setDowngradeReason('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const confirmCancel = async () => {
    try {
      await cancelSubscription.mutateAsync();
      setShowCancelModal(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateSubscription.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (subscriptionError) {
    return <ErrorMessage message="Failed to load subscription data" />;
  }

  const isExpired = subscription?.status === 'expired';
  const isCancelled = subscription?.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
        </div>
        {subscription && (
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-gray-900">{currentPlan?.name} Plan</span>
          </div>
        )}
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'expired'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Current Period</p>
                <p className="font-medium">
                  {format(new Date(subscription.currentPeriodStart), 'MMM dd')} - {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Plan Price</p>
                <p className="font-medium">
                  ₹{currentPlan?.price.toLocaleString()}/{currentPlan?.interval}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="font-medium">
                  {isCancelled ? 'Cancelled' : format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Expiration/Cancellation Warnings */}
          {(isExpired || isCancelled) && (
            <div className={`p-4 rounded-lg mb-4 ${
              isExpired ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-yellow-600'}`} />
                <div>
                  {isExpired ? (
                    <div>
                      <p className="font-medium text-red-800">Subscription Expired</p>
                      <p className="text-red-700 text-sm">Your subscription expired on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}. Please renew to continue using premium features.</p>
                      <button
                        onClick={handleReactivate}
                        disabled={reactivateSubscription.isPending}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {reactivateSubscription.isPending ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                        <span>Reactivate Subscription</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-yellow-800">Subscription Cancelled</p>
                      <p className="text-yellow-700 text-sm">Your subscription will end on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}. You can reactivate anytime before then.</p>
                      <button
                        onClick={handleReactivate}
                        disabled={reactivateSubscription.isPending}
                        className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {reactivateSubscription.isPending ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                        <span>Reactivate Subscription</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Metrics */}
      {usage && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Products */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Products</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.products.used}/{usage.products.limit === -1 ? '∞' : usage.products.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.products.used, usage.products.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.products.used, usage.products.limit)}%` }}
                />
              </div>
              {getUsagePercentage(usage.products.used, usage.products.limit) >= 90 && (
                <p className="text-xs text-red-600">Limit almost reached!</p>
              )}
            </div>

            {/* Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Orders</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.orders.used}/{usage.orders.limit === -1 ? '∞' : usage.orders.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.orders.used, usage.orders.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.orders.used, usage.orders.limit)}%` }}
                />
              </div>
              {getUsagePercentage(usage.orders.used, usage.orders.limit) >= 90 && (
                <p className="text-xs text-red-600">Limit almost reached!</p>
              )}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.storage.used}GB/{usage.storage.limit === -1 ? '∞' : `${usage.storage.limit}GB`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.storage.used, usage.storage.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.storage.used, usage.storage.limit)}%` }}
                />
              </div>
              {getUsagePercentage(usage.storage.used, usage.storage.limit) >= 90 && (
                <p className="text-xs text-red-600">Limit almost reached!</p>
              )}
            </div>

            {/* API Calls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">API Calls</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.apiCalls.used.toLocaleString()}/{usage.apiCalls.limit === -1 ? '∞' : usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit)}%` }}
                />
              </div>
              {getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit) >= 90 && (
                <p className="text-xs text-red-600">Limit almost reached!</p>
              )}
            </div>

            {/* Users */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Users</span>
                </div>
                <span className="text-sm text-gray-600">
                  {usage.users.used}/{usage.users.limit === -1 ? '∞' : usage.users.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.users.used, usage.users.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.users.used, usage.users.limit)}%` }}
                />
              </div>
              {getUsagePercentage(usage.users.used, usage.users.limit) >= 90 && (
                <p className="text-xs text-red-600">Limit almost reached!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            const canUpgrade = currentPlan && plan.price > currentPlan.price;
            const canDowngrade = currentPlan && plan.price < currentPlan.price;
            
            return (
              <div 
                key={plan.id} 
                className={`relative border rounded-lg p-6 ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50' 
                    : plan.popular 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span>{plan.limits.products === -1 ? 'Unlimited' : plan.limits.products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span>{plan.limits.orders === -1 ? 'Unlimited' : plan.limits.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span>{plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls:</span>
                    <span>{plan.limits.apiCalls === -1 ? 'Unlimited' : plan.limits.apiCalls.toLocaleString()}</span>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="space-y-2">
                    {canUpgrade && (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upgrade to {plan.name}
                      </button>
                    )}
                    {canDowngrade && (
                      <button
                        onClick={() => handleDowngrade(plan)}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Downgrade to {plan.name}
                      </button>
                    )}
                    {!canUpgrade && !canDowngrade && plan.type !== 'free' && (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select {plan.name}
                      </button>
                    )}
                  </div>
                )}

                {isCurrent && !isCancelled && subscription?.status === 'active' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upgrade to {selectedPlan.name}
              </h3>
              <p className="text-gray-600 mb-4">
                You're about to upgrade to the {selectedPlan.name} plan for ₹{selectedPlan.price.toLocaleString()}/{selectedPlan.interval}.
                The upgrade will take effect immediately.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpgrade}
                  disabled={upgradePlan.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {upgradePlan.isPending && <LoadingSpinner size="sm" />}
                  <span>Confirm Upgrade</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Downgrade to {selectedPlan.name}
              </h3>
              <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">Important Notice</p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Downgrading may result in loss of features and data. Please review the plan limits carefully.
                  </p>
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for downgrade (optional)
                  </label>
                  <textarea
                    id="reason"
                    value={downgradeReason}
                    onChange={(e) => setDowngradeReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Help us improve by sharing why you're downgrading..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDowngradeModal(false);
                    setSelectedPlan(null);
                    setDowngradeReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDowngrade}
                  disabled={downgradePlan.isPending}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {downgradePlan.isPending && <LoadingSpinner size="sm" />}
                  <span>Confirm Downgrade</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancel Subscription
              </h3>
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-medium">Are you sure?</p>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    Your subscription will remain active until {subscription && format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}, 
                    after which you'll lose access to premium features.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelSubscription.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {cancelSubscription.isPending && <LoadingSpinner size="sm" />}
                  <span>Cancel Subscription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}