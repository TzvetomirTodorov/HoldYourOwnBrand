/**
 * Admin Layout Component
 * 
 * This layout provides a different structure than the main storefront.
 * Admin pages use a sidebar navigation pattern that's common in dashboard
 * applications, making it easy to switch between different management sections.
 * 
 * The layout is designed to be functional first - clean, professional,
 * and efficient for daily store management tasks.
 */

import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Admin navigation items
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Discounts', href: '/admin/discounts', icon: Tag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-street-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ocean-950 text-white
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-ocean-800">
          <Link to="/admin" className="font-display text-xl tracking-wider">
            HYOW ADMIN
          </Link>
          <button
            className="lg:hidden p-1 text-ocean-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-ocean-800 text-white' 
                  : 'text-ocean-300 hover:bg-ocean-900 hover:text-white'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* View store link */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2 
                       text-sm text-ocean-300 hover:text-white
                       border border-ocean-700 rounded-lg hover:border-ocean-500
                       transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </Link>
        </div>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ocean-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-ocean-400 text-xs">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-ocean-400 hover:text-white transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-street-200 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 text-street-600 hover:text-street-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page title will be inserted by child components */}
          <div className="flex-1" />
          
          {/* Right side actions could go here */}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
