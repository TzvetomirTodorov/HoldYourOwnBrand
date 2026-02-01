/**
 * Admin Products Page - Product management interface
 */
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/admin/products');
        setProducts(response.data.products);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button className="btn-primary text-sm py-2"><Plus className="w-4 h-4 mr-2" />Add Product</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-street-50 text-left text-sm">
            <tr>
              <th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan="5" className="p-6 text-center text-street-500">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-street-500">No products yet. Add your first product!</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">${parseFloat(p.price).toFixed(2)}</td>
                <td className="p-4">{p.total_stock || 0}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${p.status === 'active' ? 'bg-palm-100 text-palm-700' : 'bg-street-100'}`}>{p.status}</span></td>
                <td className="p-4"><button className="text-street-400 hover:text-ocean-600 mr-2"><Edit className="w-4 h-4" /></button><button className="text-street-400 hover:text-blood-600"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminProducts;
