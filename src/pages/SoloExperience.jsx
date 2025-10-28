import { useState, useContext, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, Users, Briefcase, Home as HomeIcon, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import EnhancedRomanceSync from '../components/EnhancedRomanceSync';

const SoloExperience = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [selectedContext, setSelectedContext] = useState(searchParams.get('context') || '');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showEnhancedRomance, setShowEnhancedRomance] = useState(false);

  const contexts = {
    romance: {
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      title: t('solo.contexts.romance.title'),
      description: t('solo.contexts.romance.description')
    },
    business: {
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      title: t('solo.contexts.business.title'),
      description: t('solo.contexts.business.description')
    },
    friendship: {
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      title: t('solo.contexts.friendship.title'),
      description: t('solo.contexts.friendship.description')
    },
    kinship: {
      icon: HomeIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      title: t('solo.contexts.kinship.title'),
      description: t('solo.contexts.kinship.description')
    }
  };

  const questionTypes = {
    romance: 'likert', // Uses Strongly Agree to Strongly Disagree
    business: 'choice', // Uses multiple choice options
    friendship: 'choice', // Uses multiple choice options
    kinship: 'likert' // Uses Strongly Agree to Strongly Disagree
  };

  const questions = {
    romance: [
      t('solo.questions.romance.1'),
      t('solo.questions.romance.2'),
      t('solo.questions.romance.3'),
      t('solo.questions.romance.4'),
      t('solo.questions.romance.5'),
      t('solo.questions.romance.6'),
      t('solo.questions.romance.7'),
      t('solo.questions.romance.8'),
      t('solo.questions.romance.9'),
      t('solo.questions.romance.10'),
      t('solo.questions.romance.11'),
      t('solo.questions.romance.12')
    ],
    business: [
      t('solo.questions.business.1'),
      t('solo.questions.business.2'),
      t('solo.questions.business.3'),
      t('solo.questions.business.4'),
      t('solo.questions.business.5'),
      t('solo.questions.business.6'),
      t('solo.questions.business.7'),
      t('solo.questions.business.8'),
      t('solo.questions.business.9'),
      t('solo.questions.business.10'),
      t('solo.questions.business.11'),
      t('solo.questions.business.12')
    ],
    friendship: [
      t('solo.questions.friendship.1'),
      t('solo.questions.friendship.2'),
      t('solo.questions.friendship.3'),
      t('solo.questions.friendship.4'),
      t('solo.questions.friendship.5'),
      t('solo.questions.friendship.6'),
      t('solo.questions.friendship.7'),
      t('solo.questions.friendship.8'),
      t('solo.questions.friendship.9'),
      t('solo.questions.friendship.10'),
      t('solo.questions.friendship.11'),
      t('solo.questions.friendship.12')
    ],
    kinship: [
      t('solo.questions.kinship.1'),
      t('solo.questions.kinship.2'),
      t('solo.questions.kinship.3'),
      t('solo.questions.kinship.4'),
      t('solo.questions.kinship.5'),
      t('solo.questions.kinship.6'),
      t('solo.questions.kinship.7'),
      t('solo.questions.kinship.8')
    ]
  };

  const businessOptions = {
    1: [
      "Strongly support BEE initiatives",
      "Support BEE but with conditions",
      "Neutral on BEE",
      "Oppose BEE initiatives",
      "Strongly oppose BEE"
    ],
    2: [
      "Very important - qualifications are essential",
      "Important but not the only factor",
      "Somewhat important",
      "Not very important",
      "Experience matters more than qualifications"
    ],
    3: [
      "Actively promote women in leadership",
      "Support equal opportunities",
      "Neutral on gender issues",
      "Traditional business approach",
      "Focus on merit regardless of gender"
    ],
    4: [
      "Primarily merit-based hiring",
      "Balance merit with diversity goals",
      "Diversity considerations are important",
      "Strong focus on transformation",
      "Merit is the only consideration"
    ],
    5: [
      "Experience is much more valuable",
      "Experience is more valuable than qualifications",
      "Both are equally important",
      "Qualifications are more valuable",
      "Qualifications are much more valuable"
    ],
    6: [
      "Strong supporter of affirmative action",
      "Support some affirmative action measures",
      "Neutral on affirmative action",
      "Oppose most affirmative action",
      "Strongly oppose affirmative action"
    ],
    7: [
      "Transformation is a core business priority",
      "Balance transformation with profitability",
      "Business performance comes first",
      "Transformation goals are secondary",
      "Focus exclusively on business results"
    ],
    8: [
      "Actively invest in skills development",
      "Support skills development programs",
      "Neutral on skills development",
      "Limited focus on skills development",
      "Skills development is not a priority"
    ],
    9: [
      "Very important for business success",
      "Somewhat important",
      "Neutral on cultural diversity",
      "Not very important",
      "Cultural diversity is not a business priority"
    ],
    10: [
      "Always prioritize proven experience",
      "Usually prioritize experience",
      "Depends on the situation",
      "Usually prioritize qualifications",
      "Always prioritize formal qualifications"
    ],
    11: [
      "Strong supporter of BBBEE",
      "Support BBBEE compliance",
      "Neutral on BBBEE",
      "Oppose BBBEE requirements",
      "Strongly oppose BBBEE"
    ],
    12: [
      "By actual economic transformation",
      "By BBBEE scorecard compliance",
      "By diversity metrics",
      "By business performance only",
      "Transformation success is hard to measure"
    ]
  };

  const friendshipOptions = {
    1: [
      "Outdoor activities and sports",
      "Reading and intellectual pursuits",
      "Social gatherings and parties",
      "Creative hobbies and arts",
      "Relaxing at home",
      "Traveling and exploring",
      "Volunteering and community work",
      "Professional development"
    ],
    2: [
      "Witty and sarcastic",
      "Light-hearted and playful",
      "Dry and observational",
      "Slapstick and physical comedy",
      "Intellectual and wordplay-based",
      "Self-deprecating",
      "Dark or ironic",
      "I don't have much of a sense of humor"
    ],
    3: [
      "Very important - I love deep discussions",
      "Somewhat important",
      "Neutral - depends on the context",
      "Not very important",
      "I prefer light conversation"
    ],
    4: [
      "Dinner parties with close friends",
      "Outdoor adventures and hiking",
      "Cultural events and performances",
      "Sports events and games",
      "Book clubs and intellectual discussions",
      "Volunteering together",
      "Traveling with friends",
      "Quiet coffee meetups"
    ],
    5: [
      "Regular check-ins and calls",
      "Social media and messaging",
      "In-person meetups",
      "Group activities and events",
      "Shared experiences and adventures",
      "I struggle with maintaining friendships",
      "Quality over quantity",
      "I have a small close-knit group"
    ],
    6: [
      "I'm always there when needed",
      "I offer practical help and advice",
      "I provide emotional support",
      "I prefer to listen rather than give advice",
      "I help by connecting them with resources",
      "I offer financial assistance when possible",
      "I help with professional networking",
      "I prefer not to get involved in others' problems"
    ],
    7: [
      "Try to find common ground",
      "Avoid confrontation when possible",
      "Address issues directly but kindly",
      "Get emotional and defensive",
      "Seek mediation from others",
      "End the friendship if it's serious",
      "Give space and time to cool down",
      "Compromise and find solutions"
    ],
    8: [
      "Pop and contemporary",
      "Rock and alternative",
      "Jazz and classical",
      "Hip hop and R&B",
      "Electronic and dance",
      "Country and folk",
      "World music and traditional",
      "I don't listen to music much"
    ],
    9: [
      "Throw a party or celebration",
      "Give thoughtful gifts",
      "Write personal notes or cards",
      "Plan special experiences",
      "Share the moment publicly",
      "Offer practical help or support",
      "Create something meaningful",
      "Keep it low-key and personal"
    ],
    10: [
      "Summer - warm and active",
      "Autumn - colorful and cozy",
      "Winter - peaceful and reflective",
      "Spring - fresh and hopeful",
      "I don't have a favorite season",
      "All seasons have their appeal",
      "Depends on my mood",
      "I prefer consistent weather"
    ],
    11: [
      "Daily messages and calls",
      "Weekly check-ins",
      "Monthly meetups",
      "Social media updates",
      "Occasional messages",
      "I don't stay in touch well",
      "Through mutual friends",
      "Only when we happen to meet"
    ],
    12: [
      "Reading and writing",
      "Sports and physical activities",
      "Arts and crafts",
      "Cooking and baking",
      "Gardening and outdoor work",
      "Music and performance",
      "Technology and gaming",
      "Learning and education"
    ]
  };

  const contextData = contexts[selectedContext];
  const contextQuestions = questions[selectedContext] || [];
  const currentQuestionType = questionTypes[selectedContext] || 'likert';

  const getCurrentOptions = () => {
    if (currentQuestionType === 'likert') {
      return [
        t('solo.answers.stronglyAgree'),
        t('solo.answers.agree'),
        t('solo.answers.neutral'),
        t('solo.answers.disagree'),
        t('solo.answers.stronglyDisagree')
      ];
    } else if (selectedContext === 'business') {
      return businessOptions[currentQuestion + 1] || [];
    } else if (selectedContext === 'friendship') {
      return friendshipOptions[currentQuestion + 1] || [];
    }
    return [];
  };

  useEffect(() => {
    if (selectedContext && guestData.questionnaires[selectedContext]) {
      setAnswers(guestData.questionnaires[selectedContext]);
      setShowResults(true);
    }
  }, [selectedContext, guestData]);

  const handleAnswer = useCallback((questionIndex, answer) => {
    const newAnswers = { ...answers, [questionIndex]: answer };
    setAnswers(newAnswers);

    if (questionIndex < contextQuestions.length - 1) {
      setCurrentQuestion(questionIndex + 1);
    } else {
      // Save to guest data
      const updatedGuestData = {
        ...guestData,
        questionnaires: {
          ...guestData.questionnaires,
          [selectedContext]: newAnswers
        }
      };
      setGuestData(updatedGuestData);
      setShowResults(true);
    }
  }, [answers, contextQuestions.length, guestData, selectedContext]);

  const generateSyncLink = () => {
    const syncId = Math.random().toString(36).substring(2, 15);
    const syncs = [...guestData.syncs, {
      id: syncId,
      context: selectedContext,
      createdAt: Date.now(),
      status: 'pending'
    }];
    setGuestData({ ...guestData, syncs });
    return syncId;
  };

  if (!selectedContext) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('solo.chooseContext.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('solo.chooseContext.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(contexts).map(([key, context]) => {
              const Icon = context.icon;
              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => setSelectedContext(key)}
                    className={`w-full p-8 rounded-lg text-left transition-all hover:shadow-lg ${context.bgColor} border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
                  >
                    <Icon className={`h-12 w-12 ${context.color} mb-4`} />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {context.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {context.description}
                    </p>
                  </button>
                  {key === 'romance' && (
                    <button
                      onClick={() => setShowEnhancedRomance(true)}
                      className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors"
                    >
                      Enhanced Sync
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const completedQuestions = Object.keys(answers).length;
    const syncId = generateSyncLink();

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('solo.results.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('solo.results.description', { count: completedQuestions, context: contextData.title })}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('solo.results.syncLink.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {t('solo.results.syncLink.description')}
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/sync/${syncId}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sync/${syncId}`)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('solo.results.syncLink.copy')}
                </button>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {t('solo.results.sessionInfo')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={`/sync/${syncId}`}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('solo.results.viewSyncDetails')}
                </Link>
                <button className="border border-primary-600 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors">
                  {t('solo.results.createAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <contextData.icon className={`h-12 w-12 ${contextData.color} mx-auto mb-4`} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {contextData.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('solo.questionnaire.progress', { current: currentQuestion + 1, total: contextQuestions.length })}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {contextQuestions[currentQuestion]}
            </h2>

            <div className="space-y-3">
              {getCurrentOptions().map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion, index + 1)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              {t('solo.questionnaire.previous')}
            </button>
            <div className="flex space-x-1">
              {contextQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentQuestion ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentQuestion + 1}/{contextQuestions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Romance Sync Modal */}
      {showEnhancedRomance && <EnhancedRomanceSync onClose={() => setShowEnhancedRomance(false)} />}
    </div>
  );
};

export default SoloExperience;
