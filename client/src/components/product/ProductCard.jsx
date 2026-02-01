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
 */

import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

function ProductCard({ product }) {
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

      {/* Wishlist button */}
      <button
        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${product.isWishlisted ? 'fill-blood-600 text-blood-600' : 'text-street-600'}`} />
      </button>
    </div>
  );
}

export default ProductCard;
