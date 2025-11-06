import React from 'react';
import { SubscriptionTier } from '../types';

interface PremiumModalProps {
  currentTier: SubscriptionTier;
  userCoins: number;
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => void;
  onPurchaseCoins: (amount: number) => void;
}

const SUBSCRIPTION_PLANS = [
  {
    tier: SubscriptionTier.Free,
    name: 'Free',
    price: 'Free',
    color: 'from-gray-600 to-gray-700',
    features: [
      'Basic matching',
      'Standard video quality',
      'Text chat',
      'Basic filters',
      '5 skips per hour'
    ]
  },
  {
    tier: SubscriptionTier.Premium,
    name: 'Premium',
    price: '$4.99/month',
    coins: 500,
    color: 'from-blue-600 to-indigo-600',
    popular: true,
    features: [
      'All Free features',
      'HD video quality',
      'Advanced filters (age, interests)',
      'Unlimited skips',
      'No ads',
      'Priority matching',
      'Custom username',
      '500 bonus coins'
    ]
  },
  {
    tier: SubscriptionTier.VIP,
    name: 'VIP',
    price: '$9.99/month',
    coins: 1200,
    color: 'from-purple-600 to-pink-600',
    features: [
      'All Premium features',
      '4K video quality',
      'Profile boost',
      'Exclusive badge',
      'Match with verified users only',
      'Chat history backup',
      'Virtual gifts',
      '1200 bonus coins',
      'Priority support'
    ]
  }
];

const COIN_PACKAGES = [
  { amount: 100, price: '$0.99' },
  { amount: 500, price: '$3.99', bonus: 50 },
  { amount: 1000, price: '$6.99', bonus: 150 },
  { amount: 2500, price: '$14.99', bonus: 500 }
];

export const PremiumModal: React.FC<PremiumModalProps> = ({
  currentTier,
  userCoins,
  onClose,
  onUpgrade,
  onPurchaseCoins
}) => {
  const [activeTab, setActiveTab] = React.useState<'subscription' | 'coins'>('subscription');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade Your Experience</h2>
            <p className="text-purple-100 text-sm">Unlock premium features and coins</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Coin Balance */}
        <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-xl font-bold text-yellow-400">{userCoins}</span>
            <span className="text-gray-400">coins</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'subscription'
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('coins')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'coins'
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Buy Coins
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'subscription' ? (
            <div className="grid md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = currentTier === plan.tier;
                
                return (
                  <div
                    key={plan.tier}
                    className={`relative bg-gray-700/50 rounded-xl p-6 transition-all duration-300 ${
                      plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                    } ${isCurrent ? 'opacity-75' : 'hover:scale-105'}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                        POPULAR
                      </div>
                    )}
                    
                    <div className={`bg-gradient-to-br ${plan.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg mx-auto`}>
                      {plan.tier === SubscriptionTier.Free ? '🆓' : 
                       plan.tier === SubscriptionTier.Premium ? '⭐' : '👑'}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white text-center mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {plan.price}
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => onUpgrade(plan.tier)}
                      disabled={isCurrent}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        isCurrent
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transform active:scale-95`
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.tier === SubscriptionTier.Free ? 'Downgrade' : 'Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Purchase Coins
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Use coins for virtual gifts, profile boosts, and more!
              </p>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className="bg-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform"
                  >
                    {pkg.bonus && (
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-3 text-center">
                        +{pkg.bonus} BONUS
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <span className="text-4xl">🪙</span>
                      <p className="text-3xl font-bold text-yellow-400 mt-2">
                        {pkg.amount}
                        {pkg.bonus && <span className="text-green-400 text-lg">+{pkg.bonus}</span>}
                      </p>
                      <p className="text-gray-400 text-sm">coins</p>
                    </div>
                    
                    <p className="text-2xl font-bold text-center text-white mb-4">
                      {pkg.price}
                    </p>
                    
                    <button
                      onClick={() => onPurchaseCoins(pkg.amount + (pkg.bonus || 0))}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transform active:scale-95 transition-all"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
