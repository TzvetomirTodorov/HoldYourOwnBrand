/**
 * Lookbook - Editorial Content with Shop-the-Look
 * 
 * Features:
 * - Curated outfit/look displays
 * - Clickable product hotspots on images
 * - Quick-add to cart
 * - "Shop the entire look" functionality
 * - Responsive masonry-style grid
 * - Smooth hover animations
 * 
 * Inspired by Fear of God and Kith editorial presentations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES (for reference)
// ═══════════════════════════════════════════════════════════════════════════
/*
Look {
  id: string
  title: string
  description: string
  image: string
  products: ProductHotspot[]
  collection?: string
  season?: string
}

ProductHotspot {
  productId: number
  productName: string
  productSlug: string
  price: number
  imageUrl: string
  position: { x: number, y: number } // Percentage position on image
  variantId?: number
  size?: string
  color?: string
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT HOTSPOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ProductHotspot({ product, onQuickAdd, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${product.position.x}%`, top: `${product.position.y}%` }}
    >
      {/* Pulse indicator */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-8 h-8 rounded-full transition-all duration-300 ${
          isActive ? 'bg-white scale-110' : 'bg-white/80 hover:bg-white hover:scale-110'
        }`}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-30" />
        <Plus className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform ${
          isActive ? 'rotate-45' : ''
        }`} />
      </button>

      {/* Product card popup */}
      {isActive && (
        <div className="absolute left-10 top-0 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-left-2 duration-200">
          {/* Product image */}
          <Link to={`/products/${product.productSlug}`}>
            <div className="aspect-square relative overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.productName}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Product info */}
          <div className="p-4">
            <Link to={`/products/${product.productSlug}`}>
              <h4 className="font-medium text-sm line-clamp-1 hover:text-street-600 transition-colors">
                {product.productName}
              </h4>
            </Link>
            {product.size && (
              <p className="text-xs text-street-500 mt-1">
                Size: {product.size} {product.color && `• ${product.color}`}
              </p>
            )}
            <p className="font-semibold mt-1">${product.price.toFixed(2)}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onQuickAdd(product)}
                className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" />
                Quick Add
              </button>
              <Link
                to={`/products/${product.productSlug}`}
                className="btn-secondary text-xs py-2 px-3"
              >
                <Eye className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOOK CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function LookCard({ look, onQuickAdd }) {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const showSuccess = useNotificationStore((state) => state.showSuccess);
  const showError = useNotificationStore((state) => state.showError);

  const handleHotspotClick = (index) => {
    setActiveHotspot(activeHotspot === index ? null : index);
  };

  const handleQuickAdd = async (product) => {
    try {
      await addItem(product.productId, product.variantId, 1);
      showSuccess(`${product.productName} added to cart!`);
    } catch (err) {
      showError('Failed to add to cart. Please select size on product page.');
    }
  };

  const handleShopEntireLook = async () => {
    setIsAddingAll(true);
    try {
      let addedCount = 0;
      for (const product of look.products) {
        if (product.variantId) {
          await addItem(product.productId, product.variantId, 1);
          addedCount++;
        }
      }
      if (addedCount > 0) {
        showSuccess(`${addedCount} items added to cart!`);
      } else {
        showError('Please select sizes on individual product pages');
      }
    } catch (err) {
      showError('Some items could not be added');
    } finally {
      setIsAddingAll(false);
    }
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveHotspot(null);
      }}
    >
      {/* Main image with hotspots */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-street-100">
        <img
          src={look.image}
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Product hotspots */}
        {look.products.map((product, index) => (
          <ProductHotspot
            key={product.productId}
            product={product}
            isActive={activeHotspot === index}
            onClick={() => handleHotspotClick(index)}
            onQuickAdd={handleQuickAdd}
          />
        ))}

        {/* "X products in look" indicator */}
        <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {look.products.length} {look.products.length === 1 ? 'item' : 'items'} in this look
        </div>

        {/* Bottom info bar */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <h3 className="font-display text-xl tracking-wider text-white mb-1">
            {look.title}
          </h3>
          {look.description && (
            <p className="text-white/80 text-sm line-clamp-2 mb-3">
              {look.description}
            </p>
          )}
          
          <button
            onClick={handleShopEntireLook}
            disabled={isAddingAll}
            className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isAddingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Shop the Look
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product thumbnails */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
        {look.products.map((product, index) => (
          <Link
            key={product.productId}
            to={`/products/${product.productSlug}`}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              activeHotspot === index ? 'border-street-900' : 'border-transparent hover:border-street-300'
            }`}
            onMouseEnter={() => setActiveHotspot(index)}
          >
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOOKBOOK PAGE
// ═══════════════════════════════════════════════════════════════════════════

function Lookbook() {
  const [looks, setLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('all');

  // Fetch lookbook data
  useEffect(() => {
    fetchLooks();
  }, [selectedCollection]);

  const fetchLooks = async () => {
    setIsLoading(true);
    try {
      // In production, fetch from API
      // const response = await fetch(`/api/lookbooks?collection=${selectedCollection}`);
      // const data = await response.json();
      // setLooks(data.looks);

      // Demo data
      setLooks([
        {
          id: '1',
          title: 'Street Essential',
          description: 'Elevated basics for the everyday hustle',
          image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800',
          collection: 'spring-2026',
          products: [
            {
              productId: 1,
              productName: 'HYOW Classic Hoodie',
              productSlug: 'hyow-classic-hoodie',
              price: 89.99,
              imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
              position: { x: 50, y: 30 },
              variantId: 1,
              size: 'M',
              color: 'Black',
            },
            {
              productId: 2,
              productName: 'HYOW Cargo Pants',
              productSlug: 'hyow-cargo-pants',
              price: 119.99,
              imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
              position: { x: 48, y: 70 },
              variantId: 3,
              size: '32',
              color: 'Olive',
            },
          ],
        },
        {
          id: '2',
          title: 'Night Moves',
          description: 'After-dark essentials with premium edge',
          image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
          collection: 'spring-2026',
          products: [
            {
              productId: 3,
              productName: 'HYOW Leather Jacket',
              productSlug: 'hyow-leather-jacket',
              price: 299.99,
              imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
              position: { x: 55, y: 35 },
            },
            {
              productId: 4,
              productName: 'HYOW Graphic Tee',
              productSlug: 'hyow-graphic-tee',
              price: 49.99,
              imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
              position: { x: 50, y: 55 },
              variantId: 5,
              size: 'L',
              color: 'White',
            },
          ],
        },
        {
          id: '3',
          title: 'Weekend Ready',
          description: 'Laid-back luxury for your days off',
          image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
          collection: 'essentials',
          products: [
            {
              productId: 5,
              productName: 'HYOW Oversized Tee',
              productSlug: 'hyow-oversized-tee',
              price: 54.99,
              imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
              position: { x: 45, y: 40 },
              variantId: 7,
              size: 'XL',
              color: 'Cream',
            },
            {
              productId: 6,
              productName: 'HYOW Shorts',
              productSlug: 'hyow-shorts',
              price: 64.99,
              imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
              position: { x: 50, y: 75 },
              variantId: 9,
              size: 'M',
              color: 'Black',
            },
          ],
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch lookbook:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const collections = [
    { id: 'all', name: 'All Looks' },
    { id: 'spring-2026', name: "Spring '26" },
    { id: 'essentials', name: 'Essentials' },
  ];

  return (
    <div className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-street-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">EDITORIAL</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-wider mb-4">
            LOOKBOOK
          </h1>
          <p className="text-street-500 max-w-xl mx-auto">
            Curated looks to inspire your style. Click the hotspots to explore each piece
            or shop the entire outfit.
          </p>
        </div>

        {/* Collection filter */}
        <div className="flex justify-center gap-4 mb-12">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCollection === collection.id
                  ? 'bg-street-900 text-white'
                  : 'bg-street-100 text-street-600 hover:bg-street-200'
              }`}
            >
              {collection.name}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-street-400" />
          </div>
        )}

        {/* Looks grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {looks
              .filter(look => selectedCollection === 'all' || look.collection === selectedCollection)
              .map((look) => (
                <LookCard key={look.id} look={look} />
              ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && looks.length === 0 && (
          <div className="text-center py-20">
            <Eye className="w-16 h-16 text-street-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl tracking-wider mb-2">
              Coming Soon
            </h2>
            <p className="text-street-500">
              New looks are being curated. Check back soon!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-street-900 to-street-700 rounded-2xl p-8 text-white">
            <h2 className="font-display text-2xl tracking-wider mb-2">
              Want to see your style featured?
            </h2>
            <p className="text-white/80 mb-4">
              Tag us @HYOW on Instagram for a chance to be in our next lookbook.
            </p>
            <a
              href="https://instagram.com/hyow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Follow @HYOW
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lookbook;
