/**
 * Theme Store - Dark Mode Implementation
 * 
 * Features:
 * - System preference detection
 * - Manual toggle with persistence
 * - CSS custom properties approach
 * - Smooth transitions
 * 
 * 81.9% of users prefer dark mode - especially in streetwear/luxury!
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// THEME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const THEMES = {
  light: {
    name: 'light',
    colors: {
      // Backgrounds
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f8f8',
      bgTertiary: '#f0f0f0',
      bgCard: '#ffffff',
      bgElevated: '#ffffff',
      
      // Text
      textPrimary: '#0a0a0a',
      textSecondary: '#525252',
      textMuted: '#737373',
      textInverse: '#ffffff',
      
      // Brand
      accent: '#0a0a0a',
      accentHover: '#262626',
      
      // Borders
      border: '#e5e5e5',
      borderHover: '#d4d4d4',
      
      // Status
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      
      // Overlays
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      // Backgrounds - Deep blacks for luxury feel
      bgPrimary: '#0a0a0a',
      bgSecondary: '#141414',
      bgTertiary: '#1a1a1a',
      bgCard: '#141414',
      bgElevated: '#1f1f1f',
      
      // Text - High contrast whites
      textPrimary: '#fafafa',
      textSecondary: '#a3a3a3',
      textMuted: '#737373',
      textInverse: '#0a0a0a',
      
      // Brand - Inverted accent
      accent: '#fafafa',
      accentHover: '#e5e5e5',
      
      // Borders - Subtle
      border: '#262626',
      borderHover: '#404040',
      
      // Status
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      
      // Overlays
      overlay: 'rgba(0, 0, 0, 0.8)',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// APPLY THEME TO DOM
// ═══════════════════════════════════════════════════════════════════════════

const applyTheme = (themeName) => {
  const theme = THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', themeName);
  
  // Update meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme.colors.bgPrimary);
  }

  // Add/remove dark class on body for Tailwind dark mode
  if (themeName === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DETECT SYSTEM PREFERENCE
// ═══════════════════════════════════════════════════════════════════════════

const getSystemPreference = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'system', // 'light' | 'dark' | 'system'
      resolvedTheme: getSystemPreference(), // Actual applied theme
      
      // Actions
      setTheme: (theme) => {
        const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },
      
      toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        set({ theme: newTheme, resolvedTheme: newTheme });
      },
      
      // Initialize theme on app load
      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
      },
    }),
    {
      name: 'hyow-theme',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme preference
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PREFERENCE LISTENER
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', (e) => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === 'system') {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      applyTheme(newResolvedTheme);
      useThemeStore.setState({ resolvedTheme: newResolvedTheme });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { THEMES, applyTheme, getSystemPreference };
export default useThemeStore;
