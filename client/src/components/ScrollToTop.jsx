import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * This component listens for route changes and automatically scrolls
 * the window to the top when navigating to a new page.
 * 
 * INSTALLATION:
 * 1. Save this file to: client/src/components/ScrollToTop.jsx
 * 2. Import it in your App.jsx: import ScrollToTop from './components/ScrollToTop';
 * 3. Add <ScrollToTop /> inside your <BrowserRouter> but BEFORE <Routes>
 * 
 * Example App.jsx structure:
 * 
 *   <BrowserRouter>
 *     <ScrollToTop />
 *     <Navbar />
 *     <Routes>
 *       ...your routes...
 *     </Routes>
 *     <Footer />
 *   </BrowserRouter>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' if you want animated scrolling
    });
  }, [pathname]);

  // This component doesn't render anything visible
  return null;
};

export default ScrollToTop;
