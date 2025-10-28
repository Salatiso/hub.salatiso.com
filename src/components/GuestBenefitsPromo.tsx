/**
 * Guest Benefits Promo Component
 * Shows benefits of upgrading, feature comparisons, and upgrade incentives
 * 
 * @module components/GuestBenefitsPromo
 */

import React, { useState } from 'react';

interface GuestBenefitsPromoProps {
  onUpgradeClick?: () => void;
  onDismiss?: () => void;
  asModal?: boolean;
  className?: string;
}

interface GuestUpgradePromptProps {
  onUpgrade?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'card' | 'minimal';
  className?: string;
}

/**
 * FAQ Item Component
 */
const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white text-left">
          {question}
        </span>
        <span className={`text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
};

/**
 * Feature Comparison Table
 */
const FeatureComparison: React.FC = () => {
  const features = [
    { name: 'Dashboard Access', guest: '✅', full: '✅' },
    { name: 'Learning Modules', guest: '✅', full: '✅' },
    { name: 'Progress Tracking', guest: '✅', full: '✅' },
    { name: 'Local Data Storage', guest: '7 days', full: 'Unlimited' },
    { name: 'Cloud Backup', guest: '❌', full: '✅' },
    { name: 'Multi-Device Sync', guest: '❌', full: '✅' },
    { name: 'Family Features', guest: '❌', full: '✅' },
    { name: 'Advanced Analytics', guest: '❌', full: '✅' },
    { name: 'Offline Mode', guest: '✅', full: '✅' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600">
            <th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-white">
              Feature
            </th>
            <th className="text-center py-3 px-3 font-semibold text-blue-600 dark:text-blue-400">
              Guest
            </th>
            <th className="text-center py-3 px-3 font-semibold text-green-600 dark:text-green-400">
              Full Account
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="py-3 px-3 text-gray-900 dark:text-white">{feature.name}</td>
              <td className="py-3 px-3 text-center text-gray-700 dark:text-gray-300">
                {feature.guest}
              </td>
              <td className="py-3 px-3 text-center text-gray-700 dark:text-gray-300">
                {feature.full}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main Guest Benefits Promo Component
 */
export const GuestBenefitsPromo: React.FC<GuestBenefitsPromoProps> = ({
  onUpgradeClick,
  onDismiss,
  asModal = false,
  className = '',
}) => {
  const content = (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade Your Experience
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Keep your guest account local forever, or upgrade to sync across devices and unlock
          premium features.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          {
            icon: '☁️',
            title: 'Cloud Backup',
            desc: 'All your data safely backed up in the cloud',
          },
          {
            icon: '🔄',
            title: 'Multi-Device Sync',
            desc: 'Access your account on any device, anytime',
          },
          {
            icon: '👨‍👩‍👧‍👦',
            title: 'Family Features',
            desc: 'Connect with family members and see their progress',
          },
          {
            icon: '📊',
            title: 'Advanced Analytics',
            desc: 'Detailed insights into your learning journey',
          },
          {
            icon: '🔒',
            title: 'Enhanced Security',
            desc: 'Password protection and account recovery options',
          },
          {
            icon: '⭐',
            title: 'Priority Support',
            desc: 'Get help from our support team when you need it',
          },
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="text-3xl mb-2">{benefit.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {benefit.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
          ✨ How It Works
        </h2>
        <ol className="space-y-3">
          {[
            'Your guest data is saved locally for 7 days',
            'Renew anytime to keep using locally (free forever)',
            'Upgrade anytime - all data transfers automatically',
            'No need to re-enter any information',
            'Full features unlock immediately',
          ].map((step, idx) => (
            <li key={idx} className="flex gap-3 text-blue-900 dark:text-blue-100">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Feature Comparison */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📋 Feature Comparison
        </h2>
        <FeatureComparison />
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          <FAQItem
            question="Will I lose my data if I upgrade?"
            answer="No! All your guest data is automatically transferred to your full account. Nothing is lost."
          />
          <FAQItem
            question="Can I keep using my guest account?"
            answer="Absolutely! You can renew your guest account forever. Upgrading is completely optional."
          />
          <FAQItem
            question="What happens after 7 days if I don't renew?"
            answer="Your account will be marked as expired, but you can still renew it anytime to continue. No data is deleted."
          />
          <FAQItem
            question="Do I need to upgrade to use all features?"
            answer="No! Guest accounts have full access to all dashboard features. Upgrading adds cloud sync and family features."
          />
          <FAQItem
            question="Can I export my guest data?"
            answer="Yes! You can export all your guest data as JSON before upgrading."
          />
          <FAQItem
            question="Is there a cost to upgrade?"
            answer="We'll offer flexible pricing options. You can choose what works for you."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button
          onClick={onUpgradeClick}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ⬆️ Upgrade Now
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            Maybe Later
          </button>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        💡 Keep your guest account local forever. There's no rush to upgrade.
      </p>
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 ${className}`}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg ${className}`}>
      {content}
    </div>
  );
};

/**
 * Inline upgrade prompt/banner
 */
export const GuestUpgradePrompt: React.FC<GuestUpgradePromptProps> = ({
  onUpgrade,
  onDismiss,
  variant = 'banner',
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg ${className}`}>
        <span className="text-xl">✨</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Ready to unlock more features?
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Upgrade to full account to sync across devices
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onUpgrade}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition-colors"
          >
            Upgrade
          </button>
          <button
            onClick={handleDismiss}
            className="px-2 py-1 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">🚀</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
              Ready to Level Up?
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mb-4">
              Your data is ready to sync across devices. Upgrade now to keep everything
              synchronized and unlock premium features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                ⬆️ Upgrade Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 text-green-900 dark:text-green-100 font-medium rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default banner variant
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">✨ Upgrade Your Account</h3>
          <p className="text-sm text-blue-100">
            Sync across devices, backup your data, and unlock premium features. Your guest data
            transfers automatically.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors"
          >
            Upgrade
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestBenefitsPromo;
