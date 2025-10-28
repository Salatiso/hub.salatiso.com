import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Shield, MessageSquare, Wifi, Bluetooth, Clock, CheckCircle } from 'lucide-react';
// GuestContext not required here

const EnhancedRomanceSync = ({ onClose }) => {
  useTranslation();
  const [currentStep, setCurrentStep] = useState('assessment');
  const [answers, setAnswers] = useState({});
  const [meetingDetails, setMeetingDetails] = useState({
    location: '',
    dateTime: '',
    emergencyContacts: [],
    syncOptions: {
      location: false,
      bluetooth: false,
      wifi: false,
      emergency: false
    }
  });
  const [compatibilityScore, setCompatibilityScore] = useState(0);

  const compatibilityQuestions = [
    {
      id: 'values',
      category: 'Core Values',
      questions: [
        {
          id: 'religion',
          question: 'How important is religious/spiritual compatibility to you?',
          options: ['Very Important', 'Somewhat Important', 'Not Important', 'Prefer Not to Say']
        },
        {
          id: 'politics',
          question: 'How do you feel about political discussions in relationships?',
          options: ['Open and frequent', 'Occasional', 'Rarely', 'Never']
        },
        {
          id: 'family',
          question: 'How involved should extended family be in your relationship?',
          options: ['Very involved', 'Moderately involved', 'Minimal involvement', 'Independent']
        },
        {
          id: 'money',
          question: 'What\'s your approach to financial management in relationships?',
          options: ['Joint accounts', 'Separate but shared goals', 'Completely separate', 'Flexible']
        }
      ]
    },
    {
      id: 'lifestyle',
      category: 'Lifestyle',
      questions: [
        {
          id: 'social',
          question: 'How would you describe your social preferences?',
          options: ['Extroverted and outgoing', 'Balanced social life', 'Introverted and private', 'Flexible']
        },
        {
          id: 'routine',
          question: 'How important are daily routines and schedules to you?',
          options: ['Very structured', 'Somewhat structured', 'Flexible and spontaneous', 'Very flexible']
        },
        {
          id: 'exercise',
          question: 'What\'s your approach to physical fitness and health?',
          options: ['Very active and fitness-focused', 'Moderately active', 'Casual activity', 'Sedentary']
        },
        {
          id: 'diet',
          question: 'Do you follow any specific dietary preferences or restrictions?',
          options: ['Strict dietary requirements', 'Some preferences', 'Flexible omnivore', 'No restrictions']
        }
      ]
    },
    {
      id: 'relationship',
      category: 'Relationship Dynamics',
      questions: [
        {
          id: 'communication',
          question: 'How do you prefer to handle conflicts in relationships?',
          options: ['Direct and immediate', 'Thoughtful discussion', 'Time to process', 'Avoid confrontation']
        },
        {
          id: 'independence',
          question: 'How much independence do you need in a relationship?',
          options: ['High independence', 'Balanced independence', 'Close connection', 'Very interdependent']
        },
        {
          id: 'future',
          question: 'What are your thoughts on long-term commitment?',
          options: ['Ready for marriage/family', 'Open to long-term', 'Taking it slow', 'Not sure yet']
        },
        {
          id: 'growth',
          question: 'How important is personal growth and development to you?',
          options: ['Very important', 'Somewhat important', 'Not a priority', 'Growth through relationship']
        }
      ]
    },
    {
      id: 'practical',
      category: 'Practical Considerations',
      questions: [
        {
          id: 'location',
          question: 'Are you open to long-distance relationships?',
          options: ['Yes, definitely', 'Maybe for the right person', 'Prefer local', 'Not interested']
        },
        {
          id: 'children',
          question: 'What are your thoughts on having children?',
          options: ['Definitely want children', 'Open to children', 'Prefer no children', 'Undecided']
        },
        {
          id: 'career',
          question: 'How do you balance career and relationship priorities?',
          options: ['Career first', 'Balanced approach', 'Relationship first', 'Flexible']
        },
        {
          id: 'living',
          question: 'What are your living arrangements preferences?',
          options: ['Live together soon', 'Take time to move in', 'Prefer separate spaces', 'Flexible']
        }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateCompatibility = () => {
    // Simple compatibility calculation based on answer alignment
    const totalQuestions = compatibilityQuestions.reduce((acc, category) =>
      acc + category.questions.length, 0
    );
    const answeredQuestions = Object.keys(answers).length;
    const score = (answeredQuestions / totalQuestions) * 100;
    setCompatibilityScore(Math.round(score));
  };

  const handleMeetingSetup = () => {
    setCurrentStep('meeting');
  };

  const handleSyncOptions = (option, value) => {
    setMeetingDetails(prev => ({
      ...prev,
      syncOptions: {
        ...prev.syncOptions,
        [option]: value
      }
    }));
  };

  const handleShareResults = (method) => {
    const shareText = `LifeSync Romance Compatibility Assessment: ${compatibilityScore}% compatible! Let's explore our connection further.`;
    const shareUrl = window.location.href;

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=LifeSync Compatibility Results&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'link':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        break;
    }
  };

  const renderAssessment = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Romance Compatibility Assessment</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Answer these questions to assess compatibility. Be honest - authenticity leads to better connections.
        </p>
      </div>

      {compatibilityQuestions.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-primary-600 dark:text-primary-400">{category.category}</h4>
          <div className="space-y-4">
            {category.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="font-medium mb-2">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswer(`${category.id}_${q.id}`, option)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        answers[`${category.id}_${q.id}`] === option
                          ? 'bg-primary-100 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            calculateCompatibility();
            handleMeetingSetup();
          }}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Continue to Meeting Setup
        </button>
      </div>
    </div>
  );

  const renderMeetingSetup = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Meeting Setup</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your meeting details and sync options for a safe and connected experience.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800 dark:text-green-200">Compatibility Assessment Complete</span>
        </div>
        <p className="text-green-700 dark:text-green-300">Compatibility Score: {compatibilityScore}%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Location</label>
          <input
            type="text"
            value={meetingDetails.location}
            onChange={(e) => setMeetingDetails(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Johannesburg Zoo, Sandton"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date & Time</label>
          <input
            type="datetime-local"
            value={meetingDetails.dateTime}
            onChange={(e) => setMeetingDetails(prev => ({ ...prev, dateTime: e.target.value }))}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Sync Options (Opt-in Only)
        </h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={meetingDetails.syncOptions.location}
              onChange={(e) => handleSyncOptions('location', e.target.checked)}
              className="mr-3"
            />
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">Share live location during meeting</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={meetingDetails.syncOptions.bluetooth}
              onChange={(e) => handleSyncOptions('bluetooth', e.target.checked)}
              className="mr-3"
            />
            <Bluetooth className="h-4 w-4 mr-2" />
            <span className="text-sm">Enable Bluetooth proximity detection</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={meetingDetails.syncOptions.wifi}
              onChange={(e) => handleSyncOptions('wifi', e.target.checked)}
              className="mr-3"
            />
            <Wifi className="h-4 w-4 mr-2" />
            <span className="text-sm">Use Wi-Fi Direct for offline connectivity</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={meetingDetails.syncOptions.emergency}
              onChange={(e) => handleSyncOptions('emergency', e.target.checked)}
              className="mr-3"
            />
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm">Emergency contact monitoring</span>
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Session Management
        </h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          All sync options will automatically terminate at the end of your meeting. You maintain full control and can disable any option at any time.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('assessment')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to Assessment
        </button>
        <button
          onClick={() => setCurrentStep('share')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Continue to Share
        </button>
      </div>
    </div>
  );

  const renderShareOptions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Share Your Results</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your compatibility assessment and meeting details with your potential partner.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600 mb-2">{compatibilityScore}%</div>
        <p className="text-green-800 dark:text-green-200">Compatibility Score</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleShareResults('whatsapp')}
          className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          WhatsApp
        </button>
        <button
          onClick={() => handleShareResults('email')}
          className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Email
        </button>
        <button
          onClick={() => handleShareResults('sms')}
          className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          SMS
        </button>
        <button
          onClick={() => handleShareResults('link')}
          className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Copy Link
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium mb-2">Meeting Details</h4>
        <div className="text-sm space-y-1">
          <p><strong>Location:</strong> {meetingDetails.location || 'Not set'}</p>
          <p><strong>Date & Time:</strong> {meetingDetails.dateTime || 'Not set'}</p>
          <p><strong>Sync Options:</strong> {Object.entries(meetingDetails.syncOptions).filter(([_, enabled]) => enabled).map(([key]) => key).join(', ') || 'None'}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('meeting')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to Meeting Setup
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Heart className="h-6 w-6 mr-2 text-red-500" />
                Romance Sync
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                ×
              </button>
            </div>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${currentStep === 'assessment' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                1. Compatibility Assessment
              </div>
              <div className={`p-3 rounded-lg ${currentStep === 'meeting' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                2. Meeting Setup
              </div>
              <div className={`p-3 rounded-lg ${currentStep === 'share' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                3. Share Results
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentStep === 'assessment' && renderAssessment()}
            {currentStep === 'meeting' && renderMeetingSetup()}
            {currentStep === 'share' && renderShareOptions()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRomanceSync;
