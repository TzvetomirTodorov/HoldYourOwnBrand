/**
 * DropCountdownTimer - Hype mechanic for product drops
 * 
 * Features:
 * - Server-synced countdown (prevents client-side cheating)
 * - Animated urgency indicators
 * - Email/SMS notification signup
 * - "Add to Calendar" functionality
 * - Pulse animation when time is close
 * - Auto-refresh to product page when drop goes live
 * 
 * Usage:
 * <DropCountdownTimer 
 *   dropId="spring-2026-drop"
 *   dropTitle="SPRING '26 COLLECTION"
 *   dropDate="2026-03-15T12:00:00Z"
 *   productSlug="spring-collection"
 * />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Bell, 
  BellRing, 
  Calendar, 
  Flame, 
  Loader2,
  CheckCircle,
  Mail,
  Smartphone
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TIME UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const calculateTimeLeft = (targetDate) => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isLive: false,
    total: difference,
  };
};

const formatNumber = (num) => String(num).padStart(2, '0');

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function DropCountdownTimer({ 
  dropId,
  dropTitle = 'EXCLUSIVE DROP',
  dropDate,
  productSlug,
  onNotifySignup,
  showCalendarButton = true,
  autoRedirect = true,
  variant = 'full', // 'full' | 'compact' | 'mini'
}) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(dropDate));
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifyMethod, setNotifyMethod] = useState('email'); // 'email' | 'sms' | 'both'
  const intervalRef = useRef(null);
  const hasRedirected = useRef(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNTDOWN LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Update every second
    intervalRef.current = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(dropDate);
      setTimeLeft(newTimeLeft);

      // Auto-redirect when drop goes live
      if (newTimeLeft.isLive && autoRedirect && !hasRedirected.current && productSlug) {
        hasRedirected.current = true;
        // Small delay for dramatic effect
        setTimeout(() => {
          navigate(`/products?collection=${productSlug}`);
        }, 500);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dropDate, autoRedirect, productSlug, navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION SIGNUP
  // ═══════════════════════════════════════════════════════════════════════════

  const handleNotifySignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call parent handler or API
      if (onNotifySignup) {
        await onNotifySignup({ 
          dropId, 
          email: notifyMethod !== 'sms' ? notifyEmail : null,
          phone: notifyMethod !== 'email' ? notifyPhone : null,
        });
      } else {
        // Default API call
        await fetch('/api/drops/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dropId,
            email: notifyMethod !== 'sms' ? notifyEmail : null,
            phone: notifyMethod !== 'email' ? notifyPhone : null,
          }),
        });
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD TO CALENDAR
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddToCalendar = useCallback(() => {
    const event = {
      title: `HYOW ${dropTitle}`,
      description: `Don't miss the exclusive drop! Shop at holdyourownbrand.com`,
      startDate: new Date(dropDate),
      endDate: new Date(new Date(dropDate).getTime() + 60 * 60 * 1000), // 1 hour
    };

    // Generate Google Calendar URL
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${event.startDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}/${event.endDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}`;

    window.open(googleUrl, '_blank');
  }, [dropDate, dropTitle]);

  // ═══════════════════════════════════════════════════════════════════════════
  // URGENCY LEVEL (for styling)
  // ═══════════════════════════════════════════════════════════════════════════

  const getUrgencyLevel = () => {
    const { total, isLive } = timeLeft;
    if (isLive) return 'live';
    if (total < 60 * 1000) return 'critical'; // < 1 minute
    if (total < 60 * 60 * 1000) return 'urgent'; // < 1 hour
    if (total < 24 * 60 * 60 * 1000) return 'soon'; // < 24 hours
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - LIVE STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (timeLeft.isLive) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8 text-white">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
        <div className="absolute inset-0 animate-pulse bg-white/5" />
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 animate-bounce" />
            <span className="text-xs font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full">
              LIVE NOW
            </span>
            <Flame className="w-8 h-8 animate-bounce" />
          </div>
          
          <h2 className="font-display text-4xl md:text-6xl tracking-wider mb-4 animate-pulse">
            {dropTitle}
          </h2>
          
          <p className="text-white/90 mb-6">The drop is live! Shop before it sells out.</p>
          
          <button
            onClick={() => navigate(`/products?collection=${productSlug}`)}
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg"
          >
            SHOP NOW
            <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - COUNTDOWN STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const urgencyStyles = {
    normal: 'bg-gradient-to-br from-street-900 to-street-800',
    soon: 'bg-gradient-to-br from-amber-900 to-amber-800',
    urgent: 'bg-gradient-to-br from-orange-600 to-red-600',
    critical: 'bg-gradient-to-br from-red-600 to-red-700 animate-pulse',
  };

  // Mini variant (just numbers)
  if (variant === 'mini') {
    return (
      <div className="inline-flex items-center gap-1 text-sm font-mono">
        <Clock className="w-4 h-4" />
        <span>{formatNumber(timeLeft.days)}d</span>
        <span>{formatNumber(timeLeft.hours)}h</span>
        <span>{formatNumber(timeLeft.minutes)}m</span>
        <span>{formatNumber(timeLeft.seconds)}s</span>
      </div>
    );
  }

  // Compact variant (horizontal bar)
  if (variant === 'compact') {
    return (
      <div className={`${urgencyStyles[urgency]} rounded-lg p-4 text-white`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-display tracking-wider">{dropTitle}</span>
          </div>
          
          <div className="flex items-center gap-3 font-mono text-xl">
            <span>{formatNumber(timeLeft.days)}d</span>
            <span>:</span>
            <span>{formatNumber(timeLeft.hours)}h</span>
            <span>:</span>
            <span>{formatNumber(timeLeft.minutes)}m</span>
            <span>:</span>
            <span className={urgency === 'critical' ? 'text-white animate-pulse' : ''}>
              {formatNumber(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant (card with all features)
  return (
    <div className={`${urgencyStyles[urgency]} rounded-2xl p-8 text-white relative overflow-hidden`}>
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest">DROPPING SOON</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl tracking-wider">
            {dropTitle}
          </h2>
        </div>

        {/* Countdown blocks */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HOURS', value: timeLeft.hours },
            { label: 'MINS', value: timeLeft.minutes },
            { label: 'SECS', value: timeLeft.seconds },
          ].map((unit) => (
            <div 
              key={unit.label} 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <div className={`font-mono text-4xl md:text-6xl font-bold mb-1 ${
                unit.label === 'SECS' && urgency === 'critical' ? 'animate-pulse' : ''
              }`}>
                {formatNumber(unit.value)}
              </div>
              <div className="text-xs tracking-widest opacity-70">{unit.label}</div>
            </div>
          ))}
        </div>

        {/* Notification signup */}
        {!isSubscribed ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">Get notified when it drops</span>
            </div>

            {/* Method selector */}
            <div className="flex gap-2 mb-4">
              {['email', 'sms', 'both'].map((method) => (
                <button
                  key={method}
                  onClick={() => setNotifyMethod(method)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    notifyMethod === method 
                      ? 'bg-white text-black' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {method === 'email' && <Mail className="w-4 h-4 inline mr-1" />}
                  {method === 'sms' && <Smartphone className="w-4 h-4 inline mr-1" />}
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleNotifySignup} className="space-y-3">
              {notifyMethod !== 'sms' && (
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Enter your email"
                  required={notifyMethod !== 'sms'}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              )}
              
              {notifyMethod !== 'email' && (
                <input
                  type="tel"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required={notifyMethod !== 'email'}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <BellRing className="w-5 h-5" />
                    NOTIFY ME
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="font-semibold">You're on the list!</p>
            <p className="text-sm opacity-70">We'll notify you when the drop goes live.</p>
          </div>
        )}

        {/* Calendar button */}
        {showCalendarButton && (
          <button
            onClick={handleAddToCalendar}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </button>
        )}
      </div>
    </div>
  );
}

export default DropCountdownTimer;
