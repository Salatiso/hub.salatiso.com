/**
 * Guest Auth Status Component
 * Displays guest account status, expiration countdown, renewal options
 * 
 * @module components/GuestAuthStatus
 */

import React, { useState, useEffect } from 'react';
import { guestAccountService, GuestAccountStatus } from '../services/guestAccountService';

interface GuestStatusBadgeProps {
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

interface GuestAccountCardProps {
  onRenew?: () => void;
  onSignOut?: () => void;
  onUpgrade?: () => void;
  showRenewalPrompt?: boolean;
  className?: string;
}

interface GuestExpiryWarningProps {
  status: GuestAccountStatus;
  onRenew: () => void;
  onUpgrade: () => void;
  onDismiss: () => void;
}

/**
 * Compact badge for navbar/header
 */
export const GuestStatusBadge: React.FC<GuestStatusBadgeProps> = ({
  compact = false,
  onClick,
  className = '',
}) => {
  const [status, setStatus] = useState<GuestAccountStatus | null>(null);

  useEffect(() => {
    const status = guestAccountService.getGuestAccountStatus();
    setStatus(status);

    const unsubscribe = guestAccountService.onGuestAccountStatusChange(setStatus);
    return unsubscribe;
  }, []);

  if (!status?.isGuest) return null;

  const getStatusColor = () => {
    if (status.isExpired) return 'bg-red-100 text-red-800 border-red-300';
    if (status.isExpiringSoon) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getStatusIcon = () => {
    if (status.isExpired) return '⏰';
    if (status.isExpiringSoon) return '⚠️';
    return '👤';
  };

  const displayText = compact
    ? `${getStatusIcon()} Guest ${status.daysRemaining}d`
    : `${getStatusIcon()} Guest Account - ${status.daysRemaining} days remaining`;

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg border text-sm font-medium
        transition-all duration-200 hover:shadow-md
        ${getStatusColor()}
        ${className}
      `}
    >
      {displayText}
    </button>
  );
};

/**
 * Full account card with details and actions
 */
export const GuestAccountCard: React.FC<GuestAccountCardProps> = ({
  onRenew,
  onSignOut,
  onUpgrade,
  showRenewalPrompt = false,
  className = '',
}) => {
  const [status, setStatus] = useState<GuestAccountStatus | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    const status = guestAccountService.getGuestAccountStatus();
    setStatus(status);

    const unsubscribe = guestAccountService.onGuestAccountStatusChange(setStatus);
    return unsubscribe;
  }, []);

  if (!status?.isGuest || !status.account) return null;

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      guestAccountService.renewGuestAccount();
      onRenew?.();
    } catch (error) {
      console.error('Error renewing guest account:', error);
    } finally {
      setIsRenewing(false);
    }
  };

  const progressPercentage = Math.max(0, status.percentageRemaining);
  const progressColor =
    status.isExpired || status.daysRemaining <= 0
      ? 'bg-red-500'
      : status.isExpiringSoon
        ? 'bg-amber-500'
        : 'bg-blue-500';

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        p-4 shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">👤</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {status.account.displayName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Guest Account
              {status.account.email && ` • ${status.account.email}`}
            </p>
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm font-medium mb-2">
          {status.isExpired ? (
            <span className="text-red-600 dark:text-red-400">❌ Account Expired</span>
          ) : status.isExpiringSoon ? (
            <span className="text-amber-600 dark:text-amber-400">⚠️ Expiring Soon</span>
          ) : (
            <span className="text-blue-600 dark:text-blue-400">✅ Active</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Days Left</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {status.daysRemaining}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Hours Left</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {status.hoursRemaining}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Renewals</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {status.renewalCount}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-1000 rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
          {progressPercentage.toFixed(0)}% of 7 days remaining
        </p>
      </div>

      {/* Benefits Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✨ Full Features Available
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>✓ Access all dashboard features</li>
          <li>✓ Full learning modules</li>
          <li>✓ All data saved locally</li>
          <li>✓ Renew anytime (free)</li>
        </ul>
      </div>

      {/* Renewal Prompt */}
      {showRenewalPrompt && (status.isExpired || status.isExpiringSoon) && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
            {status.isExpired
              ? '⏰ Your guest account has expired. Renew to continue.'
              : '⏰ Your guest account expires soon.'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRenew}
          disabled={isRenewing}
          className={`
            flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white
            rounded-lg font-medium text-sm transition-colors
            disabled:bg-gray-400 disabled:cursor-not-allowed
          `}
        >
          {isRenewing ? '🔄 Renewing...' : '🔄 Renew (Free)'}
        </button>

        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className={`
              flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white
              rounded-lg font-medium text-sm transition-colors
            `}
          >
            ⬆️ Upgrade
          </button>
        )}

        {onSignOut && (
          <button
            onClick={onSignOut}
            className={`
              px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900
              dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white
              rounded-lg font-medium text-sm transition-colors
            `}
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        Guest • {new Date(status.account.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

/**
 * Expiry warning modal
 */
export const GuestExpiryWarning: React.FC<GuestExpiryWarningProps> = ({
  status,
  onRenew,
  onUpgrade,
  onDismiss,
}) => {
  if (!status.isExpiringSoon && !status.isExpired) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">⏰</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {status.isExpired ? 'Guest Account Expired' : 'Guest Account Expiring Soon'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {status.isExpired
              ? 'Your guest account has expired. Renew to continue using LifeSync.'
              : `Your guest account expires in ${status.daysRemaining} days. Renew now to keep your progress.`}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
              🔄 Renew (Recommended)
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Keep your local account for another 7 days. Free forever!
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="font-medium text-sm text-green-900 dark:text-green-100 mb-1">
              ⬆️ Upgrade to Full Account
            </p>
            <p className="text-xs text-green-800 dark:text-green-200">
              Keep all your data and sync across devices.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRenew}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Renew
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            ⬆️ Upgrade
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="w-full mt-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

/**
 * Main Guest Auth Status Component
 * Combines all sub-components with smart display logic
 */
interface GuestAuthStatusProps {
  onUpgrade?: () => void;
  onSignOut?: () => void;
  compact?: boolean;
  showWarning?: boolean;
}

export const GuestAuthStatus: React.FC<GuestAuthStatusProps> = ({
  onUpgrade,
  onSignOut,
  compact = false,
  showWarning = true,
}) => {
  const [status, setStatus] = useState<GuestAccountStatus | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const status = guestAccountService.getGuestAccountStatus();
    setStatus(status);

    const unsubscribe = guestAccountService.onGuestAccountStatusChange((newStatus) => {
      setStatus(newStatus);
      // Show warning if expiring soon and not dismissed
      if (showWarning && newStatus.isExpiringSoon && !isDismissed) {
        setShowExpiryWarning(true);
      }
    });

    return unsubscribe;
  }, [showWarning, isDismissed]);

  if (!status?.isGuest) return null;

  if (compact) {
    return <GuestStatusBadge compact={true} onClick={() => setShowExpiryWarning(true)} />;
  }

  return (
    <>
      <GuestAccountCard
        onRenew={() => setShowExpiryWarning(false)}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        showRenewalPrompt={showWarning}
      />

      {showExpiryWarning && status && (
        <GuestExpiryWarning
          status={status}
          onRenew={() => {
            guestAccountService.renewGuestAccount();
            setShowExpiryWarning(false);
          }}
          onUpgrade={() => {
            onUpgrade?.();
            setShowExpiryWarning(false);
          }}
          onDismiss={() => {
            setShowExpiryWarning(false);
            setIsDismissed(true);
          }}
        />
      )}
    </>
  );
};

export default GuestAuthStatus;
