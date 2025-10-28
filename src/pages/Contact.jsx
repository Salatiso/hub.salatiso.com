import { useState, useCallback } from 'react';
import { Mail, MessageSquare, Lightbulb, Star, Send, User, Phone, Globe, ShoppingCart, Users, Shield, Heart, MapPin, AlertTriangle, Car, Package, Wrench, Building, Network, Calendar, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ContactFormFields from '../components/common/ContactFormFields';

const Contact = () => {
  const { t } = useTranslation();
  const [contactForm, setContactForm] = useState({
    category: '',
    subject: '',
    message: '',
    anonymous: false,
    // Detailed contact info
    firstName: '',
    lastName: '',
    images: [],
    optionalNameFields: [],
    phones: [{ id: 1, number: '', label: 'Mobile' }],
    emails: [{ id: 1, address: '', label: 'Personal' }],
    notes: ''
  });

  const [pollData, setPollData] = useState({
    rankings: [],
    evaluations: {},
    feedback: '',
    includeDetails: true
  });

  const [showPoll, setShowPoll] = useState(false);

  const contactCategories = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'support', label: 'Technical Support', icon: Shield },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: Lightbulb },
    { value: 'partnership', label: 'Partnership Opportunities', icon: Users },
    { value: 'bug', label: 'Report a Bug', icon: AlertTriangle },
    { value: 'feature', label: 'Feature Request', icon: Star }
  ];

  const appFunctions = [
    { id: 'community_hub', name: 'Community Hub', icon: Users, description: 'Community safety and governance' },
    { id: 'follow_me_home', name: 'Follow Me Home', icon: MapPin, description: 'Personal safety companion' },
    { id: 'emergency_sync', name: 'Emergency Sync', icon: AlertTriangle, description: 'Emergency contact management' },
    { id: 'ride_sharing', name: 'Ride Sharing Safety', icon: Car, description: 'Safe transportation options' },
    { id: 'hitchhiking', name: 'Hitchhiking Safety', icon: Heart, description: 'Safe hitchhiking assistance' },
    { id: 'delivery', name: 'Delivery Services', icon: Package, description: 'Safe delivery coordination' },
    { id: 'home_services', name: 'Home Services', icon: Wrench, description: 'Home service providers' },
    { id: 'property_mgmt', name: 'Property Management', icon: Building, description: 'Property management tools' },
    { id: 'local_networking', name: 'Local Networking', icon: Network, description: 'Community networking' },
    { id: 'event_safety', name: 'Event Safety', icon: Calendar, description: 'Safety at public events' },
    { id: 'household_mgmt', name: 'Household Management', icon: Home, description: 'Family household tools' },
    { id: 'universal_trust', name: 'Universal Trust', icon: Shield, description: 'Comprehensive trust system' }
  ];

  const evaluationCategories = [
    { id: 'functionality', label: 'Functionality', description: 'How well does it work?' },
    { id: 'usability', label: 'Usability', description: 'How easy is it to use?' },
    { id: 'relevance', label: 'Relevance', description: 'How useful is it to you?' },
    { id: 'reliability', label: 'Reliability', description: 'How dependable is it?' },
    { id: 'innovation', label: 'Innovation', description: 'How innovative is it?' }
  ];

  const handleContactSubmit = useCallback((e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setContactForm({
      category: '',
      subject: '',
      message: '',
      anonymous: false,
      firstName: '',
      lastName: '',
      images: [],
      optionalNameFields: [],
      phones: [{ id: 1, number: '', label: 'Mobile' }],
      emails: [{ id: 1, address: '', label: 'Personal' }],
      notes: ''
    });
  }, [contactForm]);

  const handlePollSubmit = useCallback((e) => {
    e.preventDefault();
    // Handle poll submission
    console.log('Poll submitted:', pollData);
    alert('Thank you for your feedback! Your rankings help us improve.');
    setPollData({
      rankings: [],
      evaluations: {},
      feedback: '',
      includeDetails: true
    });
    setShowPoll(false);
  }, [pollData]);

  const addToRanking = (functionId) => {
    if (!pollData.rankings.includes(functionId) && pollData.rankings.length < 5) {
      setPollData(prev => ({
        ...prev,
        rankings: [...prev.rankings, functionId]
      }));
    }
  };

  const removeFromRanking = (functionId) => {
    setPollData(prev => ({
      ...prev,
      rankings: prev.rankings.filter(id => id !== functionId)
    }));
  };

  const updateEvaluation = (functionId, categoryId, rating) => {
    setPollData(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [functionId]: {
          ...prev.evaluations[functionId],
          [categoryId]: rating
        }
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Marketplace Encouragement Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{t('contact.marketplace.title')}</h1>
                  <p className="text-xl mb-6 opacity-90">
                    {t('contact.marketplace.description')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>{t('contact.marketplace.features.verified')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{t('contact.marketplace.features.trusted')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>{t('contact.marketplace.features.secure')}</span>
                    </div>
                  </div>
                  <a
                    href="https://bizhelp-lifecv.web.app/marketplace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    {t('contact.marketplace.visitButton')}
                  </a>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Mail className="w-6 h-6 mr-3 text-primary-500" />
          {t('contact.title')}
        </h2>

        <form onSubmit={handleContactSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.form.category')}</label>
              <select
                value={contactForm.category}
                onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">{t('contact.form.selectCategory')}</option>
                {contactCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{t(`contact.form.categories.${cat.value}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.form.subject')}</label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder={t('contact.form.subjectPlaceholder')}
                required
              />
            </div>
          </div>

          {!contactForm.anonymous && (
            <ContactFormFields profile={contactForm} setProfile={setContactForm} />
          )}

          <div>
            <label className="block text-sm font-medium mb-2">{t('contact.form.message')}</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-32 resize-none"
              placeholder={t('contact.form.messagePlaceholder')}
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={contactForm.anonymous}
              onChange={(e) => setContactForm(prev => ({ ...prev, anonymous: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm">
              {t('contact.form.anonymous')}
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Send className="w-5 h-5 mr-2" />
              {t('contact.form.submit')}
            </button>
          </div>
        </form>
      </div>

      {/* Poll Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Star className="w-6 h-6 mr-3 text-yellow-500" />
            {t('contact.poll.title')}
          </h2>
          <button
            onClick={() => setShowPoll(!showPoll)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showPoll ? t('contact.poll.hidePoll') : t('contact.poll.takePoll')}
          </button>
        </div>

        {showPoll && (
          <form onSubmit={handlePollSubmit} className="space-y-6">
            {/* Ranking Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('contact.poll.rankingTitle')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('contact.poll.rankingDescription')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {appFunctions.map(func => {
                  const Icon = func.icon;
                  const isRanked = pollData.rankings.includes(func.id);
                  const rank = pollData.rankings.indexOf(func.id) + 1;

                  return (
                    <div
                      key={func.id}
                      onClick={() => isRanked ? removeFromRanking(func.id) : addToRanking(func.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isRanked
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-5 h-5 text-primary-500" />
                        {isRanked && (
                          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                            #{rank}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium">{func.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{func.description}</p>
                    </div>
                  );
                })}
              </div>

              {pollData.rankings.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{t('contact.poll.yourTop5')}:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {pollData.rankings.map((id, index) => {
                      const func = appFunctions.find(f => f.id === id);
                      return (
                        <li key={id} className="text-sm">
                          <strong>{func.name}</strong> - {func.description}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>

            {/* Evaluation Section */}
            {pollData.rankings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('contact.poll.evaluationTitle')}</h3>
                <div className="space-y-4">
                  {pollData.rankings.slice(0, 3).map(id => {
                    const func = appFunctions.find(f => f.id === id);
                    const Icon = func.icon;

                    return (
                      <div key={id} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Icon className="w-5 h-5 text-primary-500 mr-2" />
                          <h4 className="font-medium">{func.name}</h4>
                        </div>

                        {evaluationCategories.map(category => (
                          <div key={category.id} className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{t(`contact.poll.categories.${category.id}`)}</span>
                              <span className="text-xs text-gray-500">{category.description}</span>
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => updateEvaluation(id, category.id, rating)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${ (pollData.evaluations[id]?.[category.id] || 0) >= rating
                                      ? 'bg-yellow-400 text-yellow-900'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback Section */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.poll.additionalFeedback')}</label>
              <textarea
                value={pollData.feedback}
                onChange={(e) => setPollData(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24 resize-none"
                placeholder="Any additional thoughts or suggestions..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeDetails"
                checked={pollData.includeDetails}
                onChange={(e) => setContactForm(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="includeDetails" className="text-sm">
                {t('contact.poll.includeDetails')}
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <Star className="w-5 h-5 mr-2" />
                {t('contact.poll.submitFeedback')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Links */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Primary: <a href="mailto:hub@salatiso.com" className="text-primary-600 hover:underline">hub@salatiso.com</a> |
          CC: <a href="mailto:lifecvhub@gmail.com" className="text-primary-600 hover:underline">lifecvhub@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default Contact;
