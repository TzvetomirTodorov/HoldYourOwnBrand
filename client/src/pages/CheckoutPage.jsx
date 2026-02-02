/**
 * CheckoutPage - Full Stripe Elements Integration
 * 
 * Features:
 * - Radar.io address autocomplete (100K free/month)
 * - react-phone-number-input for formatted phone
 * - Stripe Payment Element
 * - Order confirmation
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ShoppingBag, ArrowLeft, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

// Stripe promise - loaded once
let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    const { data } = await api.get('/checkout/config');
    stripePromise = loadStripe(data.publishableKey);
  }
  return stripePromise;
};

// Initialize Radar.io
const initRadar = () => {
  if (window.Radar) return Promise.resolve();
  
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.radar.com/v4/radar.min.js';
    script.onload = () => {
      window.Radar.initialize(import.meta.env.VITE_RADAR_PUBLISHABLE_KEY);
      resolve();
    };
    document.head.appendChild(script);
  });
};

// Address Autocomplete Component
function AddressAutocomplete({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      await initRadar();
      const result = await window.Radar.autocomplete({
        query,
        layers: ['address'],
        country: 'US',
        limit: 5,
      });
      
      setSuggestions(result.addresses || []);
      setIsOpen(true);
    } catch (err) {
      console.error('Radar autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    // Debounce the search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 300);
  };

  const handleSelect = (address) => {
    // Parse the Radar address into our form fields
    const parsed = {
      address1: address.addressLabel || address.formattedAddress?.split(',')[0] || '',
      city: address.city || '',
      state: address.stateCode || address.state || '',
      zipCode: address.postalCode || '',
      country: address.countryCode || 'US',
      // Full formatted for display
      formatted: address.formattedAddress || '',
    };
    
    onSelect(parsed);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="input w-full pr-10"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-street-400" />
        ) : (
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-street-400" />
        )}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-street-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((address, index) => (
            <li
              key={index}
              onClick={() => handleSelect(address)}
              className="px-4 py-3 hover:bg-street-50 cursor-pointer border-b border-street-100 last:border-b-0"
            >
              <p className="font-medium text-sm">{address.addressLabel || address.formattedAddress?.split(',')[0]}</p>
              <p className="text-xs text-street-500">
                {address.city}, {address.stateCode} {address.postalCode}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Payment Form Component (used inside Elements provider)
function PaymentForm({ orderNumber, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />
      {errorMessage && (
        <div className="mt-4 p-3 bg-blood-50 border border-blood-200 text-blood-700 rounded">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-primary w-full mt-6 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
}

// Main Checkout Page
function CheckoutPage() {
  const navigate = useNavigate();
  const { items, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState('shipping'); // shipping, payment, success
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const [error, setError] = useState('');
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  // Calculate cart totals locally
  const cartTotals = useMemo(() => {
    const subtotal = (items || []).reduce((total, item) => {
      const price = item.unitPrice || item.price || item.variant?.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
    const shipping = subtotal >= 200 ? 0 : 15;
    const tax = subtotal * 0.08875;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [items]);

  // Fetch cart on mount
  useEffect(() => {
    const init = async () => {
      await fetchCart();
      setIsLoading(false);
    };
    init();
  }, [fetchCart]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && (!items || items.length === 0) && step !== 'success') {
      navigate('/cart');
    }
  }, [items, isLoading, navigate, step]);

  // Get session ID for guest checkout
  const getSessionId = () => {
    return localStorage.getItem('hyow_cart_session');
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (parsed) => {
    setShippingAddress(prev => ({
      ...prev,
      address1: parsed.address1,
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      country: parsed.country,
    }));
  };

  // Handle shipping form submit
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      const required = ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zipCode'];
      for (const field of required) {
        if (!shippingAddress[field]) {
          throw new Error(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
        }
      }

      // Validate phone if provided
      if (shippingAddress.phone && !isValidPhoneNumber(shippingAddress.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Create payment intent
      const response = await api.post('/checkout/create-payment-intent', {
        shippingAddress,
        email: shippingAddress.email,
        sessionId: getSessionId(),
      });

      setClientSecret(response.data.clientSecret);
      setOrderNumber(response.data.orderNumber);
      setOrderSummary(response.data.summary);
      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await api.post('/checkout/confirm', {
        orderNumber,
        paymentIntentId,
        sessionId: getSessionId(),
      });
      await fetchCart();
      setStep('success');
    } catch (err) {
      console.error('Order confirmation error:', err);
      setStep('success');
    }
  };

  // Update shipping field
  const updateField = (field) => (e) => {
    setShippingAddress(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Loading state
  if (isLoading && step === 'shipping') {
    return (
      <div className="section">
        <div className="container-custom text-center py-16">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-ocean-600" />
          <p className="mt-4 text-street-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="section">
        <div className="container-custom max-w-2xl text-center py-16">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
          <h1 className="font-display text-4xl tracking-wider mb-4">ORDER CONFIRMED!</h1>
          <p className="text-xl text-street-600 mb-2">Thank you for your purchase</p>
          <p className="text-street-500 mb-8">
            Order Number: <span className="font-mono font-semibold">{orderNumber}</span>
          </p>
          <p className="text-street-500 mb-8">
            We've sent a confirmation email to <strong>{shippingAddress.email}</strong>
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="btn-primary">
                View Orders
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-custom">
        {/* Back link */}
        <Link to="/cart" className="inline-flex items-center gap-2 text-street-600 hover:text-street-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Forms */}
          <div>
            <h1 className="font-display text-3xl tracking-wider mb-8">CHECKOUT</h1>

            {/* Progress indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-ocean-600' : 'text-street-400'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'shipping' ? 'bg-ocean-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  {step === 'shipping' ? '1' : '✓'}
                </span>
                <span className="font-medium">Shipping</span>
              </div>
              <div className="flex-1 h-px bg-street-200" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-ocean-600' : 'text-street-400'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'payment' ? 'bg-ocean-600 text-white' : 'bg-street-200'
                }`}>
                  2
                </span>
                <span className="font-medium">Payment</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-blood-50 border border-blood-200 text-blood-700 rounded">
                {error}
              </div>
            )}

            {/* Shipping Form */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={updateField('firstName')}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={updateField('lastName')}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={updateField('email')}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <PhoneInput
                    international={false}
                    defaultCountry="US"
                    value={shippingAddress.phone}
                    onChange={(value) => setShippingAddress(prev => ({ ...prev, phone: value || '' }))}
                    className="phone-input-wrapper"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <AddressAutocomplete
                    value={shippingAddress.address1}
                    onChange={(val) => setShippingAddress(prev => ({ ...prev, address1: val }))}
                    onSelect={handleAddressSelect}
                    placeholder="Start typing your address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Apartment, suite, etc.</label>
                  <input
                    type="text"
                    value={shippingAddress.address2}
                    onChange={updateField('address2')}
                    className="input w-full"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={updateField('city')}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={updateField('state')}
                      className="input w-full"
                      placeholder="e.g., NY"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={updateField('zipCode')}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <select
                      value={shippingAddress.country}
                      onChange={updateField('country')}
                      className="input w-full"
                    >
                      <option value="US">United States</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full py-4 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            )}

            {/* Payment Form */}
            {step === 'payment' && clientSecret && (
              <Elements 
                stripe={getStripe()} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0B1D3A',
                      colorBackground: '#ffffff',
                      colorText: '#1a1a1a',
                      colorDanger: '#B91C1C',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '4px',
                    }
                  }
                }}
              >
                <div className="mb-6">
                  <h2 className="font-display text-xl tracking-wider mb-4">SHIPPING TO</h2>
                  <div className="p-4 bg-street-50 rounded text-sm">
                    <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    {shippingAddress.phone && <p className="mt-1 text-street-500">{shippingAddress.phone}</p>}
                    <button 
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="text-ocean-600 hover:underline mt-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-xl tracking-wider mb-4">PAYMENT</h2>
                <PaymentForm orderNumber={orderNumber} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-street-50 p-6 sticky top-24">
              <h2 className="font-display text-xl tracking-wider mb-6">ORDER SUMMARY</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {(items || []).map((item) => {
                  const product = item.product || {};
                  const variant = item.variant || {};
                  const unitPrice = item.unitPrice ?? item.price ?? variant.price ?? 0;
                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-street-200 flex-shrink-0">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name || 'Product'}</p>
                        <p className="text-sm text-street-500">
                          {variant.size}{variant.color && ` / ${variant.color}`}
                        </p>
                        <p className="text-sm text-street-500">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="font-medium">${(unitPrice * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-street-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(orderSummary?.subtotal || cartTotals.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {(orderSummary?.shipping ?? cartTotals.shipping) === 0 
                      ? <span className="text-green-600">FREE</span>
                      : `$${(orderSummary?.shipping || cartTotals.shipping).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(orderSummary?.tax || cartTotals.tax).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-street-200 pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(orderSummary?.total || cartTotals.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Free shipping notice */}
              {cartTotals.subtotal < 200 && (
                <p className="text-sm text-street-500 mt-4">
                  Add ${(200 - cartTotals.subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phone Input Custom Styles */}
      <style>{`
        .phone-input-wrapper {
          display: flex;
          align-items: center;
        }
        .phone-input-wrapper .PhoneInputCountry {
          padding: 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-right: none;
          border-radius: 0.375rem 0 0 0.375rem;
        }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0 0.375rem 0.375rem 0;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .phone-input-wrapper .PhoneInputInput:focus {
          border-color: #0B1D3A;
          box-shadow: 0 0 0 3px rgba(11, 29, 58, 0.1);
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
