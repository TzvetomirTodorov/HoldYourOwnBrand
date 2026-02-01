/**
 * Admin Orders Page - Order management interface
 */
import { useEffect, useState } from 'react';
import api from '../../services/api';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/admin/orders');
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusColors = {
    pending: 'bg-street-100 text-street-700',
    paid: 'bg-palm-100 text-palm-700',
    processing: 'bg-sunset-100 text-sunset-700',
    shipped: 'bg-ocean-100 text-ocean-700',
    delivered: 'bg-palm-100 text-palm-700',
    cancelled: 'bg-blood-100 text-blood-700'
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-street-50 text-left text-sm">
            <tr>
              <th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan="5" className="p-6 text-center text-street-500">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-street-500">No orders yet.</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-street-50 cursor-pointer">
                <td className="p-4 font-medium">{o.order_number}</td>
                <td className="p-4 text-sm text-street-500">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4">{o.email}</td>
                <td className="p-4 font-semibold">${parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${statusColors[o.status] || statusColors.pending}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminOrders;
