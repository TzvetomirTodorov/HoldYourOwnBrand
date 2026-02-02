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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First try to get featured products
        const featuredResponse = await axios.get(`${API_URL}/api/products/featured`);
        if (featuredResponse.data && featuredResponse.data.length > 0) {
          setFeaturedProducts(featuredResponse.data);
        }
        
        // Also fetch all products as a fallback for the product grid
        const allResponse = await axios.get(`${API_URL}/api/products`);
        setAllProducts(allResponse.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // If featured fails, try to get all products
        try {
          const allResponse = await axios.get(`${API_URL}/api/products`);
          setAllProducts(allResponse.data || []);
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
  const displayProducts = featuredProducts.length > 0 
    ? featuredProducts 
    : allProducts.slice(0, 6);

  return (
    <div className="homepage" style={styles.container}>
      {/* ================================================================== */}
      {/* HERO SECTION - Bold urban aesthetic with animated SVG elements    */}
      {/* ================================================================== */}
      <section style={styles.heroSection}>
        {/* Animated background SVG pattern */}
        <div style={styles.heroBackground}>
          <AnimatedBackgroundSVG />
        </div>
        
        {/* Hero content overlay */}
        <div style={styles.heroContent}>
          {/* Animated brand icon */}
          <div style={styles.brandIconWrapper}>
            <AnimatedBrandIcon />
          </div>
          
          {/* Main headline with animated reveal */}
          <h1 style={styles.heroTitle}>
            <span style={styles.heroTitleLine1}>HOLD YOUR</span>
            <span style={styles.heroTitleLine2}>OWN</span>
          </h1>
          
          {/* Tagline */}
          <p style={styles.heroTagline}>
            From Harlem streets to California dreams.<br />
            Wear your story. Own your legacy.
          </p>
          
          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <Link to="/shop" style={styles.ctaPrimary}>
              SHOP COLLECTION
              <svg style={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/about" style={styles.ctaSecondary}>
              OUR STORY
            </Link>
          </div>
        </div>

        {/* Floating geometric elements */}
        <FloatingElements />
        
        {/* Scroll indicator */}
        <div style={styles.scrollIndicator}>
          <div style={styles.scrollLine}></div>
          <span style={styles.scrollText}>SCROLL</span>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURED PRODUCTS SECTION                                         */}
      {/* ================================================================== */}
      <section style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>COLLECTION</span>
          <h2 style={styles.sectionTitle}>FEATURED PIECES</h2>
          <div style={styles.sectionDivider}></div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading collection...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div style={styles.productGrid}>
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id || product._id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <EmptyStateSVG />
            <p style={styles.emptyStateText}>New collection dropping soon.</p>
            <p style={styles.emptyStateSubtext}>Stay tuned.</p>
          </div>
        )}

        {displayProducts.length > 0 && (
          <div style={styles.viewAllContainer}>
            <Link to="/shop" style={styles.viewAllButton}>
              VIEW ALL PRODUCTS
              <svg style={styles.viewAllArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* BRAND VALUES SECTION                                              */}
      {/* ================================================================== */}
      <section style={styles.valuesSection}>
        <div style={styles.valuesGrid}>
          <ValueCard 
            icon="crown"
            title="OWN IT"
            description="Every piece tells a story of resilience and self-belief."
          />
          <ValueCard 
            icon="shield"
            title="QUALITY"
            description="Premium materials. Meticulous craftsmanship. Built to last."
          />
          <ValueCard 
            icon="fire"
            title="AUTHENTICITY"
            description="Born from real experience. Designed for real people."
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/* NEWSLETTER SECTION                                                */}
      {/* ================================================================== */}
      <section style={styles.newsletterSection}>
        <div style={styles.newsletterContent}>
          <h3 style={styles.newsletterTitle}>JOIN THE MOVEMENT</h3>
          <p style={styles.newsletterText}>
            Be first to know about new drops, exclusive releases, and the HYOW story.
          </p>
          <form style={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={styles.newsletterInput}
            />
            <button type="submit" style={styles.newsletterButton}>
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>

      {/* Global styles for animations */}
      <style>{globalAnimations}</style>
    </div>
  );
}

// ============================================================================
// ANIMATED BACKGROUND SVG COMPONENT
// Creates a dynamic, urban-inspired pattern that pulses with energy
// ============================================================================
function AnimatedBackgroundSVG() {
  return (
    <svg 
      viewBox="0 0 1920 1080" 
      style={styles.backgroundSvg}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradient definitions for depth and atmosphere */}
        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
        
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Glow filter for neon effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Noise texture for grit */}
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.05"/>
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Base background */}
      <rect width="100%" height="100%" fill="url(#heroGradient)" />
      
      {/* Noise overlay for texture */}
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.4" />

      {/* Animated grid lines - urban/architectural feel */}
      <g className="grid-lines" opacity="0.15">
        {[...Array(20)].map((_, i) => (
          <line 
            key={`v-${i}`}
            x1={i * 100} y1="0" 
            x2={i * 100} y2="1080" 
            stroke="#D4AF37" 
            strokeWidth="0.5"
            className="grid-line-vertical"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <line 
            key={`h-${i}`}
            x1="0" y1={i * 100} 
            x2="1920" y2={i * 100} 
            stroke="#D4AF37" 
            strokeWidth="0.5"
            className="grid-line-horizontal"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </g>

      {/* Animated geometric shapes */}
      <g className="geometric-shapes">
        {/* Large rotating diamond */}
        <polygon 
          points="960,100 1100,300 960,500 820,300" 
          fill="none" 
          stroke="url(#goldGradient)" 
          strokeWidth="1"
          filter="url(#glow)"
          className="rotating-diamond"
          opacity="0.6"
        />
        
        {/* Pulsing circles */}
        <circle 
          cx="300" cy="700" r="150" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="1"
          className="pulsing-circle"
          opacity="0.3"
        />
        <circle 
          cx="1600" cy="400" r="100" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="1"
          className="pulsing-circle-delayed"
          opacity="0.25"
        />

        {/* Diagonal accent lines */}
        <line 
          x1="0" y1="800" x2="400" y2="1080" 
          stroke="url(#goldGradient)" 
          strokeWidth="2"
          className="accent-line"
          opacity="0.4"
        />
        <line 
          x1="1520" y1="0" x2="1920" y2="400" 
          stroke="url(#goldGradient)" 
          strokeWidth="2"
          className="accent-line-delayed"
          opacity="0.4"
        />
      </g>

      {/* Floating particles */}
      <g className="particles">
        {[...Array(30)].map((_, i) => (
          <circle 
            key={`particle-${i}`}
            cx={Math.random() * 1920}
            cy={Math.random() * 1080}
            r={Math.random() * 3 + 1}
            fill="#D4AF37"
            className="floating-particle"
            style={{ 
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
            opacity={Math.random() * 0.5 + 0.1}
          />
        ))}
      </g>
    </svg>
  );
}

// ============================================================================
// ANIMATED BRAND ICON - Stylized crown/shield representing empowerment
// ============================================================================
function AnimatedBrandIcon() {
  return (
    <svg 
      viewBox="0 0 120 120" 
      style={styles.brandIcon}
      className="brand-icon-animated"
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer ring */}
      <circle 
        cx="60" cy="60" r="55" 
        fill="none" 
        stroke="url(#iconGradient)" 
        strokeWidth="2"
        className="icon-ring-outer"
        filter="url(#iconGlow)"
      />
      
      {/* Inner ring */}
      <circle 
        cx="60" cy="60" r="45" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="1"
        className="icon-ring-inner"
        opacity="0.6"
      />
      
      {/* Crown shape - representing "Hold Your Own" empowerment */}
      <path 
        d="M30 70 L30 50 L45 60 L60 40 L75 60 L90 50 L90 70 L60 85 Z" 
        fill="none" 
        stroke="url(#iconGradient)" 
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#iconGlow)"
        className="crown-path"
      />
      
      {/* Center diamond */}
      <polygon 
        points="60,48 68,60 60,72 52,60" 
        fill="url(#iconGradient)"
        className="center-diamond"
      />
    </svg>
  );
}

// ============================================================================
// FLOATING ELEMENTS - Decorative geometric shapes
// ============================================================================
function FloatingElements() {
  return (
    <div style={styles.floatingContainer}>
      {/* Top right floating element */}
      <div style={{ ...styles.floatingElement, top: '15%', right: '10%' }} className="float-element-1">
        <svg viewBox="0 0 60 60" style={{ width: '60px', height: '60px' }}>
          <polygon 
            points="30,5 55,30 30,55 5,30" 
            fill="none" 
            stroke="#D4AF37" 
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      </div>
      
      {/* Bottom left floating element */}
      <div style={{ ...styles.floatingElement, bottom: '20%', left: '8%' }} className="float-element-2">
        <svg viewBox="0 0 80 80" style={{ width: '80px', height: '80px' }}>
          <circle cx="40" cy="40" r="35" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
          <circle cx="40" cy="40" r="25" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.2" />
        </svg>
      </div>
      
      {/* Mid right floating element */}
      <div style={{ ...styles.floatingElement, top: '60%', right: '5%' }} className="float-element-3">
        <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px' }}>
          <rect x="10" y="10" width="30" height="30" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.35" transform="rotate(45 25 25)" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================
function ProductCard({ product, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the primary image or first variant image
  const imageUrl = product.images?.[0] || 
                   product.variants?.[0]?.imageUrl || 
                   'https://via.placeholder.com/400x500?text=HYOW';

  return (
    <Link 
      to={`/products/${product.slug || product.id || product._id}`}
      style={{
        ...styles.productCard,
        animationDelay: `${index * 0.1}s`,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      className="product-card-animated"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.productImageWrapper}>
        <img 
          src={imageUrl} 
          alt={product.name || product.title}
          style={{
            ...styles.productImage,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        <div style={{
          ...styles.productOverlay,
          opacity: isHovered ? 1 : 0,
        }}>
          <span style={styles.quickViewText}>VIEW DETAILS</span>
        </div>
      </div>
      <div style={styles.productInfo}>
        <h3 style={styles.productName}>{product.name || product.title}</h3>
        <div style={styles.productPricing}>
          <span style={styles.productPrice}>
            ${(product.price / 100).toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span style={styles.comparePrice}>
              ${(product.compareAtPrice / 100).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// VALUE CARD COMPONENT
// ============================================================================
function ValueCard({ icon, title, description }) {
  const icons = {
    crown: (
      <svg viewBox="0 0 40 40" style={styles.valueIcon}>
        <path 
          d="M8 28 L8 18 L14 22 L20 12 L26 22 L32 18 L32 28 Z" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 40 40" style={styles.valueIcon}>
        <path 
          d="M20 6 L32 12 L32 22 C32 28 26 34 20 36 C14 34 8 28 8 22 L8 12 Z" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="2"
        />
      </svg>
    ),
    fire: (
      <svg viewBox="0 0 40 40" style={styles.valueIcon}>
        <path 
          d="M20 6 C24 12 28 16 28 24 C28 30 24 34 20 34 C16 34 12 30 12 24 C12 16 16 12 20 6 Z M20 18 C18 20 16 22 16 26 C16 28 18 30 20 30 C22 30 24 28 24 26 C24 22 22 20 20 18 Z" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="2"
        />
      </svg>
    ),
  };

  return (
    <div style={styles.valueCard} className="value-card-animated">
      <div style={styles.valueIconWrapper}>
        {icons[icon]}
      </div>
      <h4 style={styles.valueTitle}>{title}</h4>
      <p style={styles.valueDescription}>{description}</p>
    </div>
  );
}

// ============================================================================
// EMPTY STATE SVG
// ============================================================================
function EmptyStateSVG() {
  return (
    <svg viewBox="0 0 120 120" style={styles.emptyStateSvg}>
      <defs>
        <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#emptyGradient)" strokeWidth="2" strokeDasharray="10 5" />
      <path d="M40 50 L60 70 L80 50" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="45" r="8" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

// ============================================================================
// GLOBAL CSS ANIMATIONS
// ============================================================================
const globalAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Bebas+Neue&family=Barlow:wght@300;400;500;600&display=swap');

  /* Grid line animations */
  .grid-line-vertical, .grid-line-horizontal {
    animation: gridPulse 4s ease-in-out infinite;
  }
  
  @keyframes gridPulse {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.25; }
  }

  /* Rotating diamond */
  .rotating-diamond {
    animation: slowRotate 30s linear infinite;
    transform-origin: 960px 300px;
  }
  
  @keyframes slowRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Pulsing circles */
  .pulsing-circle {
    animation: pulse 4s ease-in-out infinite;
  }
  
  .pulsing-circle-delayed {
    animation: pulse 4s ease-in-out infinite 2s;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.5; }
  }

  /* Accent lines */
  .accent-line {
    animation: lineGlow 3s ease-in-out infinite;
  }
  
  .accent-line-delayed {
    animation: lineGlow 3s ease-in-out infinite 1.5s;
  }
  
  @keyframes lineGlow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  /* Floating particles */
  .floating-particle {
    animation: float 15s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-30px) translateX(20px); }
    50% { transform: translateY(-10px) translateX(-20px); }
    75% { transform: translateY(-40px) translateX(10px); }
  }

  /* Brand icon animations */
  .icon-ring-outer {
    animation: ringRotate 20s linear infinite;
    transform-origin: 60px 60px;
  }
  
  .icon-ring-inner {
    animation: ringRotate 15s linear infinite reverse;
    transform-origin: 60px 60px;
  }
  
  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .crown-path {
    animation: crownGlow 2s ease-in-out infinite;
  }
  
  @keyframes crownGlow {
    0%, 100% { filter: url(#iconGlow); }
    50% { filter: url(#iconGlow) brightness(1.3); }
  }
  
  .center-diamond {
    animation: diamondPulse 2s ease-in-out infinite;
  }
  
  @keyframes diamondPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Floating decorative elements */
  .float-element-1 {
    animation: floatElement 8s ease-in-out infinite;
  }
  
  .float-element-2 {
    animation: floatElement 10s ease-in-out infinite 2s;
  }
  
  .float-element-3 {
    animation: floatElement 7s ease-in-out infinite 4s;
  }
  
  @keyframes floatElement {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }

  /* Product card entrance animation */
  .product-card-animated {
    animation: cardReveal 0.6s ease-out forwards;
    opacity: 0;
  }
  
  @keyframes cardReveal {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Value card hover effect */
  .value-card-animated {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .value-card-animated:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(212, 175, 55, 0.15);
  }

  /* Scroll indicator animation */
  @keyframes scrollBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
  }

  /* Loading spinner */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Button hover effects */
  .cta-primary:hover {
    background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
  }
  
  .cta-secondary:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: #FFD700;
  }
`;

// ============================================================================
// STYLES OBJECT
// ============================================================================
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: "'Barlow', sans-serif",
    overflow: 'hidden',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  
  backgroundSvg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '0 20px',
    maxWidth: '900px',
  },
  
  brandIconWrapper: {
    marginBottom: '30px',
  },
  
  brandIcon: {
    width: '100px',
    height: '100px',
    margin: '0 auto',
  },
  
  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(3.5rem, 12vw, 8rem)',
    fontWeight: 400,
    letterSpacing: '0.05em',
    lineHeight: 0.9,
    margin: 0,
    textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
  },
  
  heroTitleLine1: {
    display: 'block',
    color: '#ffffff',
  },
  
  heroTitleLine2: {
    display: 'block',
    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  heroTagline: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 300,
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '25px',
    marginBottom: '40px',
    lineHeight: 1.6,
  },
  
  ctaContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
    color: '#0a0a0a',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  ctaArrow: {
    width: '20px',
    height: '20px',
  },
  
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 36px',
    background: 'transparent',
    color: '#D4AF37',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textDecoration: 'none',
    border: '1px solid #D4AF37',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 5,
  },
  
  floatingElement: {
    position: 'absolute',
  },
  
  scrollIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    animation: 'scrollBounce 2s ease-in-out infinite',
  },
  
  scrollLine: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, #D4AF37, transparent)',
  },
  
  scrollText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.7rem',
    letterSpacing: '0.2em',
    color: 'rgba(212, 175, 55, 0.6)',
  },

  // Products Section
  productsSection: {
    padding: '100px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  
  sectionLabel: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.8rem',
    letterSpacing: '0.3em',
    color: '#D4AF37',
    display: 'block',
    marginBottom: '10px',
  },
  
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 400,
    letterSpacing: '0.1em',
    margin: 0,
    color: '#ffffff',
  },
  
  sectionDivider: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
    margin: '20px auto 0',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  },
  
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '2px solid rgba(212, 175, 55, 0.2)',
    borderTopColor: '#D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    marginTop: '20px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: "'Barlow', sans-serif",
    letterSpacing: '0.1em',
  },
  
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
  },
  
  productCard: {
    display: 'block',
    textDecoration: 'none',
    background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
    borderRadius: '4px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(212, 175, 55, 0.1)',
  },
  
  productImageWrapper: {
    position: 'relative',
    aspectRatio: '4/5',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  
  productOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease',
  },
  
  quickViewText: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '0.9rem',
    letterSpacing: '0.2em',
    color: '#D4AF37',
    padding: '12px 24px',
    border: '1px solid #D4AF37',
  },
  
  productInfo: {
    padding: '20px',
  },
  
  productName: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
  
  productPricing: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  productPrice: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#D4AF37',
  },
  
  comparePrice: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.4)',
    textDecoration: 'line-through',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  
  emptyStateSvg: {
    width: '120px',
    height: '120px',
    margin: '0 auto 30px',
  },
  
  emptyStateText: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  },
  
  emptyStateSubtext: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '10px',
  },
  
  viewAllContainer: {
    textAlign: 'center',
    marginTop: '50px',
  },
  
  viewAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    background: 'transparent',
    color: '#D4AF37',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textDecoration: 'none',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    transition: 'all 0.3s ease',
  },
  
  viewAllArrow: {
    width: '18px',
    height: '18px',
  },

  // Values Section
  valuesSection: {
    padding: '80px 20px',
    background: 'linear-gradient(180deg, #0d0d0d 0%, #151515 50%, #0d0d0d 100%)',
  },
  
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  valueCard: {
    textAlign: 'center',
    padding: '40px 30px',
    background: 'rgba(20, 20, 20, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    borderRadius: '4px',
  },
  
  valueIconWrapper: {
    marginBottom: '20px',
  },
  
  valueIcon: {
    width: '50px',
    height: '50px',
    margin: '0 auto',
  },
  
  valueTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#D4AF37',
    margin: '0 0 15px 0',
  },
  
  valueDescription: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 300,
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },

  // Newsletter Section
  newsletterSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, transparent 50%, rgba(212, 175, 55, 0.05) 100%)',
  },
  
  newsletterContent: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  
  newsletterTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: '0 0 15px 0',
  },
  
  newsletterText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1rem',
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '30px',
    lineHeight: 1.6,
  },
  
  newsletterForm: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  
  newsletterInput: {
    flex: '1 1 250px',
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '2px',
    color: '#ffffff',
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  
  newsletterButton: {
    padding: '14px 30px',
    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
    color: '#0a0a0a',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
