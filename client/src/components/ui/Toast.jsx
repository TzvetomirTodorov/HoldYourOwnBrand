/**
 * Toast Notification Component
 * 
 * Renders toast notifications in a fixed position at the top-right of the screen.
 * Notifications slide in from the right and can be manually dismissed.
 * 
 * This component should be placed once at the app root level (in Layout.jsx or App.jsx)
 * and will automatically display any notifications from the store.
 * 
 * Supports four notification types:
 * - success (green) - for successful actions
 * - error (red) - for failures and errors  
 * - warning (orange) - for cautions
 * - info (blue) - for general information
 * - loading (gray with spinner) - for async operations
 */

import { useNotificationStore } from '../../store/notificationStore';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// Icon mapping for each notification type
const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

// Color classes for each notification type (using your existing Tailwind colors)
const colorClasses = {
  success: {
    bg: 'bg-green-50 border-green-500',
    icon: 'text-green-500',
    text: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50 border-blood-500',
    icon: 'text-blood-500',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-500',
    icon: 'text-amber-500',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50 border-ocean-500',
    icon: 'text-ocean-500',
    text: 'text-blue-800',
  },
  loading: {
    bg: 'bg-street-50 border-street-400',
    icon: 'text-street-500',
    text: 'text-street-700',
  },
};

/**
 * Individual toast notification item
 */
function ToastItem({ notification, onDismiss }) {
  const { type, message, id } = notification;
  const Icon = icons[type] || Info;
  const colors = colorClasses[type] || colorClasses.info;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
        ${colors.bg}
        animate-slide-in-right
        min-w-[300px] max-w-[400px]
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <Icon 
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon} ${type === 'loading' ? 'animate-spin' : ''}`} 
      />
      
      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${colors.text}`}>
        {message}
      </p>
      
      {/* Dismiss button (not shown for loading type) */}
      {type !== 'loading' && (
        <button
          onClick={() => onDismiss(id)}
          className={`flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors ${colors.text}`}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Toast container - renders all active notifications
 */
function Toast() {
  const { notifications, removeNotification } = useNotificationStore();

  // Don't render anything if no notifications
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}

export default Toast;
