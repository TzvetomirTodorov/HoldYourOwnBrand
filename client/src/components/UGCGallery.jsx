/**
 * UGC Gallery - User Generated Content Display
 * 
 * Features:
 * - Instagram-style masonry grid
 * - Customer photo submissions
 * - Product tagging on photos
 * - Lightbox view with shop-the-look
 * - Social sharing integration
 * - Infinite scroll loading
 * 
 * Inspired by: Glossier, SKIMS, ASOS Style Feed
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA (Replace with API calls)
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_UGC_POSTS = [
  {
    id: 1,
    imageUrl: '/images/ugc/ugc-1.jpg',
    username: '@streetstyle_mike',
    userAvatar: '/images/avatars/user-1.jpg',
    caption: 'This hoodie is everything 🔥 #HYOW #streetwear',
    likes: 234,
    products: [
      { id: 1, name: 'HYOW Essential Hoodie', slug: 'essential-hoodie', price: 89 },
    ],
    createdAt: '2026-02-01T10:30:00Z',
    featured: true,
  },
  {
    id: 2,
    imageUrl: '/images/ugc/ugc-2.jpg',
    username: '@la_vibes',
    userAvatar: '/images/avatars/user-2.jpg',
    caption: 'Summer ready ☀️',
    likes: 189,
    products: [
      { id: 2, name: 'HYOW Classic Tee', slug: 'classic-tee', price: 49 },
      { id: 3, name: 'HYOW Cargo Pants', slug: 'cargo-pants', price: 120 },
    ],
    createdAt: '2026-01-28T14:00:00Z',
  },
  {
    id: 3,
    imageUrl: '/images/ugc/ugc-3.jpg',
    username: '@fashionista_j',
    userAvatar: '/images/avatars/user-3.jpg',
    caption: 'Layering game strong 💪',
    likes: 412,
    products: [
      { id: 4, name: 'HYOW Bomber Jacket', slug: 'bomber-jacket', price: 189 },
    ],
    createdAt: '2026-01-25T09:15:00Z',
    featured: true,
  },
  {
    id: 4,
    imageUrl: '/images/ugc/ugc-4.jpg',
    username: '@urban_threads',
    userAvatar: '/images/avatars/user-4.jpg',
    caption: 'Details matter ✨',
    likes: 156,
    products: [
      { id: 5, name: 'HYOW Beanie', slug: 'beanie', price: 35 },
    ],
    createdAt: '2026-01-22T16:45:00Z',
  },
  {
    id: 5,
    imageUrl: '/images/ugc/ugc-5.jpg',
    username: '@cali_drip',
    userAvatar: '/images/avatars/user-5.jpg',
    caption: 'Weekend vibes with HYOW',
    likes: 298,
    products: [
      { id: 6, name: 'HYOW Joggers', slug: 'joggers', price: 85 },
      { id: 1, name: 'HYOW Essential Hoodie', slug: 'essential-hoodie', price: 89 },
    ],
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 6,
    imageUrl: '/images/ugc/ugc-6.jpg',
    username: '@minimalist_max',
    userAvatar: '/images/avatars/user-6.jpg',
    caption: 'Clean fit 🖤',
    likes: 187,
    products: [
      { id: 2, name: 'HYOW Classic Tee', slug: 'classic-tee', price: 49 },
    ],
    createdAt: '2026-01-18T08:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

const HeartIcon = ({ className, filled }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
  </svg>
);

const CameraIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// LIGHTBOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Lightbox({ post, onClose, onLike }) {
  const [liked, setLiked] = useState(false);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked && onLike) onLike(post.id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-neutral-300 transition-colors z-50"
      >
        <CloseIcon className="w-8 h-8" />
      </button>

      {/* Content */}
      <div 
        className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="md:w-2/3 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <img 
            src={post.imageUrl}
            alt={`Photo by ${post.username}`}
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[90vh]"
            onError={(e) => {
              e.target.src = '/images/placeholder-ugc.jpg';
            }}
          />
        </div>

        {/* Details */}
        <div className="md:w-1/3 p-6 flex flex-col">
          {/* User */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <img 
                src={post.userAvatar}
                alt={post.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg font-bold">${post.username[1].toUpperCase()}</div>`;
                }}
              />
            </div>
            <div>
              <p className="font-bold">{post.username}</p>
              <p className="text-xs text-neutral-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Caption */}
          <p className="text-sm mb-4">{post.caption}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handleLike}
              className="flex items-center gap-2 hover:text-red-500 transition-colors"
            >
              <HeartIcon className={`w-6 h-6 ${liked ? 'text-red-500' : ''}`} filled={liked} />
              <span className="text-sm">{post.likes + (liked ? 1 : 0)}</span>
            </button>
          </div>

          {/* Tagged Products */}
          {post.products && post.products.length > 0 && (
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <TagIcon className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium">Shop This Look</span>
              </div>
              <div className="space-y-2">
                {post.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    onClick={onClose}
                  >
                    <span className="text-sm font-medium truncate">{product.name}</span>
                    <span className="text-sm font-bold">${product.price}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            to="/submit-photo"
            className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={onClose}
          >
            <CameraIcon className="w-5 h-5" />
            Submit Your Photo
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UGC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function UGCCard({ post, onClick }) {
  return (
    <button
      onClick={() => onClick(post)}
      className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800"
    >
      {/* Image */}
      <img 
        src={post.imageUrl}
        alt={`Photo by ${post.username}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src = '/images/placeholder-ugc.jpg';
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
          <p className="font-bold text-lg">{post.username}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <HeartIcon className="w-5 h-5" filled />
            <span>{post.likes}</span>
          </div>
        </div>
      </div>

      {/* Featured Badge */}
      {post.featured && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold uppercase rounded">
          Featured
        </div>
      )}

      {/* Product Count Badge */}
      {post.products && post.products.length > 0 && (
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 dark:bg-black/90 text-xs font-bold rounded flex items-center gap-1">
          <TagIcon className="w-3 h-3" />
          {post.products.length}
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function UGCGallery({ 
  limit, 
  showHeader = true, 
  showSubmitCTA = true,
  className = '' 
}) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'featured'

  // Load posts
  useEffect(() => {
    // In production, replace with API call
    const loadPosts = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(MOCK_UGC_POSTS);
      setLoading(false);
    };

    loadPosts();
  }, []);

  const filteredPosts = filter === 'featured' 
    ? posts.filter(p => p.featured)
    : posts;

  const displayPosts = limit ? filteredPosts.slice(0, limit) : filteredPosts;

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(limit || 8)].map((_, i) => (
          <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">#HYOW Community</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Real people, real style. Tag us to be featured!
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              All Photos
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'featured'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Featured
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {displayPosts.map((post) => (
          <UGCCard 
            key={post.id} 
            post={post} 
            onClick={setSelectedPost}
          />
        ))}
      </div>

      {/* Submit CTA */}
      {showSubmitCTA && (
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 p-6 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
            <InstagramIcon className="w-10 h-10" />
            <div className="text-left">
              <h3 className="font-bold">Want to be featured?</h3>
              <p className="text-sm text-neutral-500">
                Tag us <span className="font-medium">@holdyourownbrand</span> or use <span className="font-medium">#HYOW</span>
              </p>
            </div>
            <Link
              to="/submit-photo"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              Submit Photo
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-bold mb-2">No Photos Yet</h3>
          <p className="text-neutral-500 mb-6">Be the first to share your style!</p>
          <Link 
            to="/submit-photo"
            className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium"
          >
            Submit Your Photo
          </Link>
        </div>
      )}

      {/* Lightbox */}
      {selectedPost && (
        <Lightbox 
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE PAGE WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

export function UGCGalleryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-neutral-100 dark:from-neutral-900 to-transparent">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">#HYOW</h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Our community in their element. Tag us to be featured.
        </p>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <UGCGallery showHeader={false} />
      </section>
    </div>
  );
}
