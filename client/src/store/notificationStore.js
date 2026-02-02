/**
 * Notification Store
 * 
 * Manages toast notifications across the entire app using Zustand.
 * This provides a simple API for showing success, error, info, and warning
 * messages from anywhere in the application.
 * 
 * Usage:
 *   import { useNotificationStore } from '../store/notificationStore';
 *   
 *   // In a component:
 *   const { showSuccess, showError } = useNotificationStore();
 *   showSuccess('Order placed successfully!');
 *   showError('Payment failed. Please try again.');
 */

import { create } from 'zustand';

// Auto-incrementing ID for notifications
let notificationId = 0;

export const useNotificationStore = create((set, get) => ({
  // Array of active notifications
  notifications: [],

  /**
   * Add a notification to the stack
   * @param {Object} notification - { type, message, duration }
   * @returns {number} - The notification ID for manual dismissal
   */
  addNotification: (notification) => {
    const id = ++notificationId;
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 5000, // Default 5 seconds
      createdAt: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-dismiss after duration (unless duration is 0 for persistent)
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  /**
   * Remove a notification by ID
   */
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  /**
   * Clear all notifications
   */
  clearAll: () => {
    set({ notifications: [] });
  },

  // Convenience methods for different notification types

  /**
   * Show a success notification (green)
   */
  showSuccess: (message, duration = 5000) => {
    return get().addNotification({ type: 'success', message, duration });
  },

  /**
   * Show an error notification (red)
   */
  showError: (message, duration = 7000) => {
    return get().addNotification({ type: 'error', message, duration });
  },

  /**
   * Show a warning notification (yellow/orange)
   */
  showWarning: (message, duration = 6000) => {
    return get().addNotification({ type: 'warning', message, duration });
  },

  /**
   * Show an info notification (blue)
   */
  showInfo: (message, duration = 5000) => {
    return get().addNotification({ type: 'info', message, duration });
  },

  /**
   * Show a loading notification (stays until manually dismissed)
   * Returns the ID so you can dismiss it later
   */
  showLoading: (message = 'Loading...') => {
    return get().addNotification({ type: 'loading', message, duration: 0 });
  },
}));
