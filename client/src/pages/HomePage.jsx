import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ============================================================================
// HOMEPAGE COMPONENT
// Bold, urban streetwear aesthetic with animated SVG elements
// Dark theme with gold/amber accents representing the HYOW brand identity
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First try to get featured products
        // API returns { products: [...] } so we need to extract the array
        const featuredResponse = await axios.get(`${API_URL}/api/products/featured`);
        const featuredData = featuredResponse.data?.products || featuredResponse.data || [];
        if (Array.isArray(featuredData) && featuredData.length > 0) {
          setFeaturedProducts(featuredData);
        }

        // Also fetch all products as a fallback for the product grid
        // API returns { products: [...] } so we need to extract the array
        const allResponse = await axios.get(`${API_URL}/api/products`);
        const allData = allResponse.data?.products || allResponse.data || [];
        setAllProducts(Array.isArray(allData) ? allData : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // If featured fails, try to get all products
        try {
          const allResponse = await axios.get(`${API_URL}/api/products`);
          const allData = allResponse.data?.products || allResponse.data || [];
          setAllProducts(Array.isArray(allData) ? allData : []);
        } catch (err) {
          console.error('Error fetching all products:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Use featured products if available, otherwise show first 6 products
  // Add defensive Array.isArray checks to prevent .slice() errors on non-arrays
  const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  
  const displayProducts = safeFeaturedProducts.length > 0
    ? safeFeaturedProducts
    : safeAllProducts.slice(0, 6);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setEmail('');
  };

  // ============================================================================
  // ANIMATED SVG BACKGROUND COMPONENT
  // Creates dynamic geometric patterns that pulse and move
  // ============================================================================
  const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gold gradient for accents */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Animated pulse filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Diagonal lines pattern */}
        <g className="animate-pulse" style={{ animationDuration: '4s' }}>
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10 + 50}%`}
              y2="100%"
              stroke="url(#goldGradient)"
              strokeWidth="1"
              opacity="0.1"
            />
          ))}
        </g>

        {/* Floating geometric shapes */}
        <g filter="url(#glow)">
          <circle
            cx="10%"
            cy="20%"
            r="100"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            opacity="0.2"
            className="animate-spin"
            style={{ animationDuration: '20s', transformOrigin: '10% 20%' }}
          />
          <circle
            cx="85%"
            cy="70%"
            r="150"
            fill="none"
            stroke="#FFD700"
            strokeWidth="0.5"
            opacity="0.15"
            className="animate-spin"
            style={{ animationDuration: '30s', transformOrigin: '85% 70%', animationDirection: 'reverse' }}
          />
        </g>

        {/* Crown icon watermark */}
        <g opacity="0.03" transform="translate(50%, 50%) scale(2)">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="#D4AF37"
            transform="translate(-12, -12)"
          />
        </g>
      </svg>
    </div>
  );

  // ============================================================================
  // HERO SECTION
  // Full-screen hero with bold typography and animated elements
  // ============================================================================
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#151515] to-[#0a0a0a] overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full mb-8">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
          <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">
            Est. 2024 • Premium Streetwear
          </span>
        </div>

        {/* Main Headline */}
        <h1 
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6"
          style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
        >
          <span className="block text-white">HOLD YOUR</span>
          <span className="block bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B] bg-clip-text text-transparent">
            OWN BRAND
          </span>
        </h1>

        {/* Tagline */}
        <p 
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          Elevate your presence. Premium streetwear for those who refuse to blend in.
          <span className="block mt-2 text-[#D4AF37]">Own your legacy.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="group px-8 py-4 bg-[#D4AF37] text-black font-bold text-lg tracking-wider uppercase transition-all duration-300 hover:bg-[#FFD700] hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Shop Collection
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            to="/about"
            className="group px-8 py-4 border-2 border-white/30 text-white font-bold text-lg tracking-wider uppercase transition-all duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Our Story
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-[#D4AF37] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#D4AF37]/20" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#D4AF37]/20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#D4AF37]/20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#D4AF37]/20" />
    </section>
  );

  // ============================================================================
  // FEATURED PRODUCTS SECTION
  // Grid display of featured products with hover effects
  // ============================================================================
  const FeaturedProductsSection = () => (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
            Curated Selection
          </span>
          <h2 
            className="text-4xl md:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            FEATURED PIECES
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-6" />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#1a1a1a] mb-4" />
                <div className="h-4 bg-[#1a1a1a] w-3/4 mb-2" />
                <div className="h-4 bg-[#1a1a1a] w-1/4" />
              </div>
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products available at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-4 border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg tracking-wider uppercase transition-all duration-300 hover:bg-[#D4AF37] hover:text-black"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            View All Products
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );

  // ============================================================================
  // PRODUCT CARD COMPONENT
  // Individual product display with hover animations
  // ============================================================================
  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Get image URL from various possible structures
    const imageUrl = product.imageUrl || product.images?.[0]?.url || '/placeholder-product.jpg';
    const productUrl = `/products/${product.slug || product.id}`;

    return (
      <Link
        to={productUrl}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[#1a1a1a] mb-4">
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          
          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Quick View Button */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="px-6 py-3 bg-[#D4AF37] text-black font-bold text-sm tracking-wider uppercase transform transition-transform duration-300 hover:scale-105">
              Quick View
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold tracking-wider uppercase">
                New
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-wider uppercase">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase">
            {product.category?.name || 'HYOW'}
          </p>
          <h3 
            className="text-white text-lg font-bold tracking-wide group-hover:text-[#D4AF37] transition-colors duration-300"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-bold">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-gray-500 text-sm line-through">
                ${typeof product.compareAtPrice === 'number' ? product.compareAtPrice.toFixed(2) : product.compareAtPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  // ============================================================================
  // BRAND STORY SECTION
  // Compelling narrative about the HYOW brand
  // ============================================================================
  const BrandStorySection = () => (
    <section className="py-24 bg-[#151515] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            #D4AF37 35px,
            #D4AF37 36px
          )`
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/5] bg-[#0a0a0a] relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/crown-heavyweight-hoodie.jpg"
                alt="HYOW Brand Story"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#D4AF37]/30 -z-10" />
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#D4AF37]/30 -z-10" />
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Our Philosophy
            </span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8"
              style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
            >
              BUILT FOR<br />
              <span className="text-[#D4AF37]">THE AMBITIOUS</span>
            </h2>
            
            <div className="space-y-6 text-gray-400 leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
              <p className="text-lg">
                HYOW was born from the streets and elevated for the boardroom. We believe that true style 
                knows no boundaries—it's a statement of who you are and who you're becoming.
              </p>
              <p>
                Every piece in our collection is crafted with intention, using premium materials that 
                stand the test of time. From the cut to the finish, we obsess over the details so you 
                can focus on making your mark.
              </p>
              <p>
                This isn't just clothing. It's armor for the modern warrior—those who wake up every 
                day ready to build their empire, brick by brick.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="mt-10 pl-6 border-l-4 border-[#D4AF37]">
              <p 
                className="text-2xl text-white italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                "Your brand is your legacy. Hold it like your life depends on it."
              </p>
              <cite className="text-[#D4AF37] text-sm tracking-wider uppercase mt-4 block not-italic">
                — HYOW Founders
              </cite>
            </blockquote>

            {/* CTA */}
            <Link
              to="/about"
              className="inline-flex items-center gap-3 mt-10 text-[#D4AF37] font-bold tracking-wider uppercase transition-all duration-300 hover:gap-5"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Read Our Full Story
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  // ============================================================================
  // CATEGORIES SECTION
  // Visual category navigation
  // ============================================================================
  const CategoriesSection = () => {
    const categories = [
      { name: 'Tees', slug: 'tees', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/red-flag-tee.jpg' },
      { name: 'Hoodies', slug: 'hoodies', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/grind-mode-hoodie.jpg' },
      { name: 'Outerwear', slug: 'outerwear', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/empire-bomber-jacket.jpg' },
      { name: 'Bottoms', slug: 'bottoms', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/boss-denim.jpg' },
      { name: 'Accessories', slug: 'accessories', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/crown-chain.jpg' },
      { name: 'Headwear', slug: 'headwear', image: 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/crown-snapback.jpg' },
    ];

    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Browse By
            </span>
            <h2 
              className="text-4xl md:text-6xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
            >
              CATEGORIES
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-6" />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Category Name */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 
                    className="text-white text-2xl md:text-3xl font-bold tracking-wider uppercase text-center group-hover:text-[#D4AF37] transition-colors duration-300"
                    style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
                  >
                    {category.name}
                  </h3>
                </div>

                {/* Border Animation */}
                <div className="absolute inset-4 border border-transparent group-hover:border-[#D4AF37]/50 transition-colors duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============================================================================
  // VALUES SECTION
  // Brand values with icons
  // ============================================================================
  const ValuesSection = () => {
    const values = [
      {
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        title: 'Premium Quality',
        description: 'Every piece crafted with the finest materials and meticulous attention to detail.'
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        ),
        title: 'Free Shipping',
        description: 'Complimentary shipping on all orders over $150. Worldwide delivery available.'
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        title: 'Easy Returns',
        description: '30-day hassle-free returns. Not satisfied? We\'ll make it right.'
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        title: '24/7 Support',
        description: 'Our team is here for you around the clock. Questions? We\'ve got answers.'
      }
    ];

    return (
      <section className="py-24 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 rounded-full group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                  {value.icon}
                </div>
                <h3 
                  className="text-white text-xl font-bold tracking-wider uppercase mb-3"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============================================================================
  // NEWSLETTER SECTION
  // Email signup with bold design
  // ============================================================================
  const NewsletterSection = () => (
    <section className="py-24 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a0a] to-[#0a0a0a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
          Join The Movement
        </span>
        <h2 
          className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
          style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
        >
          GET EXCLUSIVE ACCESS
        </h2>
        <p 
          className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          Be the first to know about new drops, exclusive offers, and behind-the-scenes content. 
          Join the HYOW family and elevate your inbox.
        </p>

        {subscribed ? (
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-8 py-6 inline-block">
            <p className="text-[#D4AF37] text-xl font-bold tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
              ✓ WELCOME TO THE FAMILY
            </p>
            <p className="text-gray-400 text-sm mt-2">Check your inbox for a special welcome gift.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 bg-[#1a1a1a] border border-[#333] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#D4AF37] text-black font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[#FFD700] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-gray-500 text-xs mt-6">
          By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );

  // ============================================================================
  // INSTAGRAM SECTION
  // Social proof with Instagram-style grid
  // ============================================================================
  const InstagramSection = () => {
    // Use product images as Instagram feed placeholder
    // Add defensive check for array safety
    const safeProducts = Array.isArray(allProducts) ? allProducts : [];
    const instagramImages = safeProducts.slice(0, 6).map(p => p.imageUrl || p.images?.[0]?.url);

    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              @HoldYourOwnBrand
            </span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
            >
              FOLLOW THE MOVEMENT
            </h2>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {instagramImages.map((img, index) => (
              <a
                key={index}
                href="https://instagram.com/holdyourownbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-[#1a1a1a]"
              >
                {img ? (
                  <img
                    src={img}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a]" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Google Fonts - Add these to index.html for production */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        `}
      </style>
      
      <HeroSection />
      <FeaturedProductsSection />
      <BrandStorySection />
      <CategoriesSection />
      <ValuesSection />
      <NewsletterSection />
      <InstagramSection />
    </div>
  );
}
