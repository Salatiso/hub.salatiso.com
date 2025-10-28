import { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Users, Briefcase, Home as HomeIcon, CheckCircle, AlertCircle, Share2, QrCode, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import UniversalTrustLayer from '../components/UniversalTrustLayer';
import QRTrustProfileScanner from '../components/QRTrustProfileScanner';
import ReciprocalRatingSystem from '../components/ReciprocalRatingSystem';
import { evaluateDisclosure, computeOverlap, buildIncentives } from '../utils/reciprocity';
import { fetchPartnerVisibility } from '../utils/reciprocityApi';

const Sync = () => {
  const { t } = useTranslation();
  const { syncId } = useParams();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [syncData, setSyncData] = useState(null);
  const [partnerAnswers, setPartnerAnswers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [showTrustScanner, setShowTrustScanner] = useState(false);
  const [partnerTrustData, setPartnerTrustData] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [overlap, setOverlap] = useState({ overlapPercent: null });
  const [selfEval, setSelfEval] = useState(null);
  const [partnerEval, setPartnerEval] = useState(null);
  const [partnerUidInput, setPartnerUidInput] = useState('');
  
  const [syncPhase, setSyncPhase] = useState('setup'); // setup, connected, completed

  const contexts = {
    romance: { icon: Heart, color: 'text-red-500' },
    business: { icon: Briefcase, color: 'text-blue-500' },
    friendship: { icon: Users, color: 'text-green-500' },
    kinship: { icon: HomeIcon, color: 'text-purple-500' }
  };

  const questionTypes = {
    romance: 'likert',
    business: 'choice',
    friendship: 'choice',
    kinship: 'likert'
  };

  const getQuestionsForContext = (context) => {
    const questionSets = {
      romance: [
        t('sync.questions.romance.1'),
        t('sync.questions.romance.2'),
        t('sync.questions.romance.3'),
        t('sync.questions.romance.4'),
        t('sync.questions.romance.5'),
        t('sync.questions.romance.6'),
        t('sync.questions.romance.7'),
        t('sync.questions.romance.8'),
        t('sync.questions.romance.9'),
        t('sync.questions.romance.10')
      ],
      business: [
        t('sync.questions.business.1'),
        t('sync.questions.business.2'),
        t('sync.questions.business.3'),
        t('sync.questions.business.4'),
        t('sync.questions.business.5'),
        t('sync.questions.business.6'),
        t('sync.questions.business.7'),
        t('sync.questions.business.8'),
        t('sync.questions.business.9'),
        t('sync.questions.business.10')
      ],
      friendship: [
        t('sync.questions.friendship.1'),
        t('sync.questions.friendship.2'),
        t('sync.questions.friendship.3'),
        t('sync.questions.friendship.4'),
        t('sync.questions.friendship.5'),
        t('sync.questions.friendship.6'),
        t('sync.questions.friendship.7'),
        t('sync.questions.friendship.8'),
        t('sync.questions.friendship.9'),
        t('sync.questions.friendship.10')
      ],
      kinship: [
        t('sync.questions.kinship.1'),
        t('sync.questions.kinship.2'),
        t('sync.questions.kinship.3'),
        t('sync.questions.kinship.4'),
        t('sync.questions.kinship.5'),
        t('sync.questions.kinship.6'),
        t('sync.questions.kinship.7'),
        t('sync.questions.kinship.8'),
        t('sync.questions.kinship.9'),
        t('sync.questions.kinship.10')
      ]
    };
    return questionSets[context] || [];
  };

  const handlePartnerAnswer = useCallback((questionIndex, answer) => {
    setPartnerAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  }, []);

  const businessOptions = {
    0: [
      "Strongly support BEE initiatives",
      "Support BEE but with conditions",
      "Neutral on BEE",
      "Oppose BEE initiatives",
      "Strongly oppose BEE"
    ],
    1: [
      "Very important - qualifications are essential",
      "Important but not the only factor",
      "Somewhat important",
      "Not very important",
      "Experience matters more than qualifications"
    ],
    2: [
      "Actively promote women in leadership",
      "Support equal opportunities",
      "Neutral on gender issues",
      "Traditional business approach",
      "Focus on merit regardless of gender"
    ],
    3: [
      "Primarily merit-based hiring",
      "Balance merit with diversity goals",
      "Diversity considerations are important",
      "Strong focus on transformation",
      "Merit is the only consideration"
    ],
    4: [
      "Experience is much more valuable",
      "Experience is more valuable than qualifications",
      "Both are equally important",
      "Qualifications are more valuable",
      "Qualifications are much more valuable"
    ],
    5: [
      "Strong supporter of affirmative action",
      "Support some affirmative action measures",
      "Neutral on affirmative action",
      "Oppose most affirmative action",
      "Strongly oppose affirmative action"
    ],
    6: [
      "Transformation is a core business priority",
      "Balance transformation with profitability",
      "Business performance comes first",
      "Transformation goals are secondary",
      "Focus exclusively on business results"
    ],
    7: [
      "Actively invest in skills development",
      "Support skills development programs",
      "Neutral on skills development",
      "Limited focus on skills development",
      "Skills development is not a priority"
    ],
    8: [
      "Very important for business success",
      "Somewhat important",
      "Neutral on cultural diversity",
      "Not very important",
      "Cultural diversity is not a business priority"
    ],
    9: [
      "Always prioritize proven experience",
      "Usually prioritize experience",
      "Depends on the situation",
      "Usually prioritize qualifications",
      "Always prioritize formal qualifications"
    ]
  };

  const friendshipOptions = {
    0: [
      "Outdoor activities and sports",
      "Reading and intellectual pursuits",
      "Social gatherings and parties",
      "Creative hobbies and arts",
      "Relaxing at home",
      "Traveling and exploring",
      "Volunteering and community work",
      "Professional development"
    ],
    1: [
      "Witty and sarcastic",
      "Light-hearted and playful",
      "Dry and observational",
      "Slapstick and physical comedy",
      "Intellectual and wordplay-based",
      "Self-deprecating",
      "Dark or ironic",
      "I don't have much of a sense of humor"
    ],
    2: [
      "Very important - I love deep discussions",
      "Somewhat important",
      "Neutral - depends on the context",
      "Not very important",
      "I prefer light conversation"
    ],
    3: [
      "Dinner parties with close friends",
      "Outdoor adventures and hiking",
      "Cultural events and performances",
      "Sports events and games",
      "Book clubs and intellectual discussions",
      "Volunteering together",
      "Traveling with friends",
      "Quiet coffee meetups"
    ],
    4: [
      "Regular check-ins and calls",
      "Social media and messaging",
      "In-person meetups",
      "Group activities and events",
      "Shared experiences and adventures",
      "I struggle with maintaining friendships",
      "Quality over quantity",
      "I have a small close-knit group"
    ],
    5: [
      "I'm always there when needed",
      "I offer practical help and advice",
      "I provide emotional support",
      "I prefer to listen rather than give advice",
      "I help by connecting them with resources",
      "I offer financial assistance when possible",
      "I help with professional networking",
      "I prefer not to get involved in others' problems"
    ],
    6: [
      "Try to find common ground",
      "Avoid confrontation when possible",
      "Address issues directly but kindly",
      "Get emotional and defensive",
      "Seek mediation from others",
      "End the friendship if it's serious",
      "Give space and time to cool down",
      "Compromise and find solutions"
    ],
    7: [
      "Pop and contemporary",
      "Rock and alternative",
      "Jazz and classical",
      "Hip hop and R&B",
      "Electronic and dance",
      "Country and folk",
      "World music and traditional",
      "I don't listen to music much"
    ],
    8: [
      "Throw a party or celebration",
      "Give thoughtful gifts",
      "Write personal notes or cards",
      "Plan special experiences",
      "Share the moment publicly",
      "Offer practical help or support",
      "Create something meaningful",
      "Keep it low-key and personal"
    ],
    9: [
      "Summer - warm and active",
      "Autumn - colorful and cozy",
      "Winter - peaceful and reflective",
      "Spring - fresh and hopeful",
      "I don't have a favorite season",
      "All seasons have their appeal",
      "Depends on my mood",
      "I prefer consistent weather"
    ]
  };

  useEffect(() => {
    const sync = guestData.syncs.find(s => s.id === syncId);
    if (sync) {
      setSyncData(sync);
    }
  }, [syncId, guestData]);

  const handleTrustScanSuccess = useCallback((trustData) => {
    setPartnerTrustData(trustData);
    setShowTrustScanner(false);
    setSyncPhase('connected');
    // If trustData contains UID, fetch partner visibility
    if (trustData?.userId || trustData?.uid) {
      const uid = trustData.uid || trustData.userId;
      setPartnerUidInput(uid);
      // fire and forget; effect below will handle
    }
  }, []);

  const handleTrustScanError = useCallback((error) => {
    console.error('Trust scan error:', error);
    setShowTrustScanner(false);
  }, []);

  const handleRatingComplete = useCallback((ratingData) => {
    setSyncPhase('completed');

    // Update sync data with rating
    const updatedSyncs = guestData.syncs.map(sync =>
      sync.id === syncId
        ? { ...sync, rating: ratingData, completed: true, completedAt: Date.now() }
        : sync
    );

    setGuestData({
      ...guestData,
      syncs: updatedSyncs
    });
  }, [syncId, guestData]);

  // Evaluate reciprocity whenever connected or guestData/profile changes
  useEffect(() => {
    if (!isConnected) return;
    const self = evaluateDisclosure({
      profile: guestData.profile || {},
      servicesRegistered: guestData.servicesRegistered || [],
      role: guestData.role
    });
    setSelfEval(self);
    const partner = partnerProfile ? evaluateDisclosure({
      profile: partnerProfile.profile || partnerProfile, // accept LifeCV or local shape
      servicesRegistered: partnerProfile.servicesRegistered || partnerProfile.services || [],
      role: partnerProfile.role
    }) : null;
    setPartnerEval(partner);
    setOverlap(computeOverlap(self, partner));
  }, [isConnected, guestData.profile, guestData.servicesRegistered, guestData.role, partnerProfile]);

  // Pull partner visibility from Cloud Function when we have a UID
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isConnected) return;
      const uid = (partnerTrustData?.uid || partnerTrustData?.userId || '').toString().trim() || partnerUidInput.trim();
      if (!uid) return;
      try {
        const data = await fetchPartnerVisibility(uid);
        if (cancelled) return;
        // data.partnerVisible is the subset of partner profile we can see
        // For evaluation, use returned partnerEval if present
        setPartnerProfile({ ...data.partnerVisible, role: data.partnerEval?.role, services: data.partnerVisible?.services });
        if (data.partnerEval) setPartnerEval(data.partnerEval);
        if (data.overlapPercent != null) setOverlap({ overlapPercent: data.overlapPercent });
      } catch (e) {
        console.error('Failed to fetch partner visibility:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [isConnected, partnerTrustData, partnerUidInput]);

  

  const generateReport = () => {
    const reportId = Math.random().toString(36).substring(2, 15);
    // In a real app, this would calculate compatibility
    const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100%

    const report = {
      id: reportId,
      syncId,
      context: syncData.context,
      compatibility,
      yourAnswers: guestData.questionnaires[syncData.context] || {},
      partnerAnswers,
      createdAt: Date.now()
    };

    // Save report to guest data
    const updatedGuestData = {
      ...guestData,
      reports: [...(guestData.reports || []), report]
    };
    setGuestData(updatedGuestData);

    return reportId;
  };

  if (!syncData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('sync.notFound.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('sync.notFound.description')}
          </p>
          <Link
            to="/solo"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('sync.notFound.startNew')}
          </Link>
        </div>
      </div>
    );
  }

  const contextData = contexts[syncData.context];
  const Icon = contextData.icon;
  const questions = getQuestionsForContext(syncData.context);
  const currentQuestionType = questionTypes[syncData.context] || 'likert';

  const getCurrentOptions = (questionIndex) => {
    if (currentQuestionType === 'likert') {
      return [
        t('sync.answers.stronglyAgree'),
        t('sync.answers.agree'),
        t('sync.answers.neutral'),
        t('sync.answers.disagree'),
        t('sync.answers.stronglyDisagree')
      ];
    } else if (syncData.context === 'business') {
      return businessOptions[questionIndex] || [];
    } else if (syncData.context === 'friendship') {
      return friendshipOptions[questionIndex] || [];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <Icon className={`h-12 w-12 ${contextData.color} mx-auto mb-4`} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {contextData.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('sync.header.syncId', { id: syncId })}
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <Share2 className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('sync.waiting.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('sync.waiting.description')}
                </p>
                <div className="flex items-center space-x-2 justify-center">
                  <input
                    type="text"
                    value={`${window.location.origin}/sync/${syncId}`}
                    readOnly
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sync/${syncId}`)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    {t('sync.waiting.copy')}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsConnected(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('sync.waiting.simulate')}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    {t('sync.connected.message')}
                  </span>
                </div>
              </div>

              {/* Trust & Verification Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Universal Trust Layer */}
                <UniversalTrustLayer userId={guestData.id} context={syncData.context} />

                {/* Trust Scanner */}
                <div>
                  {showTrustScanner ? (
                    <QRTrustProfileScanner
                      onScanSuccess={handleTrustScanSuccess}
                      onScanError={handleTrustScanError}
                    />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {t('sync.trust.title')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {t('sync.trust.description')}
                        </p>
                        <button
                          onClick={() => setShowTrustScanner(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <QrCode className="h-5 w-5 inline mr-2" />
                          {t('sync.trust.startScan')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reciprocity & Visibility Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reciprocity & Visibility</h3>
                  <Percent className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You see what you share. Completing more profile items increases mutual visibility.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                    <div className="text-xs uppercase text-gray-500 mb-1">Your completion</div>
                    <div className="text-2xl font-bold">{selfEval?.completionPercent ?? 0}%</div>
                    {selfEval && selfEval.missing.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Missing: {selfEval.missing.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                    <div className="text-xs uppercase text-gray-500 mb-1">Partner completion</div>
                    <div className="text-2xl font-bold">{partnerEval ? `${partnerEval.completionPercent}%` : '—'}</div>
                    {partnerEval && partnerEval.missing.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Missing: {partnerEval.missing.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                    <div className="text-xs uppercase text-primary-700 dark:text-primary-300 mb-1">Mutual visibility</div>
                    <div className="text-2xl font-bold text-primary-800 dark:text-primary-200">{overlap.overlapPercent != null ? `${overlap.overlapPercent}%` : 'TBD'}</div>
                    <div className="mt-2 text-xs text-primary-800/80 dark:text-primary-300/90">
                      {overlap.overlapPercent != null ? 'Based on lower of the two completion scores' : 'Connect and share to determine overlap'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter partner UID (optional)"
                    value={partnerUidInput}
                    onChange={(e)=>setPartnerUidInput(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full md:w-80"
                  />
                  <button
                    onClick={()=>setPartnerUidInput(partnerUidInput.trim())}
                    className="px-3 py-2 rounded bg-primary-600 text-white text-sm"
                  >Fetch</button>
                </div>
                {selfEval && selfEval.missing.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">Boost your visibility</div>
                    <ul className="list-disc pl-6 text-sm text-gray-700 dark:text-gray-300">
                      {buildIncentives(selfEval.missing).map(msg => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <Link to="/onboarding" className="inline-block px-3 py-2 rounded bg-primary-600 text-white text-sm">Quickly complete profile</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('sync.questions.title')}
                </h2>

                {questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      {question}
                    </h3>
                    <div className="space-y-2">
                      {getCurrentOptions(index).map((option, optionIndex) => (
                        <button
                          key={option}
                          onClick={() => handlePartnerAnswer(index, optionIndex + 1)}
                          className={`w-full text-left p-3 rounded border transition-colors ${
                            partnerAnswers[index] === optionIndex + 1
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(partnerAnswers).length === questions.length && (
                <div className="mt-8 text-center">
                  <Link
                    to={`/report/${generateReport()}`}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <span>{t('sync.report.generate')}</span>
                    <CheckCircle className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Rating System for Completed Syncs */}
          {syncPhase === 'completed' && (
            <div className="mt-8">
              <ReciprocalRatingSystem
                syncId={syncId}
                partnerId={partnerTrustData?.userId}
                onRatingComplete={handleRatingComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sync;
