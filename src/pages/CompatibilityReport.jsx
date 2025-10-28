import { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Users, Briefcase, Home as HomeIcon, TrendingUp, AlertCircle, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';

const CompatibilityReport = () => {
  const { t } = useTranslation();
  const { reportId } = useParams();
  const { guestData } = useContext(GuestContext);
  const [report, setReport] = useState(null);

  const contexts = {
    romance: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', title: t('report.contexts.romance') },
    business: { icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', title: t('report.contexts.business') },
    friendship: { icon: Users, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', title: t('report.contexts.friendship') },
    kinship: { icon: HomeIcon, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', title: t('report.contexts.kinship') }
  };

  useEffect(() => {
    const foundReport = guestData.reports?.find(r => r.id === reportId);
    if (foundReport) {
      setReport(foundReport);
    }
  }, [reportId, guestData]);

  const getCompatibilityColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 90) return t('report.compatibility.excellent');
    if (score >= 80) return t('report.compatibility.great');
    if (score >= 70) return t('report.compatibility.good');
    if (score >= 60) return t('report.compatibility.fair');
    return t('report.compatibility.needsWork');
  };

  const exportData = () => {
    const data = {
      report,
      exportedAt: new Date().toISOString(),
      guestSession: {
        createdAt: guestData.createdAt,
        renewals: guestData.renewals
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync-report-${reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('report.notFound.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('report.notFound.description')}
          </p>
          <Link
            to="/solo"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('report.notFound.startNew')}
          </Link>
        </div>
      </div>
    );
  }

  const contextData = contexts[report.context];
  const Icon = contextData.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`${contextData.bgColor} p-8 text-center`}>
            <Icon className={`h-16 w-16 ${contextData.color} mx-auto mb-4`} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('report.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {contextData.title} • {t('report.generated')} {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Compatibility Score */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${report.compatibility}, 100`}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${report.compatibility}, 100`}
                    className={getCompatibilityColor(report.compatibility)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getCompatibilityColor(report.compatibility)}`}>
                    {report.compatibility}%
                  </span>
                </div>
              </div>
              <h2 className={`text-2xl font-bold ${getCompatibilityColor(report.compatibility)}`}>
                {getCompatibilityLabel(report.compatibility)}
              </h2>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('report.strengths.title')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    {t('report.strengths.sharedValues')}
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    {t('report.strengths.communication')}
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    {t('report.strengths.lifeGoals')}
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('report.growth.title')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    {t('report.growth.conflict')}
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    {t('report.growth.social')}
                  </li>
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 {t('report.recommendations.title')}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• {t('report.recommendations.checkins')}</li>
                <li>• {t('report.recommendations.focus')}</li>
                <li>• {t('report.recommendations.open')}</li>
                <li>• {t('report.recommendations.professional')}</li>
              </ul>
            </div>

            {/* Ecosystem Integration */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🌟 {t('report.ecosystem.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('report.ecosystem.lifecv')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('report.ecosystem.lifecvDesc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <HomeIcon className="h-6 w-6 text-secondary-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('report.ecosystem.familyValue')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('report.ecosystem.familyValueDesc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-accent-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('report.ecosystem.theHub')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('report.ecosystem.theHubDesc')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={exportData}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>{t('report.actions.export')}</span>
              </button>
              <button className="border border-primary-600 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>{t('report.actions.share')}</span>
              </button>
              <Link
                to="/solo"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('report.actions.newSync')}
              </Link>
            </div>

            {/* Guest Notice */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    {t('report.guest.title')}
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    {t('report.guest.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityReport;
