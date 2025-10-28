/**
 * Analytics & Performance Monitoring Service
 * Tracks offline mode usage, performance metrics, and user feedback
 *
 * Features:
 * - Offline usage analytics
 * - Performance metrics tracking
 * - User feedback collection
 * - Real-time performance monitoring
 * - Data aggregation and reporting
 *
 * @module services/analyticsService
 */

export interface AnalyticsEvent {
  id: string;                              // Event ID
  event: string;                           // Event name
  timestamp: number;                       // When it occurred
  userId?: string;                         // User ID
  deviceId: string;                        // Device identifier
  data?: Record<string, any>;              // Event data
  sessionId: string;                       // Session ID
}

export interface PerformanceMetric {
  id: string;                              // Metric ID
  metric: string;                          // Metric name
  value: number;                           // Value
  unit: string;                            // Unit (ms, KB, %, etc.)
  timestamp: number;                       // When measured
  context?: Record<string, any>;           // Context data
}

export interface UserFeedback {
  id: string;                              // Feedback ID
  userId?: string;                         // User ID
  type: 'bug' | 'feature' | 'comment' | 'crash'; // Feedback type
  message: string;                         // Feedback message
  rating?: number;                         // 1-5 rating
  timestamp: number;                       // When submitted
  metadata?: Record<string, any>;          // Device/context info
  url?: string;                            // Current URL
}

export interface SessionMetrics {
  sessionId: string;                       // Session ID
  userId?: string;                         // User ID
  startTime: number;                       // Session start
  endTime?: number;                        // Session end
  duration: number;                        // Duration in ms
  offlineDuration: number;                 // Time offline (ms)
  onlineDuration: number;                  // Time online (ms)
  syncOperations: number;                  // Sync ops performed
  syncErrors: number;                      // Sync failures
  dataSize: number;                        // Data synced (bytes)
  offline: boolean;                        // Is currently offline
  events: string[];                        // Event names during session
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private feedback: UserFeedback[] = [];
  private currentSession: SessionMetrics | null = null;
  private sessionId: string = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private deviceId: string = this.getOrCreateDeviceId();
  private metricsListeners: Set<(metric: PerformanceMetric) => void> = new Set();
  private feedbackListeners: Set<(feedback: UserFeedback) => void> = new Set();

  private constructor() {
    // Initialize session
    this.startSession();
    // Load existing data from storage
    this.loadFromStorage();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get or create device ID
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('analytics_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Start a new session
   */
  private startSession(): void {
    this.currentSession = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      duration: 0,
      offlineDuration: 0,
      onlineDuration: 0,
      syncOperations: 0,
      syncErrors: 0,
      dataSize: 0,
      offline: !navigator.onLine,
      events: [],
    };
  }

  /**
   * Track analytics event
   */
  trackEvent(
    event: string,
    data?: Record<string, any>,
    userId?: string
  ): AnalyticsEvent {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: Date.now(),
      userId,
      deviceId: this.deviceId,
      data,
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);

    // Track in current session
    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    // Save to storage (keep last 1000 events)
    if (this.events.length > 1000) {
      this.events.shift();
    }
    this.saveToStorage();

    return analyticsEvent;
  }

  /**
   * Record performance metric
   */
  recordMetric(
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>
  ): PerformanceMetric {
    const performanceMetric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metric,
      value,
      unit,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(performanceMetric);
    this.notifyMetricListeners(performanceMetric);

    // Keep last 500 metrics
    if (this.metrics.length > 500) {
      this.metrics.shift();
    }

    this.saveToStorage();

    return performanceMetric;
  }

  /**
   * Track offline/online transition
   */
  trackNetworkChange(isOnline: boolean): void {
    if (this.currentSession) {
      this.currentSession.offline = !isOnline;
    }

    this.trackEvent('network_change', {
      isOnline,
      timestamp: Date.now(),
    });
  }

  /**
   * Track sync operation
   */
  trackSyncOperation(
    success: boolean,
    operationCount: number,
    dataSize: number,
    duration: number,
    errorMessage?: string
  ): void {
    if (this.currentSession) {
      this.currentSession.syncOperations += operationCount;
      if (!success) {
        this.currentSession.syncErrors += 1;
      }
      this.currentSession.dataSize += dataSize;
    }

    this.recordMetric('sync_duration', duration, 'ms', {
      success,
      operationCount,
      dataSize,
      errorMessage,
    });

    this.trackEvent('sync_operation', {
      success,
      operationCount,
      dataSize,
      duration,
      errorMessage,
    });
  }

  /**
   * Submit user feedback
   */
  submitFeedback(
    type: 'bug' | 'feature' | 'comment' | 'crash',
    message: string,
    rating?: number,
    userId?: string
  ): UserFeedback {
    const fb: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      message,
      rating,
      timestamp: Date.now(),
      metadata: {
        deviceId: this.deviceId,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      url: window.location.href,
    };

    this.feedback.push(fb);
    this.notifyFeedbackListeners(fb);

    // Keep last 500 feedback items
    if (this.feedback.length > 500) {
      this.feedback.shift();
    }

    this.saveToStorage();

    return fb;
  }

