/**
 * Shopping Cart Page
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

function CartPage() {
  const { items, subtotal, total, discount, discountAmount, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (items.length === 0) {
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
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-street-200">
                <div className="w-24 h-24 bg-street-100 flex-shrink-0">
                  {item.product.imageUrl && <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <Link to={`/products/${item.product.slug}`} className="font-medium hover:text-ocean-600">{item.product.name}</Link>
                  <p className="text-sm text-street-500">{item.variant.size} {item.variant.color && `/ ${item.variant.color}`}</p>
                  <p className="font-semibold mt-1">${item.unitPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 border border-street-300">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-street-400 hover:text-blood-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-street-50 p-6">
              <h2 className="font-display text-xl tracking-wider mb-4">ORDER SUMMARY</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {discount && <div className="flex justify-between text-palm-600"><span>Discount ({discount.code})</span><span>-${discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
              </div>
              <div className="border-t border-street-200 pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CartPage;
