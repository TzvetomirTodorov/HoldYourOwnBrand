/**
 * Order Confirmation Page
 * 
 * This page is shown after a successful checkout. It displays the order
 * details and provides next steps for the customer.
 * 
 * The order number is passed via URL query parameter or navigation state.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess } = useNotificationStore();
  
  // Get order details from navigation state or URL params
  const orderNumber = location.state?.orderNumber || searchParams.get('order');
  const orderTotal = location.state?.total;
  const orderEmail = location.state?.email;

  // If no order number, they probably navigated here directly
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    // Show success toast when page loads (only once)
    if (orderNumber && !hasShownToast) {
      showSuccess(`Order ${orderNumber} confirmed! Thank you for your purchase.`);
      setHasShownToast(true);
    }
  }, [orderNumber, hasShownToast, showSuccess]);

  // If no order number, redirect to home after showing message
  if (!orderNumber) {
    return (
      <div className="section">
        <div className="container-custom text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-street-300 mb-4" />
          <h1 className="font-display text-3xl tracking-wider mb-4">No Order Found</h1>
          <p className="text-street-600 mb-8">
            It looks like you haven't placed an order yet.
          </p>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section bg-street-50 min-h-[70vh]">
      <div className="container-custom max-w-2xl py-12">
        {/* Success Icon & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-4xl tracking-wider text-ocean-950 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-street-600">
            Thank you for your purchase
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-street-200 p-8 mb-8">
          <div className="text-center border-b border-street-200 pb-6 mb-6">
            <p className="text-sm text-street-500 uppercase tracking-wider mb-1">Order Number</p>
            <p className="font-display text-2xl tracking-wider text-ocean-950">{orderNumber}</p>
          </div>

          {orderTotal && (
            <div className="text-center border-b border-street-200 pb-6 mb-6">
              <p className="text-sm text-street-500 uppercase tracking-wider mb-1">Order Total</p>
              <p className="text-2xl font-semibold text-ocean-950">${orderTotal}</p>
            </div>
          )}

          {/* What's Next */}
          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-wider text-ocean-950 mb-4">What's Next?</h3>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <p className="font-medium text-street-900">Confirmation Email</p>
                <p className="text-sm text-street-600">
                  We've sent a confirmation email{orderEmail ? ` to ${orderEmail}` : ''} with your order details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <p className="font-medium text-street-900">Shipping Updates</p>
                <p className="text-sm text-street-600">
                  You'll receive tracking information once your order ships. Orders typically ship within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders" className="btn-secondary flex items-center justify-center gap-2">
            View My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/products" className="btn-primary flex items-center justify-center gap-2">
            Continue Shopping
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-street-500 mt-8">
          Questions about your order?{' '}
          <Link to="/contact" className="text-ocean-600 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
