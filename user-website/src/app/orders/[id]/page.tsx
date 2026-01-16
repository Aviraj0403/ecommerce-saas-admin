'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { useSocket } from '@/hooks/useSocket';
import { Order, OrderStatus } from '@/types/order.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { toast } from '@/lib/toast';
import { queryClient } from '@/lib/query-client';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: order, isLoading, error } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const { socket, isConnected } = useSocket();

  // Real-time order updates via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    const handleOrderUpdate = (data: { orderId: string; status: OrderStatus; order: Order }) => {
      if (data.orderId === orderId) {
        // Update the order in cache
        queryClient.setQueryData(['order', orderId], data.order);
        
        // Show notification
        toast.info(`Order status updated to ${data.status}`);
      }
    };

    socket.on('order:updated', handleOrderUpdate);

    return () => {
      socket.off('order:updated', handleOrderUpdate);
    };
  }, [socket, isConnected, orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      await cancelOrder.mutateAsync(order.id);
      setShowCancelDialog(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Failed to load order details" />
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PROCESSING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
              <p className="text-gray-600 mt-1">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600 mt-1">Order #{order.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p className="mt-1">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">Method:</span> {order.paymentMethod}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-gray-900">Status:</span>{' '}
                  <span
                    className={
                      order.paymentStatus === 'COMPLETED'
                        ? 'text-green-600'
                        : order.paymentStatus === 'FAILED'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
                {order.paymentId && (
                  <p className="mt-1">
                    <span className="font-medium text-gray-900">Payment ID:</span> {order.paymentId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Tracking Information
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Tracking Number:</span> {order.trackingNumber}
              </p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ₹{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{item.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {order.shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${order.shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
              </div>
              <div className="pb-8">
                <p className="font-medium text-gray-900">Order Placed</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {order.status !== OrderStatus.PENDING && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === OrderStatus.CANCELLED ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <CheckCircle className={`w-5 h-5 ${
                      order.status === OrderStatus.CANCELLED ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  {[OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="pb-8">
                  <p className="font-medium text-gray-900">
                    {order.status === OrderStatus.CANCELLED ? 'Order Cancelled' : 'Order Confirmed'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {[OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  {[OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="pb-8">
                  <p className="font-medium text-gray-900">Processing</p>
                  <p className="text-sm text-gray-600">Your order is being prepared</p>
                </div>
              </div>
            )}

            {[OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  {order.status === OrderStatus.DELIVERED && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="pb-8">
                  <p className="font-medium text-gray-900">Shipped</p>
                  <p className="text-sm text-gray-600">Your order is on the way</p>
                </div>
              </div>
            )}

            {order.status === OrderStatus.DELIVERED && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Delivered</p>
                  <p className="text-sm text-gray-600">Your order has been delivered</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/products')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
          {order.status === OrderStatus.PENDING && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Order?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={cancelOrder.isPending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelOrder.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelOrder.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
