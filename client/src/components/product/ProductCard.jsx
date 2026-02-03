/**
 * Product Card Component - FIXED VERSION
 *
 * Features:
 * - Wishlist button (heart)
 * - Quick add-to-cart button (+) - NOW HANDLES MISSING VARIANT DATA
 * 
 * FIX: Product listing pages don't load variant data, so we need to either:
 * 1. Fetch the product details first to get variant ID, OR
 * 2. Let the backend handle null variantId by selecting the default variant
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { wishlistAPI, productsAPI } from '../../services/api';

function ProductCard({ product, onWishlistChange }) {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  // Handle wishlist toggle
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.slug}` } } });
      return;
    }

    if (isWishlistLoading) return;
    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        await wishlistAPI.remove(product.id);
        setIsWishlisted(false);
      } else {
        await wishlistAPI.add(product.id);
        setIsWishlisted(true);
      }
      if (onWishlistChange) {
        onWishlistChange(product.id, !isWishlisted);
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  /**
   * Handle quick add-to-cart
   * 
   * FIXED: Product cards from listing pages don't have variants loaded.
   * We now fetch the product details first to get the default variant ID,
   * OR pass null and let the backend select the default variant.
   */
  const handleQuickAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || product.isOutOfStock) return;
    setIsAddingToCart(true);

    try {
      let variantId = null;

      // Check if we already have variants data
      if (product.variants && product.variants.length > 0) {
        variantId = product.variants[0].id;
      } else if (product.defaultVariantId) {
        variantId = product.defaultVariantId;
      } else {
        // Fetch the product to get its default variant
        // This is necessary because listing pages don't include variant data
        try {
          const response = await productsAPI.getBySlug(product.slug);
          const fullProduct = response.data.product || response.data;
          
          if (fullProduct.variants && fullProduct.variants.length > 0) {
            variantId = fullProduct.variants[0].id;
          }
        } catch (fetchError) {
          console.warn('Could not fetch product details, trying without variant:', fetchError);
          // Will try to add with null variantId - backend should handle it
        }
      }

      // Add to cart
      await addItem(variantId, 1);
      
      // Show success state
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
      
    } catch (error) {
      console.error('Quick add to cart failed:', error);
      // Could show a toast notification here
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="product-card group relative">
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

          {/* Badges - top left */}
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
              ${product.price?.toFixed(2) || '0.00'}
            </span>
            {product.compareAtPrice && (
              <span className="text-street-400 text-sm line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons container - top right */}
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        {/* Wishlist button (heart) */}
        <button
          onClick={handleWishlistClick}
          disabled={isWishlistLoading}
          className={`p-2 bg-white/90 rounded-full shadow-sm transition-all hover:bg-white hover:shadow-md
            ${isWishlistLoading ? 'opacity-50 cursor-wait' : 'opacity-0 group-hover:opacity-100'}
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

        {/* Quick add-to-cart button (+) */}
        <button
          onClick={handleQuickAddToCart}
          disabled={isAddingToCart || product.isOutOfStock}
          className={`p-2 bg-white/90 rounded-full shadow-sm transition-all hover:bg-white hover:shadow-md
            ${isAddingToCart ? 'opacity-100 cursor-wait' : 'opacity-0 group-hover:opacity-100'}
            ${justAdded ? 'opacity-100 bg-green-500 hover:bg-green-500' : ''}
            ${product.isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={justAdded ? 'Added to cart' : 'Quick add to cart'}
          title={product.isOutOfStock ? 'Out of stock' : 'Quick add to cart'}
        >
          {isAddingToCart ? (
            <Loader2 className="w-4 h-4 text-street-600 animate-spin" />
          ) : justAdded ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Plus className="w-4 h-4 text-street-600 hover:text-ocean-950" />
          )}
        </button>
      </div>

      {/* Out of stock overlay */}
      {product.isOutOfStock && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
          <span className="bg-street-900 text-white px-3 py-1 text-sm font-medium tracking-wider">
            SOLD OUT
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
