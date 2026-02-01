/**
 * Home Page
 * 
 * The landing page for Hold Your Own Brand. This is the first impression
 * customers get, so it needs to:
 * 1. Communicate the brand identity immediately
 * 2. Showcase featured and new products
 * 3. Drive visitors to browse the catalog
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/new-arrivals')
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-ocean-950 text-white">
        <div className="container-custom py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-tight mb-6">
              OWN YOUR
              <span className="block text-sunset-500">NARRATIVE</span>
            </h1>
            <p className="text-lg lg:text-xl text-ocean-200 mb-8 leading-relaxed">
              From the streets of Harlem to the beaches of California. 
              Premium streetwear for those who write their own story.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-accent">
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="btn-secondary border-white text-white hover:bg-white hover:text-ocean-950">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl lg:text-4xl tracking-wider">FEATURED</h2>
            <Link to="/products?featured=true" className="link flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-product bg-street-100 animate-pulse" />
                ))
              : featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="bg-street-900 text-white py-16 lg:py-24">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl lg:text-5xl tracking-wider mb-6">
            FROM THE STREETS TO SUCCESS
          </h2>
          <p className="max-w-2xl mx-auto text-street-300 text-lg leading-relaxed mb-8">
            Every piece tells a story of perseverance, transformation, and triumph.
          </p>
          <Link to="/about" className="btn-primary bg-sunset-600 hover:bg-sunset-700">
            Read Our Story
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section bg-street-50">
        <div className="container-custom">
          <h2 className="font-display text-3xl lg:text-4xl tracking-wider text-center mb-12">
            SHOP BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { name: 'T-Shirts', slug: 'tees', color: 'bg-ocean-600' },
              { name: 'Hoodies', slug: 'hoodies', color: 'bg-street-700' },
              { name: 'Hats', slug: 'hats', color: 'bg-sunset-600' },
              { name: 'Accessories', slug: 'accessories', color: 'bg-palm-700' },
            ].map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className={`${category.color} aspect-square flex items-center justify-center
                           text-white font-display text-2xl lg:text-3xl tracking-wider
                           hover:opacity-90 transition-opacity`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
