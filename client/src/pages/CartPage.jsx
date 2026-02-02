/**
 * Shopping Cart Page
 * 
 * FIXED: Added defensive null checks for toFixed() calls
 * FIXED: Uses getSubtotal() function from store or calculates locally
 */
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

function CartPage() {
  const { 
    items, 
    isLoading, 
    fetchCart, 
    updateQuantity, 
    removeItem,
    getSubtotal 
  } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Calculate totals locally with defensive checks
  const subtotal = useMemo(() => {
    // Try to use store's getSubtotal if available
    if (typeof getSubtotal === 'function') {
      return getSubtotal();
    }
    // Fallback: calculate from items
    return (items || []).reduce((total, item) => {
      const price = item.unitPrice || item.price || item.variant?.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  }, [items, getSubtotal]);

  const total = subtotal; // No shipping/discount for now

  // Loading state
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="section">
        <div className="container-custom text-center py-16">
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto bg-street-200 rounded-full mb-4" />
            <div className="h-8 bg-street-200 w-48 mx-auto mb-4" />
            <div className="h-4 bg-street-200 w-64 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="section">
        <div className="container-custom text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-street-300 mb-4" />
          <h1 className="font-display text-3xl tracking-wider mb-4">YOUR CART IS EMPTY</h1>
          <p className="text-street-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-custom">
        <h1 className="font-display text-4xl tracking-wider mb-8">YOUR CART</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              // Defensive extraction of item properties
              const product = item.product || {};
              const variant = item.variant || {};
              const unitPrice = item.unitPrice ?? item.price ?? variant.price ?? 0;
              const imageUrl = product.imageUrl || product.image || '';
              const productName = product.name || 'Product';
              const productSlug = product.slug || '';
              const size = variant.size || '';
              const color = variant.color || '';
              const quantity = item.quantity || 1;

              return (
                <div key={item.id} className="flex gap-4 p-4 border border-street-200">
                  <div className="w-24 h-24 bg-street-100 flex-shrink-0">
                    {imageUrl && (
                      <img 
                        src={imageUrl} 
                        alt={productName} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link 
                      to={`/products/${productSlug}`} 
                      className="font-medium hover:text-ocean-600"
                    >
                      {productName}
                    </Link>
                    <p className="text-sm text-street-500">
                      {size}{color && ` / ${color}`}
                    </p>
                    <p className="font-semibold mt-1">
                      ${(unitPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 border border-street-300">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, quantity - 1))} 
                      className="p-2 hover:bg-street-100"
                      disabled={isLoading}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, quantity + 1)} 
                      className="p-2 hover:bg-street-100"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)} 
                    className="text-street-400 hover:text-blood-600"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-street-50 p-6">
              <h2 className="font-display text-xl tracking-wider mb-4">ORDER SUMMARY</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-street-200 pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(total || 0).toFixed(2)}</span>
                </div>
              </div>
              <Link 
                to="/checkout" 
                className="btn-primary w-full text-center block"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
