/**
 * Product Detail Page - Individual product view with variants and add to cart
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus } from 'lucide-react';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';

function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        setProduct(response.data.product);
        if (response.data.product.variants?.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addToCart(selectedVariant.id, quantity);
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-street-100 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-street-100 animate-pulse w-3/4" />
              <div className="h-6 bg-street-100 animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="section container-custom">Product not found</div>;
  }

  return (
    <div className="section">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-street-100 overflow-hidden">
              {product.images?.[selectedImage] && (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-street-100 overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-ocean-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-display text-3xl lg:text-4xl tracking-wider mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-medium text-ocean-950 mb-6">
              ${(product.price + (selectedVariant?.priceAdjustment || 0)).toFixed(2)}
              {product.compareAtPrice && (
                <span className="ml-3 text-lg text-street-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </p>

            <p className="text-street-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Variant Selection */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Size / Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.inStock}
                      className={`px-4 py-2 border text-sm font-medium ${
                        selectedVariant?.id === variant.id
                          ? 'border-ocean-950 bg-ocean-950 text-white'
                          : variant.inStock
                          ? 'border-street-300 hover:border-ocean-600'
                          : 'border-street-200 text-street-400 cursor-not-allowed'
                      }`}
                    >
                      {variant.size} {variant.color && `/ ${variant.color}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center border border-street-300 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-street-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-street-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.inStock}
                className="btn-primary flex-1"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {selectedVariant?.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="btn-secondary px-4">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
