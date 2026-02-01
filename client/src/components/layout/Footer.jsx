/**
 * Footer Component
 * 
 * The site footer provides secondary navigation, contact information,
 * social links, and the newsletter signup form. It reinforces the brand
 * identity with the tagline and creates a complete site experience.
 */

import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-street-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-street-700">
        <div className="container-custom py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-2xl tracking-wider mb-2">
              JOIN THE MOVEMENT
            </h3>
            <p className="text-street-400 mb-6">
              Subscribe for exclusive drops, early access, and stories from the journey.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-street-800 border border-street-700 text-white placeholder-street-500 focus:border-sunset-500 focus:ring-1 focus:ring-sunset-500"
              />
              <button type="submit" className="btn-accent whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="font-display text-2xl tracking-wider">
              HOLD YOUR OWN
            </Link>
            <p className="mt-4 text-street-400 text-sm leading-relaxed">
              From the streets to success. California beach vibes meet Harlem street style. 
              Own your narrative. Own your future.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/holdyourownbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-street-400 hover:text-sunset-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://youtube.com/@HYOWORLDWIDE140"
                target="_blank"
                rel="noopener noreferrer"
                className="text-street-400 hover:text-sunset-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a
                href="mailto:info@holdyourownbrand.com"
                className="text-street-400 hover:text-sunset-500 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">SHOP</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-street-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/category/tees" className="text-street-400 hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/category/hoodies" className="text-street-400 hover:text-white transition-colors">Hoodies</Link></li>
              <li><Link to="/category/hats" className="text-street-400 hover:text-white transition-colors">Hats</Link></li>
              <li><Link to="/category/accessories" className="text-street-400 hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">COMPANY</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-street-400 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-street-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/lookbook" className="text-street-400 hover:text-white transition-colors">Lookbook</Link></li>
              <li><Link to="/blog" className="text-street-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">HELP</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-street-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-street-400 hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/size-guide" className="text-street-400 hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link to="/privacy" className="text-street-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-street-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-street-800">
        <div className="container-custom py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-street-500">
            <p>© {currentYear} Hold Your Own Brand. All rights reserved.</p>
            <p>Made with 💪 from California to Harlem</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
