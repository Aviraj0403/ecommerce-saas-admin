import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useCustomerOrders, useUpdateCustomerStatus } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: customer, isLoading, error } = useCustomer(id!);
  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders(id!, ordersPage, 10);
  const updateCustomerStatusMutation = useUpdateCustomerStatus();

  const handleToggleStatus = async () => {
    if (!customer) return;

    try {
      await updateCustomerStatusMutation.mutateAsync({
        id: customer.id,
        isActive: !customer.isActive,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return <ErrorMessage message="Failed to load customer details" />;
  }

  const orders = ordersData?.orders || [];
  const ordersTotal = ordersData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">Customer since {format(new Date(customer.registrationDate), 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              customer.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={handleToggleStatus}
            disabled={updateCustomerStatusMutation.isPending}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              customer.isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {customer.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
            {customer.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{customer.analytics.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lifetime Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{customer.analytics.lifetimeValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{customer.analytics.averageOrderValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
            {customer.analytics.ordersByMonth.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customer.analytics.ordersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'orders' ? `${value} orders` : `₹${value.toLocaleString()}`,
                        name === 'orders' ? 'Orders' : 'Revenue'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="orders"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No purchase history available
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              {ordersTotal > 10 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrdersPage(prev => Math.max(1, prev - 1))}
                    disabled={ordersPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {ordersPage} of {Math.ceil(ordersTotal / 10)}
                  </span>
                  <button
                    onClick={() => setOrdersPage(prev => prev + 1)}
                    disabled={ordersPage >= Math.ceil(ordersTotal / 10)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₹{order.total.toLocaleString()}</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-gray-400" size={20} />
              <h2 className="text-lg font-semibold">Customer Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {customer.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{customer.email}</span>
                  {customer.emailVerified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{customer.phone}</span>
                  {customer.phoneVerified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {format(new Date(customer.registrationDate), 'MMM dd, yyyy')}</span>
                </div>

                {customer.analytics.lastPurchaseDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShoppingBag size={16} className="text-gray-400" />
                    <span>Last order {format(new Date(customer.analytics.lastPurchaseDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-gray-400" size={20} />
                <h2 className="text-lg font-semibold">Addresses</h2>
              </div>
              <div className="space-y-3">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{address.name}</p>
                        <p className="text-gray-600">{address.address}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.pincode}
                        </p>
                        <p className="text-gray-600">{address.phone}</p>
                      </div>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Behavior */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Purchase Behavior</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Frequency</span>
                <span className="font-medium">
                  {customer.analytics.purchaseFrequency.toFixed(1)} orders/month
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{customer.analytics.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-medium">₹{customer.analytics.averageOrderValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lifetime Value</span>
                <span className="font-medium">₹{customer.analytics.lifetimeValue.toLocaleString()}</span>
              </div>
            </div>

            {customer.analytics.favoriteCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">Favorite Categories</p>
                <div className="flex flex-wrap gap-1">
                  {customer.analytics.favoriteCategories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}