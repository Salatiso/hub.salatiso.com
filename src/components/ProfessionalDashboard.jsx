import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  PieChart,
  MessageSquare,
  FileText,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProfessionalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  useTranslation();

  const stats = [
    {
      title: 'Active Connections',
      value: '247',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Business Opportunities',
      value: '18',
      change: '+8%',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Revenue Generated',
      value: '$45,230',
      change: '+23%',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Projects Completed',
      value: '34',
      change: '+15%',
      icon: Briefcase,
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      type: 'connection',
      title: 'New business connection established',
      description: 'Connected with TechCorp Solutions',
      time: '2 hours ago',
      icon: Users
    },
    {
      type: 'project',
      title: 'Project milestone achieved',
      description: 'Completed Phase 1 of Enterprise Integration',
      time: '4 hours ago',
      icon: Target
    },
    {
      type: 'revenue',
      title: 'New contract signed',
      description: '$12,500 consulting agreement',
      time: '1 day ago',
      icon: DollarSign
    },
    {
      type: 'meeting',
      title: 'Meeting scheduled',
      description: 'Client presentation with InnovateLabs',
      time: '2 days ago',
      icon: Calendar
    }
  ];

  const businessTools = [
    {
      name: 'Analytics Dashboard',
      description: 'Track business metrics and performance',
      icon: BarChart3,
      path: '/analytics',
      status: 'Active'
    },
    {
      name: 'Client Management',
      description: 'Manage client relationships and communications',
      icon: Users,
      path: '/client-management',
      status: 'Active'
    },
    {
      name: 'Project Tracker',
      description: 'Monitor project progress and deadlines',
      icon: Briefcase,
      path: '/project-tracker',
      status: 'Active'
    },
    {
      name: 'Financial Overview',
      description: 'Revenue tracking and financial planning',
      icon: DollarSign,
      path: '/financial-overview',
      status: 'Active'
    },
    {
      name: 'Communication Hub',
      description: 'Centralized business communication',
      icon: MessageSquare,
      path: '/communication-hub',
      status: 'Active'
    },
    {
      name: 'Document Center',
      description: 'Secure document storage and sharing',
      icon: FileText,
      path: '/document-center',
      status: 'Active'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'text-green-600 bg-green-100 dark:bg-green-900'
      : 'text-gray-600 bg-gray-100 dark:bg-gray-900';
  };

  const getStatColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
      green: 'text-green-600 bg-green-100 dark:bg-green-900',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Professional Dashboard</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Manage your business, track performance, and grow your professional network
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-8">
          <div className="flex space-x-1">
            {['overview', 'analytics', 'networking', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Tools</h2>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Tool</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTools.map((tool, index) => (
                  <Link
                    key={index}
                    to={tool.path}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                          <tool.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {tool.name}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                            {tool.status}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Overview</h2>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">+23% growth</span>
                </div>
              </div>

              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Performance charts will be displayed here</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Integration with analytics platform pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <activity.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="block w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center font-medium">
                  Schedule Meeting
                </button>
                <button className="block w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium">
                  Send Proposal
                </button>
                <Link
                  to="/universal-trust"
                  className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Access Universal Trust
                </Link>
                <button className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium">
                  Generate Report
                </button>
              </div>
            </div>

            {/* Business Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Business Insights</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Top Performing Service</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Consulting</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Most Active Client</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">TechCorp</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Milestone</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Q4 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
                  <span className="text-sm font-medium text-green-600">+23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
