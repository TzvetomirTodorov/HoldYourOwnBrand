/**
 * Product Card Component
 *
 * A reusable card for displaying products in grid layouts throughout the site.
 * This component is used on the homepage, category pages, and search results.
 *
 * The card is designed to be visually appealing while also being performant:
 * - Images use lazy loading to improve initial page load
 * - Hover effects use CSS transforms for smooth 60fps animations
 * - The wishlist button only appears on hover to reduce visual clutter
 *
 * FIXED: Wishlist button now actually calls the API and toggles state
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { wishlistAPI } from '../../services/api';

function ProductCard({ product, onWishlistChange }) {
  // Track local wishlist state (optimistic UI)
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get auth state to check if user is logged in
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  /**
   * Handle wishlist toggle
   * - If not logged in, redirect to login
   * - If logged in, add/remove from wishlist via API
   */
  const handleWishlistClick = async (e) => {
    // Prevent the click from navigating to the product page
    e.preventDefault();
    e.stopPropagation();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.slug}` } } });
      return;
    }

    // Prevent double-clicks
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await wishlistAPI.remove(product.id);
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        await wishlistAPI.add(product.id);
        setIsWishlisted(true);
      }

      // Notify parent component if callback provided
      if (onWishlistChange) {
        onWishlistChange(product.id, !isWishlisted);
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
      // Could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-card group">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-product overflow-hidden bg-street-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-card-image"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-street-400">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <span className="badge-new">New</span>}
            {product.compareAtPrice && <span className="badge-sale">Sale</span>}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-medium text-street-900 truncate">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-ocean-950 font-semibold">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-street-400 text-sm line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist button - NOW FUNCTIONAL! */}
      <button
        onClick={handleWishlistClick}
        disabled={isLoading}
        className={`absolute top-2 right-2 p-2 bg-white/80 rounded-full transition-all hover:bg-white
          ${isLoading ? 'opacity-50 cursor-wait' : 'opacity-0 group-hover:opacity-100'}
          ${isWishlisted ? 'opacity-100' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            isWishlisted 
              ? 'fill-blood-600 text-blood-600' 
              : 'text-street-600 hover:text-blood-600'
          }`} 
        />
      </button>
    </div>
  );
}

export default ProductCard;
