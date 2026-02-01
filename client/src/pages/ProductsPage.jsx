/**
 * Products Page - Catalog listing with filtering
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        if (category) params.set('category', category);
        
        const response = await api.get(`/products?${params.toString()}`);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, category]);

  return (
    <div className="section">
      <div className="container-custom">
        <h1 className="font-display text-4xl tracking-wider mb-8">
          {category ? category.toUpperCase().replace('-', ' ') : 'ALL PRODUCTS'}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-product bg-street-100 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-street-500 py-12">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
