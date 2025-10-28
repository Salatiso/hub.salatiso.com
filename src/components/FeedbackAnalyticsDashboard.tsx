/**
 * User Feedback & Analytics Dashboard
 * Comprehensive dashboard for monitoring analytics and user feedback
 *
 * Features:
 * - Real-time analytics display
 * - Feedback collection UI
 * - Performance metrics visualization
 * - User satisfaction tracking
 * - Export analytics data
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { analyticsService, UserFeedback } from '../services/analyticsService';
import { MessageCircle, TrendingUp, AlertCircle, Send, Star, Download } from 'lucide-react';

interface FeedbackDashboardProps {
  userId?: string;
  className?: string;
}

export const FeedbackAnalyticsDashboard: React.FC<FeedbackDashboardProps> = ({
  userId,
  className = '',
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'comment' | 'crash'>('comment');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [analytics, setAnalytics] = useState(analyticsService.getAnalyticsSummary());
  const [sessionMetrics, setSessionMetrics] = useState(analyticsService.getSessionMetrics());

  useEffect(() => {
    // Subscribe to metric updates
    const unsubscribeMetrics = analyticsService.onMetric(() => {
      setAnalytics(analyticsService.getAnalyticsSummary());
    });

    return unsubscribeMetrics;
  }, []);

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);
    try {
      analyticsService.submitFeedback(
        feedbackType,
        feedbackMessage,
        feedbackRating || undefined,
        userId
      );

      setFeedbackMessage('');
      setFeedbackRating(0);
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportAnalytics = () => {
    const data = analyticsService.exportAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Events"
          value={analytics.totalEvents}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <AnalyticsCard
          title="Sync Success Rate"
          value={`${analytics.syncSuccessRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <AnalyticsCard
          title="Feedback Submissions"
          value={analytics.totalFeedback}
          icon={<MessageCircle className="w-6 h-6" />}
          color="purple"
        />
        <AnalyticsCard
          title="Performance Metrics"
          value={analytics.totalMetrics}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Session Metrics */}
      {sessionMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Current Session
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <MetricDisplay
              label="Duration"
              value={formatDuration(sessionMetrics.duration)}
            />
            <MetricDisplay
              label="Sync Operations"
              value={sessionMetrics.syncOperations.toString()}
            />
            <MetricDisplay
              label="Data Synced"
              value={formatBytes(sessionMetrics.dataSize)}
            />
          </div>
        </div>
      )}

      {/* Feedback Submission Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Share Your Feedback
        </h2>

        <div className="space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['comment', 'feature', 'bug', 'crash'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFeedbackType(type)}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors capitalize text-sm ${
                    feedbackType === type
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rating (for comments) */}
          {feedbackType === 'comment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFeedbackRating(rating)}
                    className={`text-2xl transition-colors ${
                      feedbackRating >= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={feedbackMessage}
              onChange={e => setFeedbackMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !feedbackMessage.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>

          {submitted && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">
                ✓ Thank you! Your feedback helps us improve.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Events & Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Top Events
          </h3>
          <div className="space-y-2">
            {analytics.topEvents.slice(0, 5).map((event, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="text-gray-700 dark:text-gray-300">{event.event}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {event.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Feedback Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.feedbackByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="capitalize text-gray-700 dark:text-gray-300">{type}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Analytics
        </button>
      </div>
    </div>
  );
};

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
};

interface MetricDisplayProps {
  label: string;
  value: string | number;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value }) => (
  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FeedbackAnalyticsDashboard;
