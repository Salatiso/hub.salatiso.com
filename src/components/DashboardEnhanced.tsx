import React, { useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  Target,
  Zap,
  Lock,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './DashboardEnhanced.css';

/**
 * Dashboard Enhanced Component
 * 
 * Displays comprehensive profile progress and task completion status:
 * - Profile completion progress ring (0-100%)
 * - Trust score visualization with breakdown
 * - Task completion checklist (0-8 tasks)
 * - Task status indicators (completed/in-progress/not-started)
 * - Quick stats cards
 * - Timeline of completions
 * 
 * @component
 */

interface TaskInfo {
  id: string;
  title: string;
  category: string;
  trustPoints: number;
  isCompleted: boolean;
  isVerified: boolean;
  completedAt?: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

export const DashboardEnhanced: React.FC = () => {
  const { profile } = useLocalProfile();

  // Calculate profile completion metrics
  const metrics = useMemo(() => {
    if (!profile) {
      return {
        completedTasks: 0,
        totalTasks: 8,
        completionPercentage: 0,
        trustScore: 0,
        trustLevel: 'minimal' as const,
        tasksByStatus: {
          completed: [],
          inProgress: [],
          notStarted: [],
        },
      };
    }

    const completedTasks = profile.tasks?.filter(t => t.isCompleted) || [];
    const totalTasks = 8;
    const completionPercentage = Math.round((completedTasks.length / totalTasks) * 100);
    const trustScore = profile.trustScore?.total || 0;

    // Determine trust level
    let trustLevel: 'minimal' | 'basic' | 'verified' | 'trusted' = 'minimal';
    if (trustScore >= 75) trustLevel = 'trusted';
    else if (trustScore >= 50) trustLevel = 'verified';
    else if (trustScore >= 25) trustLevel = 'basic';

    return {
      completedTasks: completedTasks.length,
      totalTasks,
      completionPercentage,
      trustScore,
      trustLevel,
      tasksByStatus: {
        completed: completedTasks,
        inProgress: [],
        notStarted: (profile.tasks || []).filter(t => !t.isCompleted),
      },
    };
  }, [profile]);

  // Generate stat cards
  const statCards: StatCard[] = [
    {
      label: 'Tasks Completed',
      value: `${metrics.completedTasks}/${metrics.totalTasks}`,
      icon: <CheckCircle2 size={24} />,
      color: 'green',
    },
    {
      label: 'Trust Score',
      value: metrics.trustScore,
      icon: <TrendingUp size={24} />,
      color: 'blue',
    },
    {
      label: 'Completion Rate',
      value: `${metrics.completionPercentage}%`,
      icon: <Target size={24} />,
      color: 'purple',
    },
    {
      label: 'Status',
      value: metrics.trustLevel,
      icon: <Award size={24} />,
      color: 'amber',
    },
  ];

  // Task definitions for the checklist
  const taskDefinitions: TaskInfo[] = [
    {
      id: 'contact-info',
      title: 'Contact Information',
      category: 'contact',
      trustPoints: 10,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'contact-info' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'contact-info' && t.isVerified) || false,
    },
    {
      id: 'email-verification',
      title: 'Email Verification',
      category: 'verification',
      trustPoints: 15,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'email-verification' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'email-verification' && t.isVerified) || false,
    },
    {
      id: 'phone-verification',
      title: 'Phone Verification',
      category: 'verification',
      trustPoints: 15,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'phone-verification' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'phone-verification' && t.isVerified) || false,
    },
    {
      id: 'identity-verification',
      title: 'Identity Verification',
      category: 'identity',
      trustPoints: 20,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'identity-verification' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'identity-verification' && t.isVerified) || false,
    },
    {
      id: 'services-registration',
      title: 'Services Registration',
      category: 'services',
      trustPoints: 10,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'services-registration' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'services-registration' && t.isVerified) || false,
    },
    {
      id: 'security-setup',
      title: 'Security Setup',
      category: 'security',
      trustPoints: 15,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'security-setup' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'security-setup' && t.isVerified) || false,
    },
    {
      id: 'account-recovery',
      title: 'Account Recovery',
      category: 'security',
      trustPoints: 10,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'account-recovery' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'account-recovery' && t.isVerified) || false,
    },
    {
      id: 'profile-picture',
      title: 'Profile Picture',
      category: 'contact',
      trustPoints: 5,
      isCompleted: profile?.tasks?.some(t => t.taskId === 'profile-picture' && t.isCompleted) || false,
      isVerified: profile?.tasks?.some(t => t.taskId === 'profile-picture' && t.isVerified) || false,
    },
  ];

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      contact: '#3b82f6',      // blue
      identity: '#f59e0b',      // amber
      services: '#8b5cf6',      // purple
      security: '#ef4444',      // red
      verification: '#10b981',  // green
    };
    return colors[category] || '#6b7280';
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      contact: <AlertCircle size={16} />,
      identity: <Lock size={16} />,
      services: <Zap size={16} />,
      security: <Lock size={16} />,
      verification: <CheckCircle2 size={16} />,
    };
    return icons[category] || null;
  };

  return (
    <div className="dashboard-enhanced">
      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-ring-container">
          <div className="progress-ring">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                className="progress-ring-background"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                className="progress-ring-circle"
                style={{
                  strokeDasharray: `${2 * Math.PI * 90}`,
                  strokeDashoffset: `${2 * Math.PI * 90 - (metrics.completionPercentage / 100) * 2 * Math.PI * 90}`,
                }}
              />
            </svg>
            <div className="progress-ring-content">
              <div className="progress-ring-value">{metrics.completionPercentage}%</div>
              <div className="progress-ring-label">Complete</div>
            </div>
          </div>

          <div className="progress-info">
            <h2>Profile Completion</h2>
            <p className="progress-description">
              {metrics.completionPercentage === 100
                ? 'Your profile is complete! 🎉'
                : `Complete ${metrics.totalTasks - metrics.completedTasks} more ${metrics.totalTasks - metrics.completedTasks === 1 ? 'task' : 'tasks'} to finish your profile`}
            </p>

            {/* Trust Score */}
            <div className="trust-score-display">
              <div className="trust-score-header">
                <span>Trust Score</span>
                <span className={`trust-level trust-level-${metrics.trustLevel}`}>
                  {metrics.trustLevel.charAt(0).toUpperCase() + metrics.trustLevel.slice(1)}
                </span>
              </div>
              <div className="trust-score-bar">
                <div
                  className="trust-score-fill"
                  style={{ width: `${metrics.trustScore}%` }}
                />
              </div>
              <div className="trust-score-value">{metrics.trustScore}/100</div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          {statCards.map((card, idx) => (
            <div key={idx} className={`stat-card stat-card-${card.color}`}>
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-content">
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <h3>Tasks Checklist</h3>
        <p className="tasks-description">
          Complete all tasks to build your profile and increase your trust score
        </p>

        {/* Tasks by Category */}
        <div className="tasks-by-category">
          {/* Contact Tasks */}
          <div className="task-category">
            <div className="category-header" style={{ borderLeftColor: getCategoryColor('contact') }}>
              <span className="category-icon">📋</span>
              <span>Contact Information</span>
            </div>
            <div className="category-tasks">
              {taskDefinitions
                .filter(t => t.category === 'contact')
                .map(task => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <div className="unchecked-box" />
                      )}
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-points">{task.trustPoints} pts</span>
                    </div>
                    {task.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Verification Tasks */}
          <div className="task-category">
            <div className="category-header" style={{ borderLeftColor: getCategoryColor('verification') }}>
              <span className="category-icon">✓</span>
              <span>Verification</span>
            </div>
            <div className="category-tasks">
              {taskDefinitions
                .filter(t => t.category === 'verification')
                .map(task => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <div className="unchecked-box" />
                      )}
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-points">{task.trustPoints} pts</span>
                    </div>
                    {task.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Identity Tasks */}
          <div className="task-category">
            <div className="category-header" style={{ borderLeftColor: getCategoryColor('identity') }}>
              <span className="category-icon">🪪</span>
              <span>Identity</span>
            </div>
            <div className="category-tasks">
              {taskDefinitions
                .filter(t => t.category === 'identity')
                .map(task => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <div className="unchecked-box" />
                      )}
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-points">{task.trustPoints} pts</span>
                    </div>
                    {task.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Security Tasks */}
          <div className="task-category">
            <div className="category-header" style={{ borderLeftColor: getCategoryColor('security') }}>
              <span className="category-icon">🔒</span>
              <span>Security</span>
            </div>
            <div className="category-tasks">
              {taskDefinitions
                .filter(t => t.category === 'security')
                .map(task => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <div className="unchecked-box" />
                      )}
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-points">{task.trustPoints} pts</span>
                    </div>
                    {task.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Services Tasks */}
          <div className="task-category">
            <div className="category-header" style={{ borderLeftColor: getCategoryColor('services') }}>
              <span className="category-icon">⚙️</span>
              <span>Services</span>
            </div>
            <div className="category-tasks">
              {taskDefinitions
                .filter(t => t.category === 'services')
                .map(task => (
                  <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      ) : (
                        <div className="unchecked-box" />
                      )}
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-points">{task.trustPoints} pts</span>
                    </div>
                    {task.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="summary-stat">
          <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="summary-stat-content">
            <span className="summary-stat-label">Completed</span>
            <span className="summary-stat-value">{metrics.completedTasks} tasks</span>
          </div>
        </div>

        <div className="summary-stat">
          <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div className="summary-stat-content">
            <span className="summary-stat-label">Remaining</span>
            <span className="summary-stat-value">{metrics.totalTasks - metrics.completedTasks} tasks</span>
          </div>
        </div>

        <div className="summary-stat">
          <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
            <TrendingUp size={24} style={{ color: '#a855f7' }} />
          </div>
          <div className="summary-stat-content">
            <span className="summary-stat-label">Trust Score</span>
            <span className="summary-stat-value">{metrics.trustScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnhanced;
