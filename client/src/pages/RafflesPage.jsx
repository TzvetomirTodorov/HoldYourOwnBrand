/**
 * Raffles Page - Nike SNKRS Style Drop System
 * 
 * Features:
 * - Active raffle listings with countdown timers
 * - Entry form with size selection
 * - Real-time entry count
 * - User's raffle history
 * - Winner announcements
 * 
 * Inspired by: Nike SNKRS, END. Launches, KITH Draws
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatCountdown = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) return { expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// COUNTDOWN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Countdown({ targetDate, label, onExpire }) {
  const [time, setTime] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = formatCountdown(targetDate);
      setTime(newTime);
      if (newTime.expired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (time.expired) {
    return <span className="text-red-500 font-bold">{label || 'ENDED'}</span>;
  }

  return (
    <div className="flex items-center gap-1 font-mono">
      {time.days > 0 && (
        <>
          <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-sm font-bold">
            {time.days}d
          </span>
          <span className="text-neutral-400">:</span>
        </>
      )}
      <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-sm font-bold">
        {String(time.hours).padStart(2, '0')}
      </span>
      <span className="text-neutral-400">:</span>
      <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-sm font-bold">
        {String(time.minutes).padStart(2, '0')}
      </span>
      <span className="text-neutral-400">:</span>
      <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-sm font-bold">
        {String(time.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RAFFLE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function RaffleCard({ raffle, userEntry, onEnter }) {
  const { isAuthenticated } = useAuthStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [localEntry, setLocalEntry] = useState(userEntry);

  const hasEntered = localEntry?.entered;
  const isActive = raffle.isActive;
  const now = new Date();
  const entryStart = new Date(raffle.entryStart);
  const entryEnd = new Date(raffle.entryEnd);
  const isUpcoming = now < entryStart;
  const isEnded = now > entryEnd;

  const handleEnter = async () => {
    if (!selectedSize) {
      setShowSizeSelector(true);
      return;
    }

    setIsEntering(true);
    try {
      const result = await onEnter(raffle.id, selectedSize);
      if (result.success) {
        setLocalEntry({ entered: true, ...result.entry });
        setShowSizeSelector(false);
      }
    } catch (err) {
      console.error('Failed to enter raffle:', err);
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <img 
          src={raffle.productImage || '/images/placeholder-product.jpg'}
          alt={raffle.productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {hasEntered ? (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold uppercase rounded-full">
              ✓ Entered
            </span>
          ) : isUpcoming ? (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase rounded-full">
              Upcoming
            </span>
          ) : isEnded ? (
            <span className="px-3 py-1 bg-neutral-500 text-white text-xs font-bold uppercase rounded-full">
              Ended
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase rounded-full animate-pulse">
              Live
            </span>
          )}
        </div>

        {/* Entry Count */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
          {raffle.currentEntries.toLocaleString()} entries
        </div>

        {/* Loyalty Tier Badge */}
        {localEntry?.tier && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase rounded-full">
            {localEntry.priorityMultiplier}x Priority
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{raffle.title}</h3>
        <p className="text-sm text-neutral-500 mb-3 line-clamp-1">{raffle.productName}</p>

        {/* Price & Timer */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold">
            ${raffle.retailPrice || raffle.productPrice}
          </span>
          {isActive && (
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Ends in</p>
              <Countdown targetDate={raffle.entryEnd} />
            </div>
          )}
          {isUpcoming && (
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Opens in</p>
              <Countdown targetDate={raffle.entryStart} />
            </div>
          )}
        </div>

        {/* Size Selector (shown when entering) */}
        {showSizeSelector && isActive && !hasEntered && (
          <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <p className="text-sm font-medium mb-2">Select your size:</p>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    selectedSize === size
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Entry Status / CTA */}
        {hasEntered ? (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                ✓ You're entered! Size: {localEntry.sizePreference}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Draw date: {formatDate(raffle.drawDate)}
              </p>
            </div>
            {localEntry.status === 'won' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-bold">
                  🎉 WINNER! Check your email for purchase instructions.
                </p>
              </div>
            )}
          </div>
        ) : isActive ? (
          <button
            onClick={handleEnter}
            disabled={isEntering || !isAuthenticated}
            className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              isEntering
                ? 'bg-neutral-300 dark:bg-neutral-700 cursor-wait'
                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100'
            }`}
          >
            {isEntering ? 'Entering...' : showSizeSelector && selectedSize ? 'Confirm Entry' : 'Enter Raffle'}
          </button>
        ) : isUpcoming ? (
          <button
            disabled
            className="w-full py-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm uppercase tracking-wider"
          >
            Opens {formatDate(raffle.entryStart)}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 rounded-lg font-bold text-sm uppercase tracking-wider"
          >
            Raffle Ended
          </button>
        )}

        {!isAuthenticated && isActive && (
          <p className="text-xs text-center text-neutral-500 mt-2">
            <Link to="/login" className="underline">Sign in</Link> to enter
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MY ENTRIES TAB
// ═══════════════════════════════════════════════════════════════════════════

function MyEntries({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎰</div>
        <h3 className="text-xl font-bold mb-2">No Entries Yet</h3>
        <p className="text-neutral-500 mb-6">Enter your first raffle for a chance to win!</p>
        <Link 
          to="#active"
          className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium"
        >
          View Active Raffles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div 
          key={entry.id}
          className={`flex items-center gap-4 p-4 rounded-xl border ${
            entry.status === 'won'
              ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
              : entry.status === 'lost'
              ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 opacity-60'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}
        >
          {/* Product Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
            <img 
              src={entry.productImage || '/images/placeholder-product.jpg'}
              alt={entry.productName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-grow min-w-0">
            <h4 className="font-bold truncate">{entry.raffleTitle}</h4>
            <p className="text-sm text-neutral-500 truncate">{entry.productName}</p>
            <p className="text-xs text-neutral-400 mt-1">
              Size: {entry.sizePreference} • Entered {formatDate(entry.enteredAt)}
            </p>
          </div>

          {/* Status */}
          <div className="text-right flex-shrink-0">
            {entry.status === 'won' ? (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase rounded-full">
                🎉 Won
              </span>
            ) : entry.status === 'lost' ? (
              <span className="px-3 py-1 bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase rounded-full">
                Not Selected
              </span>
            ) : (
              <div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase rounded-full">
                  Pending
                </span>
                <p className="text-xs text-neutral-500 mt-2">
                  Draw: {formatDate(entry.drawDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function RafflesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active');
  const [raffles, setRaffles] = useState([]);
  const [myEntries, setMyEntries] = useState([]);
  const [userEntries, setUserEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch raffles
  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setLoading(true);
        const response = await api.get('/raffles');
        setRaffles(response.data.raffles || []);
      } catch (err) {
        console.error('Failed to fetch raffles:', err);
        setError('Failed to load raffles');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  // Fetch user's entries
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMyEntries = async () => {
      try {
        const response = await api.get('/raffles/user/entries');
        setMyEntries(response.data.entries || []);
        
        // Create lookup for entry status
        const entryLookup = {};
        response.data.entries.forEach(entry => {
          entryLookup[entry.raffleId] = {
            entered: true,
            status: entry.status,
            sizePreference: entry.sizePreference,
            tier: entry.tier,
            priorityMultiplier: entry.priorityMultiplier,
          };
        });
        setUserEntries(entryLookup);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      }
    };

    fetchMyEntries();
  }, [isAuthenticated]);

  // Handle raffle entry
  const handleEnter = async (raffleId, sizePreference) => {
    try {
      const response = await api.post(`/raffles/${raffleId}/enter`, { sizePreference });
      return { success: true, entry: response.data.entry };
    } catch (err) {
      console.error('Failed to enter raffle:', err);
      throw err;
    }
  };

  // Filter raffles
  const activeRaffles = raffles.filter(r => r.isActive);
  const upcomingRaffles = raffles.filter(r => new Date(r.entryStart) > new Date());
  const endedRaffles = raffles.filter(r => new Date(r.entryEnd) < new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 animate-pulse">
            Live Draws
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            RAFFLES
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Enter for a chance to purchase limited releases. Higher loyalty tier = higher chances.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto">
          {[
            { id: 'active', label: 'Active', count: activeRaffles.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingRaffles.length },
            { id: 'ended', label: 'Past', count: endedRaffles.length },
            ...(isAuthenticated ? [{ id: 'my-entries', label: 'My Entries', count: myEntries.length }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-neutral-200 dark:bg-neutral-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {activeTab === 'my-entries' ? (
          <MyEntries entries={myEntries} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'active' ? activeRaffles : 
              activeTab === 'upcoming' ? upcomingRaffles : endedRaffles
            ).map((raffle) => (
              <RaffleCard 
                key={raffle.id}
                raffle={raffle}
                userEntry={userEntries[raffle.id]}
                onEnter={handleEnter}
              />
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'active' && activeRaffles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-bold mb-2">No Active Raffles</h3>
            <p className="text-neutral-500">Check back soon for new drops!</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="bg-neutral-100 dark:bg-neutral-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Enter</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Select your size and enter during the raffle window. One entry per person.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Wait</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Winners are randomly selected. Higher loyalty tiers get better odds.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Win</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Winners receive a purchase link via email. Complete checkout within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
