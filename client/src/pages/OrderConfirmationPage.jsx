/**
 * Order Confirmation / Checkout Success Page
 * 
 * This page handles the redirect from Stripe after successful payment.
 * It reads the payment_intent from URL params and displays order confirmation.
 * 
 * URL params from Stripe redirect:
 * - payment_intent: The PaymentIntent ID
 * - payment_intent_client_secret: The client secret
 * - redirect_status: 'succeeded', 'processing', or 'failed'
 * 
 * UPDATED: Now shows success message even if order details can't be fetched
 *          (important for guest checkout where auth session may be lost)
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, AlertCircle, Loader2, ArrowRight, Mail, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get auth state
  const { isAuthenticated } = useAuthStore();
  
  // Get cart clear function
  const clearCart = useCartStore((state) => state.clearCart);

  // Get params from Stripe redirect
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    // Clear cart immediately on page load if payment succeeded
    // This ensures cart is cleared even if order fetch fails
    if (redirectStatus === 'succeeded') {
      clearCart();
    }
    
    if (paymentIntent) {
      fetchOrderDetails();
    } else {
      setIsLoading(false);
      // If we have succeeded status but no payment intent, still show success
      if (redirectStatus === 'succeeded') {
        setError('order_created_no_details');
      } else {
        setError('No payment information found.');
      }
    }
  }, [paymentIntent, redirectStatus]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch order details using the payment intent ID
      const response = await api.get(`/orders/by-payment-intent/${paymentIntent}`);
      
      if (response.data.order || response.data) {
        setOrderDetails(response.data.order || response.data);
      }
      
    } catch (err) {
      console.error('Failed to fetch order by payment intent:', err);
      
      // Only try the authenticated fallback if user is logged in
      if (isAuthenticated) {
        try {
          const ordersResponse = await api.get('/orders');
          const orders = ordersResponse.data.orders || ordersResponse.data || [];
          
          if (orders.length > 0) {
            // Use the most recent order (it's probably the one we just placed)
            setOrderDetails(orders[0]);
          } else {
            // Payment succeeded but no orders found - this is OK for new users
            setError('order_created_no_details');
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch failed:', fallbackErr);
          // Payment succeeded, just can't show details
          setError('order_created_no_details');
        }
      } else {
        // Guest checkout - can't fetch orders without auth
        // But payment still succeeded!
        setError('order_created_no_details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Payment failed or was cancelled
  if (redirectStatus === 'failed') {
    return (
      <div className="section">
        <div className="container-custom max-w-2xl">
          <div className="bg-white border border-street-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-display text-2xl tracking-wider mb-4">PAYMENT FAILED</h1>
            <p className="text-street-600 mb-6">
              Your payment could not be processed. Please try again or use a different payment method.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cart" className="btn-primary">
                Return to Cart
              </Link>
              <Link to="/products" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom max-w-2xl">
          <div className="bg-white border border-street-200 rounded-lg p-12 text-center">
            <Loader2 className="w-12 h-12 text-ocean-600 animate-spin mx-auto mb-4" />
            <p className="text-street-600">Loading your order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success without full order details (common for guest checkout)
  if (error === 'order_created_no_details' || (redirectStatus === 'succeeded' && !orderDetails)) {
    return (
      <div className="section">
        <div className="container-custom max-w-2xl">
          {/* Success Header */}
          <div className="bg-white border border-street-200 rounded-lg p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl tracking-wider mb-4">ORDER CONFIRMED!</h1>
            <p className="text-lg text-street-600 mb-6">
              Thank you for your purchase! Your payment was successful and your order is being processed.
            </p>
            
            {/* Helpful info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-medium">Check your email</p>
                  <p className="text-sm text-blue-700">
                    We've sent a confirmation email with your order details and tracking information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-white border border-street-200 rounded-lg p-6 mb-6">
            <h2 className="font-display text-lg tracking-wider mb-4">WHAT'S NEXT?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-ocean-700">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-street-500">You'll receive an email confirmation shortly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-ocean-700">2</span>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-street-500">We'll prepare your items for shipment within 1-2 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-ocean-700">3</span>
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-street-500">You'll receive tracking info once your order ships.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Link to="/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                View My Orders
              </Link>
            ) : (
              <Link to="/login" className="btn-primary flex-1 flex items-center justify-center gap-2">
                Sign In to Track Order
              </Link>
            )}
            <Link to="/products" className="btn-secondary flex-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success with full order details
  return (
    <div className="section">
      <div className="container-custom max-w-2xl">
        {/* Success Header */}
        <div className="bg-white border border-street-200 rounded-lg p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display text-2xl tracking-wider mb-2">ORDER CONFIRMED!</h1>
          <p className="text-street-600 mb-4">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          
          {orderDetails && (
            <div className="inline-block bg-street-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-street-500">Order Number</span>
              <p className="font-display text-lg tracking-wider text-ocean-950">
                {orderDetails.order_number || orderDetails.orderNumber || 'Processing...'}
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white border border-street-200 rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-street-200 bg-street-50">
              <h2 className="font-display tracking-wider">ORDER DETAILS</h2>
            </div>
            
            {/* Items */}
            <div className="p-4 space-y-3">
              {(orderDetails.items || orderDetails.order_items || []).map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-3">
                  {(item.image_url || item.imageUrl) ? (
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
                    <p className="font-medium">{item.product_name || item.productName}</p>
                    {(item.variant_name || item.variantName) && (
                      <p className="text-sm text-street-500">{item.variant_name || item.variantName}</p>
                    )}
                    <p className="text-sm text-street-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${parseFloat(item.total_price || item.totalPrice || item.unit_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-4 border-t border-street-200 bg-street-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-street-600">Subtotal</span>
                  <span>${parseFloat(orderDetails.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-street-600">Shipping</span>
                  <span>
                    {parseFloat(orderDetails.shipping_amount || orderDetails.shippingAmount || 0) === 0 
                      ? <span className="text-green-600">FREE</span>
                      : `$${parseFloat(orderDetails.shipping_amount || orderDetails.shippingAmount || 0).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-street-600">Tax</span>
                  <span>${parseFloat(orderDetails.tax_amount || orderDetails.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t border-street-200">
                  <span>Total</span>
                  <span className="text-ocean-950">${parseFloat(orderDetails.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Notification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium">Confirmation email sent</p>
            <p className="text-sm text-blue-700">
              A confirmation email has been sent to {orderDetails?.email || 'your email address'}.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isAuthenticated ? (
            <Link to="/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
              View My Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/register" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Create Account to Track Orders
            </Link>
          )}
          <Link to="/products" className="btn-secondary flex-1">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
