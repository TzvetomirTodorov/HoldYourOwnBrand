/**
 * WishlistPage - User's saved/favorited products
 * 
 * Displays all products the user has wishlisted with options to:
 * - Remove from wishlist
 * - Add to cart
 * - View product details
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Loader2, HeartOff, ArrowRight } from 'lucide-react';
import { wishlistAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState(new Set());

  // Cart store
  const addItem = useCartStore((state) => state.addItem);

  // Notification store
  const showSuccess = useNotificationStore((state) => state.showSuccess);
  const showError = useNotificationStore((state) => state.showError);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await wishlistAPI.get();
      setWishlistItems(response.data.items || response.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError('Failed to load your wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingIds((prev) => new Set([...prev, productId]));
      await wishlistAPI.remove(productId);
      
      // Remove from local state
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId && item.id !== productId));
      showSuccess?.('Removed from wishlist');
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      showError?.('Failed to remove item. Please try again.');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleAddToCart = async (item) => {
    const productId = item.productId || item.id;
    const variantId = item.variantId || item.variants?.[0]?.id;

    if (!variantId) {
      showError?.('Please select a size/color on the product page');
      return;
    }

    try {
      setAddingToCartIds((prev) => new Set([...prev, productId]));
      await addItem(productId, variantId, 1);
      showSuccess?.(`${item.name || item.productName} added to cart!`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showError?.('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCartIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-street-400 mb-4" />
            <p className="text-street-500">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center py-20">
            <HeartOff className="w-16 h-16 text-street-300 mb-4" />
            <h2 className="font-display text-2xl tracking-wider mb-2">Oops!</h2>
            <p className="text-street-500 mb-6">{error}</p>
            <button
              onClick={fetchWishlist}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="w-16 h-16 text-street-300 mb-4" />
            <h2 className="font-display text-2xl tracking-wider mb-2">Your Wishlist is Empty</h2>
            <p className="text-street-500 mb-6">
              Save your favorite items by clicking the heart icon on any product.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Wishlist with items
  return (
    <div className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-wider mb-2">My Wishlist</h1>
            <p className="text-street-500">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const productId = item.productId || item.id;
            const isRemoving = removingIds.has(productId);
            const isAddingToCart = addingToCartIds.has(productId);
            const productName = item.name || item.productName;
            const productSlug = item.slug || item.productSlug || productId;
            const productImage = item.imageUrl || item.image_url || item.image || '/placeholder.jpg';
            const productPrice = item.price || item.productPrice || 0;

            return (
              <div
                key={productId}
                className="group bg-white border border-street-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Product Image */}
                <Link to={`/products/${productSlug}`} className="block relative aspect-square overflow-hidden">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  
                  {/* Remove Button (top right) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFromWishlist(productId);
                    }}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/products/${productSlug}`}>
                    <h3 className="font-display text-lg tracking-wider mb-1 hover:text-street-600 transition-colors line-clamp-1">
                      {productName}
                    </h3>
                  </Link>
                  
                  <p className="text-street-900 font-semibold mb-4">
                    ${parseFloat(productPrice).toFixed(2)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isAddingToCart}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    
                    <Link
                      to={`/products/${productSlug}`}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-street-600 hover:text-street-900 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
