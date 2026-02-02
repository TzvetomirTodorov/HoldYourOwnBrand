// HomePage.jsx - Updated with better button styling
// Fix for the "Our Story" button visibility issue

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.products.getFeatured(),
          api.categories.getAll()
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hyow-navy text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              OWN YOUR<br />
              <span className="text-hyow-gold">NARRATIVE</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              From the streets of Harlem to the beaches of California. Premium 
              streetwear for those who write their own story.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-hyow-gold text-hyow-navy font-semibold rounded hover:bg-hyow-gold/90 transition-colors"
              >
                SHOP NOW
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {/* FIXED: Our Story button now has visible border and better contrast */}
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded hover:bg-white hover:text-hyow-navy transition-colors"
              >
                OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-hyow-navy">
              FEATURED
            </h2>
            <Link 
              to="/products" 
              className="text-hyow-gold hover:text-hyow-gold/80 font-medium flex items-center"
            >
              View All
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>New products coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-hyow-navy mb-8 text-center">
            SHOP BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-square bg-hyow-navy rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-white text-lg md:text-xl font-bold group-hover:text-hyow-gold transition-colors">
                    {category.name.toUpperCase()}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {category.productCount || 0} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story CTA */}
      <section className="py-20 bg-hyow-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            FROM THE STREETS TO SUCCESS
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Every piece tells a story of perseverance, transformation, and triumph.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center px-8 py-4 bg-hyow-gold text-hyow-navy font-bold rounded hover:bg-hyow-gold/90 transition-colors"
          >
            READ OUR STORY
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-hyow-navy mb-4">
            JOIN THE MOVEMENT
          </h2>
          <p className="text-gray-600 mb-6">
            Get early access to drops, exclusive offers, and stories from the streets.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-hyow-gold"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-hyow-navy text-white font-semibold rounded hover:bg-hyow-navy/90 transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
