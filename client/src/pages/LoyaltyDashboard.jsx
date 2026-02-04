/**
 * LoyaltyDashboard - User's loyalty program hub
 * 
 * Displays:
 * - Current tier and progress
 * - Points balance
 * - Available rewards
 * - Transaction history
 * - Tier benefits comparison
 * 
 * Kith-inspired design with HYOW styling
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Star,
  Gift,
  Zap,
  ChevronRight,
  Loader2,
  Check,
  Lock,
  Clock,
  ShoppingBag,
  Sparkles,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

// ═══════════════════════════════════════════════════════════════════════════
// TIER STYLING
// ═══════════════════════════════════════════════════════════════════════════

const TIER_STYLES = {
  STARTER: {
    gradient: 'from-gray-600 to-gray-800',
    accent: 'text-gray-400',
    badge: 'bg-gray-700',
    icon: Star,
  },
  ELEVATED: {
    gradient: 'from-amber-600 to-amber-800',
    accent: 'text-amber-400',
    badge: 'bg-amber-700',
    icon: Zap,
  },
  ELITE: {
    gradient: 'from-violet-600 to-purple-800',
    accent: 'text-violet-400',
    badge: 'bg-violet-700',
    icon: Crown,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rewards' | 'history'
  const [isRedeeming, setIsRedeeming] = useState(null);

  const showSuccess = useNotificationStore((state) => state.showSuccess);
  const showError = useNotificationStore((state) => state.showError);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    fetchLoyaltyData();
    fetchRewards();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch('/api/loyalty/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hyow-token')}`,
        },
      });
      const data = await response.json();
      setLoyaltyData(data);
    } catch (err) {
      console.error('Failed to fetch loyalty data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hyow-token')}`,
        },
      });
      const data = await response.json();
      setRewards(data.rewards);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REDEEM REWARD
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRedeemReward = async (reward) => {
    if (!reward.canRedeem) return;

    setIsRedeeming(reward.id);

    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hyow-token')}`,
        },
        body: JSON.stringify({
          rewardId: reward.id,
          points: reward.pointsCost,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(`Reward redeemed! Code: ${data.rewardCode}`);
        fetchLoyaltyData(); // Refresh data
        fetchRewards();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showError(err.message || 'Failed to redeem reward');
    } finally {
      setIsRedeeming(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-street-400 mb-4" />
            <p className="text-street-500">Loading your rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="text-center py-20">
            <Gift className="w-16 h-16 text-street-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl tracking-wider mb-2">Join HYOW Rewards</h2>
            <p className="text-street-500 mb-6">
              Sign in to start earning points and unlock exclusive perks.
            </p>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { account, tierInfo } = loyaltyData;
  const tierStyle = TIER_STYLES[account.tier];
  const TierIcon = tierStyle.icon;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="section">
      <div className="container-custom">
        {/* Header Card */}
        <div className={`bg-gradient-to-br ${tierStyle.gradient} rounded-2xl p-8 text-white mb-8 relative overflow-hidden`}>
          {/* Background texture */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${tierStyle.badge} px-3 py-1 rounded-full text-xs font-bold tracking-wider`}>
                    {account.tierName.toUpperCase()} MEMBER
                  </span>
                </div>
                <h1 className="font-display text-4xl tracking-wider">
                  HYOW Rewards
                </h1>
              </div>
              <TierIcon className="w-16 h-16 opacity-50" />
            </div>

            {/* Points Balance */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-white/70 text-sm mb-1">Available Points</p>
                <p className="font-display text-5xl tracking-wider">
                  {account.pointsBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Lifetime Points</p>
                <p className="font-display text-3xl tracking-wider text-white/80">
                  {account.lifetimePoints.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {tierInfo.next && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">
                    {tierInfo.pointsToNextTier.toLocaleString()} points to {tierInfo.next.name}
                  </span>
                  <span className="font-semibold">{tierInfo.progressPercent}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${tierInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-street-200">
          {[
            { id: 'overview', label: 'Overview', icon: Star },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-street-900 text-street-900'
                  : 'border-transparent text-street-500 hover:text-street-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div className="bg-white border border-street-200 rounded-xl p-6">
              <h2 className="font-display text-xl tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Benefits
              </h2>
              <ul className="space-y-3">
                {tierInfo.current.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-street-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Link
                to="/products"
                className="flex items-center justify-between p-4 bg-white border border-street-200 rounded-xl hover:border-street-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-street-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Shop & Earn</p>
                    <p className="text-sm text-street-500">2 points per $1 spent</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-street-400" />
              </Link>

              <button
                onClick={() => setActiveTab('rewards')}
                className="w-full flex items-center justify-between p-4 bg-white border border-street-200 rounded-xl hover:border-street-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-street-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Redeem Rewards</p>
                    <p className="text-sm text-street-500">
                      {rewards.filter(r => r.canRedeem).length} rewards available
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-street-400" />
              </button>

              {tierInfo.next && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">
                        Unlock {tierInfo.next.name} Status
                      </p>
                      <p className="text-sm text-amber-700">
                        Earn {tierInfo.pointsToNextTier.toLocaleString()} more points
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  reward.tierLocked 
                    ? 'border-street-200 opacity-60' 
                    : reward.canRedeem
                      ? 'border-street-300 hover:border-street-400 hover:shadow-md'
                      : 'border-street-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-street-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6" />
                    </div>
                    {reward.tierLocked && (
                      <span className="flex items-center gap-1 text-xs bg-street-100 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        {reward.minTier}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg tracking-wider mb-1">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-street-500 mb-4">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{reward.pointsCost.toLocaleString()}</span>
                      <span className="text-street-500 text-sm">points</span>
                    </div>

                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!reward.canRedeem || isRedeeming === reward.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reward.canRedeem
                          ? 'bg-street-900 text-white hover:bg-street-800'
                          : 'bg-street-100 text-street-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming === reward.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : reward.canRedeem ? (
                        'Redeem'
                      ) : reward.tierLocked ? (
                        'Locked'
                      ) : (
                        `Need ${reward.pointsNeeded}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-street-200 rounded-xl overflow-hidden">
            {loyaltyData.recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-street-300 mx-auto mb-3" />
                <p className="text-street-500">No transactions yet</p>
                <p className="text-sm text-street-400">
                  Start shopping to earn points!
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-street-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-street-600">Date</th>
                    <th className="text-left p-4 font-medium text-street-600">Description</th>
                    <th className="text-right p-4 font-medium text-street-600">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-street-100">
                  {loyaltyData.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-street-50">
                      <td className="p-4 text-sm text-street-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">{tx.description}</td>
                      <td className={`p-4 text-right font-semibold ${
                        tx.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tier Comparison */}
        <div className="mt-12">
          <h2 className="font-display text-2xl tracking-wider mb-6 text-center">
            Membership Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(TIER_STYLES).map(([tier, style]) => {
              const isCurrentTier = account.tier === tier;
              const Icon = style.icon;
              
              return (
                <div
                  key={tier}
                  className={`rounded-xl p-6 ${
                    isCurrentTier
                      ? `bg-gradient-to-br ${style.gradient} text-white`
                      : 'bg-white border border-street-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${isCurrentTier ? 'text-white' : style.accent}`} />
                    <div>
                      <h3 className="font-display text-xl tracking-wider">
                        {tier.charAt(0) + tier.slice(1).toLowerCase()}
                      </h3>
                      {isCurrentTier && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-4 ${isCurrentTier ? 'text-white/80' : 'text-street-500'}`}>
                    {tier === 'STARTER' && '0 - 999 points'}
                    {tier === 'ELEVATED' && '1,000 - 4,999 points'}
                    {tier === 'ELITE' && '5,000+ points'}
                  </p>

                  <ul className={`space-y-2 text-sm ${isCurrentTier ? 'text-white/90' : 'text-street-600'}`}>
                    {tier === 'STARTER' && (
                      <>
                        <li>• Welcome gift</li>
                        <li>• Birthday reward</li>
                        <li>• Member sales access</li>
                      </>
                    )}
                    {tier === 'ELEVATED' && (
                      <>
                        <li>• 24h early drop access</li>
                        <li>• Free shipping $100+</li>
                        <li>• Exclusive colorways</li>
                      </>
                    )}
                    {tier === 'ELITE' && (
                      <>
                        <li>• 48h early drop access</li>
                        <li>• Free shipping always</li>
                        <li>• VIP events</li>
                        <li>• Personal styling</li>
                      </>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyDashboard;
