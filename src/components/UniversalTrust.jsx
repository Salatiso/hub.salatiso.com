import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, Globe, CheckCircle, Star, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UniversalTrust = () => {
  const [activeStep, setActiveStep] = useState(0);
  useTranslation();

  const steps = [
    {
      title: 'Cross-Platform Verification',
      description: 'Connect and verify trust across multiple Salatiso ecosystem applications',
      icon: Globe,
      features: [
        'Unified trust profile across all platforms',
        'Seamless credential sharing',
        'Blockchain-inspired verification',
        'Real-time trust synchronization'
      ]
    },
    {
      title: 'Trust Layer Integration',
      description: 'Advanced trust algorithms and risk assessment across services',
      icon: Shield,
      features: [
        'Multi-factor trust scoring',
        'Behavioral analysis',
        'Community validation',
        'Temporal trust decay management'
      ]
    },
    {
      title: 'Universal Access',
      description: 'Access verified services and connections anywhere in the ecosystem',
      icon: Users,
      features: [
        'Cross-service compatibility',
        'Unified communication channels',
        'Shared safety protocols',
        'Integrated emergency response'
      ]
    }
  ];

  const ecosystemApps = [
    { name: 'SafetyHelp', url: 'https://safetyhelp-lifecv.web.app', description: 'Emergency response coordination' },
    { name: 'LegalHelp', url: 'https://legalhelp-lifecv.web.app', description: 'Legal assistance services' },
    { name: 'FinHelp', url: 'https://finhelp-lifecv.web.app', description: 'Financial services' },
    { name: 'DocHelp', url: 'https://dochelp-lifecv.web.app', description: 'Document services' },
    { name: 'Ekhaya', url: 'https://ekhaya-lifecv.web.app', description: 'Location-based services' },
    { name: 'BizHelp', url: 'https://bizhelp-lifecv.web.app', description: 'Business assistance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Zap className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Universal Trust</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Cross-platform trust verification across the entire Salatiso ecosystem
              </p>
            </div>
          </div>
        </div>

        {/* Trust Level Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Universal Trust Level</h2>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Level 3 - Maximum Trust</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            85% of maximum universal trust achieved across 12 ecosystem applications
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                activeStep === index ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${activeStep === index ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <step.icon className={`h-6 w-6 ${activeStep === index ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <div className={`text-sm ${activeStep === index ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    Step {index + 1} of {steps.length}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
              <ul className="space-y-2">
                {step.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ecosystem Integration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Ecosystem Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemApps.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {app.name}
                  </h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">Trust Verified</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trust Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Cross-Platform Compatibility</span>
                <span className="font-semibold text-green-600">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Real-time Synchronization</span>
                <span className="font-semibold text-green-600">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Security Compliance</span>
                <span className="font-semibold text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">User Satisfaction</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/instant-trust"
                className="block w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
              >
                Start Instant Trust Verification
              </Link>
              <button className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium">
                Sync Trust Across Platforms
              </button>
              <button className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium">
                View Trust Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalTrust;