  /**
   * Get session metrics
   */
  getSessionMetrics(): SessionMetrics | null {
    if (!this.currentSession) return null;

    return {
      ...this.currentSession,
      duration: Date.now() - this.currentSession.startTime,
      endTime: undefined, // Still in session
    };
  }

  /**
   * End current session and get metrics
   */
  endSession(): SessionMetrics | null {
    if (!this.currentSession) return null;

    const session: SessionMetrics = {
      ...this.currentSession,
      duration: Date.now() - this.currentSession.startTime,
      endTime: Date.now(),
    };

    this.saveToStorage();

    return session;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(timeWindow?: { start: number; end: number }): {
    totalEvents: number;
    totalMetrics: number;
    totalFeedback: number;
    averageSessionDuration: number;
    syncSuccessRate: number;
    topEvents: Array<{ event: string; count: number }>;
    averageMetrics: Record<string, { avg: number; min: number; max: number; unit: string }>;
    feedbackByType: Record<string, number>;
  } {
    const events = timeWindow
      ? this.events.filter(e => e.timestamp >= timeWindow.start && e.timestamp <= timeWindow.end)
      : this.events;

    const metrics = timeWindow
      ? this.metrics.filter(m => m.timestamp >= timeWindow.start && m.timestamp <= timeWindow.end)
      : this.metrics;

    const feedback = timeWindow
      ? this.feedback.filter(f => f.timestamp >= timeWindow.start && f.timestamp <= timeWindow.end)
      : this.feedback;

    // Count events
    const eventCounts: Record<string, number> = {};
    events.forEach(e => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate metric stats
    const metricStats: Record<string, { values: number[]; unit: string }> = {};
    metrics.forEach(m => {
      if (!metricStats[m.metric]) {
        metricStats[m.metric] = { values: [], unit: m.unit };
      }
      metricStats[m.metric].values.push(m.value);
    });

    const averageMetrics: Record<string, { avg: number; min: number; max: number; unit: string }> = {};
    for (const [metric, data] of Object.entries(metricStats)) {
      const values = data.values;
      averageMetrics[metric] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        unit: data.unit,
      };
    }

    // Sync success rate
    const syncEvents = events.filter(e => e.event === 'sync_operation');
    const successfulSyncs = syncEvents.filter(e => e.data?.success).length;
    const syncSuccessRate = syncEvents.length > 0 ? (successfulSyncs / syncEvents.length) * 100 : 0;

    // Feedback by type
    const feedbackByType: Record<string, number> = {};
    feedback.forEach(f => {
      feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      totalMetrics: metrics.length,
      totalFeedback: feedback.length,
      averageSessionDuration: 0, // Would require session history
      syncSuccessRate,
      topEvents,
      averageMetrics,
      feedbackByType,
    };
  }

  /**
   * Subscribe to metric updates
   */
  onMetric(listener: (metric: PerformanceMetric) => void): () => void {
    this.metricsListeners.add(listener);
    return () => {
      this.metricsListeners.delete(listener);
    };
  }

  /**
   * Subscribe to feedback submissions
   */
  onFeedback(listener: (feedback: UserFeedback) => void): () => void {
    this.feedbackListeners.add(listener);
    return () => {
      this.feedbackListeners.delete(listener);
    };
  }

  /**
   * Notify metric listeners
   */
  private notifyMetricListeners(metric: PerformanceMetric): void {
    this.metricsListeners.forEach(listener => {
      try {
        listener(metric);
      } catch (error) {
        console.error('Error in metric listener:', error);
      }
    });
  }

  /**
   * Notify feedback listeners
   */
  private notifyFeedbackListeners(feedback: UserFeedback): void {
    this.feedbackListeners.forEach(listener => {
      try {
        listener(feedback);
      } catch (error) {
        console.error('Error in feedback listener:', error);
      }
    });
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100)));
      localStorage.setItem('analytics_metrics', JSON.stringify(this.metrics.slice(-100)));
      localStorage.setItem('analytics_feedback', JSON.stringify(this.feedback.slice(-100)));
    } catch (error) {
      console.error('Error saving analytics to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const events = localStorage.getItem('analytics_events');
      const metrics = localStorage.getItem('analytics_metrics');
      const feedback = localStorage.getItem('analytics_feedback');

      if (events) this.events = JSON.parse(events);
      if (metrics) this.metrics = JSON.parse(metrics);
      if (feedback) this.feedback = JSON.parse(feedback);
    } catch (error) {
      console.error('Error loading analytics from storage:', error);
    }
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): {
    events: AnalyticsEvent[];
    metrics: PerformanceMetric[];
    feedback: UserFeedback[];
    summary: {
      totalEvents: number;
      totalMetrics: number;
      totalFeedback: number;
      averageSessionDuration: number;
      syncSuccessRate: number;
      topEvents: Array<{ event: string; count: number }>;
      averageMetrics: Record<string, { avg: number; min: number; max: number; unit: string }>;
      feedbackByType: Record<string, number>;
    };
  } {
    return {
      events: this.events,
      metrics: this.metrics,
      feedback: this.feedback,
      summary: this.getAnalyticsSummary(),
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
export default AnalyticsService;
