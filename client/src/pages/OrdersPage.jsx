/**
 * Orders Page - View order history
 * 
 * Displays all past and pending orders for the logged-in user.
 * Features:
 * - Order list with status badges
 * - Expandable order details
 * - Order tracking info when available
 * - Quick reorder functionality
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { ordersAPI } from '../services/api';

// Status badge colors and icons
const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Processing' },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white border border-street-200 rounded-lg overflow-hidden">
      {/* Order Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-street-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-street-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-street-600" />
            </div>
            <div>
              <p className="font-medium text-street-900">Order #{order.order_number || order.orderNumber}</p>
              <p className="text-sm text-street-500">
                {new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            
            {/* Total */}
            <span className="font-semibold text-ocean-950">
              ${parseFloat(order.total).toFixed(2)}
            </span>
            
            {/* Expand/Collapse */}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-street-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-street-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-street-200 p-4 bg-street-50">
          {/* Order Items */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-street-900">Items</h4>
            {(order.items || order.order_items || []).map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                {item.image_url || item.imageUrl ? (
                  <img 
                    src={item.image_url || item.imageUrl} 
                    alt={item.product_name || item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-street-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-street-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-street-900">{item.product_name || item.productName}</p>
                  {(item.variant_name || item.variantName) && (
                    <p className="text-sm text-street-500">{item.variant_name || item.variantName}</p>
                  )}
                  <p className="text-sm text-street-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-street-900">
                  ${parseFloat(item.total_price || item.totalPrice || item.unit_price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-street-900 mb-2">Shipping Address</h4>
              <div className="text-sm text-street-600">
                {order.shipping_address?.line1 || order.shippingAddress?.line1}<br />
                {order.shipping_address?.city || order.shippingAddress?.city}, {order.shipping_address?.state || order.shippingAddress?.state} {order.shipping_address?.postal_code || order.shippingAddress?.postalCode}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-street-900 mb-2">Order Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-street-600">Subtotal</span>
                  <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-street-600">Shipping</span>
                  <span>${parseFloat(order.shipping_amount || order.shippingAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-street-600">Tax</span>
                  <span>${parseFloat(order.tax_amount || order.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-street-200">
                  <span>Total</span>
                  <span>${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {(order.tracking_number || order.trackingNumber) && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-purple-900">
                <Truck className="w-4 h-4 inline mr-2" />
                Tracking: {order.tracking_number || order.trackingNumber}
              </p>
              {(order.tracking_url || order.trackingUrl) && (
                <a 
                  href={order.tracking_url || order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Track Package →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || response.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Unable to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom max-w-4xl">
          <h1 className="font-display text-3xl tracking-wider mb-8">MY ORDERS</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-street-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-street-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-street-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-street-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="section">
        <div className="container-custom max-w-4xl">
          <h1 className="font-display text-3xl tracking-wider mb-8">MY ORDERS</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-800 mb-4">{error}</p>
            <button onClick={fetchOrders} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="section">
        <div className="container-custom max-w-4xl">
          <h1 className="font-display text-3xl tracking-wider mb-8">MY ORDERS</h1>
          <div className="bg-white border border-street-200 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-street-300 mx-auto mb-4" />
            <h2 className="font-display text-xl tracking-wider mb-2">NO ORDERS YET</h2>
            <p className="text-street-500 mb-6">
              When you place an order, it will appear here.
            </p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="section">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl tracking-wider">MY ORDERS</h1>
          <span className="text-street-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
