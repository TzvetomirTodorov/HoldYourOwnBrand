/**
 * Admin Dashboard Page - Main overview with business metrics
 */
import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) return <div className="animate-pulse">Loading dashboard...</div>;

  const statCards = [
    { title: "Today's Revenue", value: `$${stats?.today?.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-palm-600 bg-palm-100' },
    { title: "This Month", value: `$${stats?.month?.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-ocean-600 bg-ocean-100' },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: ShoppingCart, color: 'text-sunset-600 bg-sunset-100' },
    { title: "Low Stock", value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'text-blood-600 bg-blood-100' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-street-500">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {stats?.recentOrders?.length > 0 ? (
          <div className="divide-y">{stats.recentOrders.map((o) => (
            <div key={o.order_number} className="py-3 flex justify-between">
              <span>{o.order_number}</span><span className="font-semibold">${parseFloat(o.total).toFixed(2)}</span>
            </div>
          ))}</div>
        ) : <p className="text-street-500">No orders yet.</p>}
      </div>
    </div>
  );
}
export default AdminDashboard;
