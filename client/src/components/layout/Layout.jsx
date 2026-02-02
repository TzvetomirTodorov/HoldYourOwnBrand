/**
 * Layout Component
 * 
 * The main layout wrapper for all public storefront pages.
 * Includes the header, footer, and now a global Toast notification system.
 * 
 * The Outlet component from React Router renders the current page content
 * between the header and footer.
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Toast from '../ui/Toast';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Toast Notifications - renders on top of everything */}
      <Toast />
      
      {/* Site Header */}
      <Header />
      
      {/* Main Content Area - renders the matched route's component */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Site Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
