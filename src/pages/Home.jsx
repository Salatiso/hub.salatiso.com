import { Link } from 'react-router-dom';
import { Heart, Users, Briefcase, Home as HomeIcon, Star, Shield, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TrustVerification from '../components/TrustVerification';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 hero-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/onboarding"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center font-semibold"
              >
                <span>{t('nav.getStarted', 'Get Started')}</span>
              </Link>
              <Link
                to="/instant-trust"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>{t('nav.instantTrust', 'Instant Trust Verification')}</span>
              </Link>
              <Link
                to="/follow-me-home"
                className="border border-primary-600 text-primary-600 dark:text-primary-400 px-8 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors flex items-center justify-center"
              >
                <span>{t('nav.followMeHome', 'Follow Me Home')}</span>
              </Link>
              <Link
                to="/dashboard"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center font-semibold"
              >
                <span>{t('nav.dashboard', 'Dashboard')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('features.lifecv.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.lifecv.description')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('features.familyValue.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.familyValue.description')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('features.theHub.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.theHub.description')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('features.lifekey.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.lifekey.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sync Contexts Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contexts.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('contexts.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('contexts.romance.title')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('contexts.romance.description')}
              </p>
              <Link
                to="/solo?context=romance"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('contexts.romance.action')} →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Briefcase className="h-8 w-8 text-blue-500" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('contexts.business.title')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('contexts.business.description')}
              </p>
              <Link
                to="/solo?context=business"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('contexts.business.action')} →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-green-500" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('contexts.friendship.title')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('contexts.friendship.description')}
              </p>
              <Link
                to="/solo?context=friendship"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('contexts.friendship.action')} →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <HomeIcon className="h-8 w-8 text-purple-500" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('contexts.kinship.title')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('contexts.kinship.description')}
              </p>
              <Link
                to="/solo?context=kinship"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('contexts.kinship.action')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('trust.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('trust.subtitle')}
            </p>
          </div>

          <TrustVerification onVerificationComplete={(tier) => console.log('Verification completed:', tier)} />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('cta.buildTrust', 'Build Trust, Connect Safely')}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle', "Join thousands who are creating meaningful connections with instant trust verification. Whether for romance, business, or friendship - start your journey with confidence and safety.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/instant-trust"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <Shield className="h-5 w-5" />
              <span>{t('cta.startInstantTrust', 'Start Instant Trust Verification')}</span>
            </Link>
            <Link
              to="/solo"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              {t('cta.exploreSolo', 'Explore Solo Experience')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
