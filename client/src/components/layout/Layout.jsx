/**
 * Main Layout Component
 * 
 * This component wraps all public pages and provides the consistent
 * header, footer, and navigation that customers see throughout the store.
 * 
 * Using Outlet from react-router-dom allows child routes to render
 * their content in the designated area while keeping the layout consistent.
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main navigation header */}
      <Header />
      
      {/* Page content - child routes render here */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Site footer */}
      <Footer />
    </div>
  );
}

export default Layout;
