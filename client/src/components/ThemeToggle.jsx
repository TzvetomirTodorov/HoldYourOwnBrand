/**
 * ThemeToggle Component
 * 
 * A beautiful animated toggle for dark/light mode.
 * Features sun/moon icons with smooth transitions.
 * 
 * Usage:
 * <ThemeToggle />
 * <ThemeToggle showLabel />
 * <ThemeToggle variant="minimal" />
 */

import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

const SunIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
    />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
    />
  </svg>
);

const SystemIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
    />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// THEME TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ThemeToggle({ 
  showLabel = false, 
  variant = 'default', // 'default' | 'minimal' | 'dropdown'
  className = '' 
}) {
  const { theme, resolvedTheme, toggleTheme, setTheme, initializeTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // ─────────────────────────────────────────────────────────────────────────
  // MINIMAL VARIANT - Just icon button
  // ─────────────────────────────────────────────────────────────────────────
  
  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        <div className="relative w-5 h-5">
          {/* Sun Icon */}
          <SunIcon 
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
              isDark 
                ? 'opacity-0 rotate-90 scale-50' 
                : 'opacity-100 rotate-0 scale-100'
            }`} 
          />
          {/* Moon Icon */}
          <MoonIcon 
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
              isDark 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-50'
            }`} 
          />
        </div>
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DROPDOWN VARIANT - Three options: Light, Dark, System
  // ─────────────────────────────────────────────────────────────────────────
  
  if (variant === 'dropdown') {
    return (
      <div className={`relative group ${className}`}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Theme settings"
        >
          {isDark ? (
            <MoonIcon className="w-5 h-5" />
          ) : (
            <SunIcon className="w-5 h-5" />
          )}
          {showLabel && (
            <span className="text-sm capitalize">{theme}</span>
          )}
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-1 py-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <button
            onClick={() => setTheme('light')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              theme === 'light' ? 'text-black dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <SunIcon className="w-4 h-4" />
            Light
            {theme === 'light' && <span className="ml-auto">✓</span>}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              theme === 'dark' ? 'text-black dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <MoonIcon className="w-4 h-4" />
            Dark
            {theme === 'dark' && <span className="ml-auto">✓</span>}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              theme === 'system' ? 'text-black dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <SystemIcon className="w-4 h-4" />
            System
            {theme === 'system' && <span className="ml-auto">✓</span>}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT VARIANT - Animated pill toggle
  // ─────────────────────────────────────────────────────────────────────────
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-full
        bg-neutral-100 dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        transition-all duration-300
        hover:border-neutral-300 dark:hover:border-neutral-600
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background Pill Slider */}
      <div 
        className={`
          absolute top-1 bottom-1 w-8 rounded-full
          bg-white dark:bg-neutral-700
          shadow-sm
          transition-all duration-300 ease-out
          ${isDark ? 'left-[calc(100%-2.25rem)]' : 'left-1'}
        `}
      />
      
      {/* Sun */}
      <div className={`relative z-10 p-1 transition-colors duration-300 ${!isDark ? 'text-amber-500' : 'text-neutral-500'}`}>
        <SunIcon className="w-4 h-4" />
      </div>
      
      {/* Moon */}
      <div className={`relative z-10 p-1 transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-neutral-400'}`}>
        <MoonIcon className="w-4 h-4" />
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className="relative z-10 text-sm font-medium ml-1 capitalize">
          {resolvedTheme}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME INITIALIZER - Add to App.jsx
// ═══════════════════════════════════════════════════════════════════════════

export function ThemeInitializer() {
  const { initializeTheme } = useThemeStore();
  
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);
  
  return null;
}
