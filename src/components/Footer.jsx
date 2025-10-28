import { Heart, Users, Briefcase, Home as HomeIcon, ExternalLink, Shield, BookOpen, Globe, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary-400" />
              <div>
                <span className="text-xl font-bold">LifeSync</span>
                <div className="text-xs text-gray-400" style={{ lineHeight: '1' }}>by Salatiso</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex flex-col space-y-2">
              <a href="https://the-hub-lifecv.web.app" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>The Hub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://salatiso-lifecv.web.app" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center space-x-1">
                <span>Salatiso.com</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              {import.meta.env.DEV && (import.meta.env.VITE_USE_FIRESTORE_EMULATOR === '1' || import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === '1') && (
                <a href="http://localhost:4000" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1">
                  <FlaskConical className="h-4 w-4" />
                  <span>{t('footer.emulatorUi')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Sync Contexts */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary-400" />
              <span>{t('footer.syncContexts')}</span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">Romance</span>
              </li>
              <li className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Business</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Friendship</span>
              </li>
              <li className="flex items-center space-x-2">
                <HomeIcon className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300">Kinship</span>
              </li>
            </ul>
          </div>

          {/* Key Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary-400" />
              <span>Key Services</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://safetyhelp-lifecv.web.app/" className="text-gray-300 hover:text-white transition-colors">
                  SafetyHelp
                </a>
              </li>
              <li>
                <a href="https://legalhelp-lifecv.web.app/" className="text-gray-300 hover:text-white transition-colors">
                  LegalHelp
                </a>
              </li>
              <li>
                <a href="https://finhelp-lifecv.web.app/" className="text-gray-300 hover:text-white transition-colors">
                  FinHelp
                </a>
              </li>
              <li>
                <a href="https://bizhelp-lifecv.web.app/" className="text-gray-300 hover:text-white transition-colors">
                  BizHelp
                </a>
              </li>
              <li>
                <a href="https://dochelp-lifecv.web.app/" className="text-gray-300 hover:text-white transition-colors">
                  DocHelp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ecosystem Links - Collapsed */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Complete Ecosystem</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="https://bizhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">BizHelp</a>
<a href="https://dochelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">DocHelp</a>
<a href="https://ekhaya-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">Ekhaya</a>
<a href="https://familyvalue-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">FamilyValue</a>
<a href="https://finhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">FinHelp</a>
<a href="https://flamea-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">Flamea</a>
<a href="https://legalhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">LegalHelp</a>
<a href="https://lifesync-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">LifeSync</a>
<a href="https://hrhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">HrHelp</a>
<a href="https://pigeeback-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">PigeeBack</a>
<a href="https://pubhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">PubHelp</a>
<a href="https://safetyhelp-lifecv.web.app/" className="text-gray-400 hover:text-white transition-colors">SafetyHelp</a>
            </div>
          </div>

          {/* Sazi Academy */}
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center justify-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>{t('footer.saziAcademy')}</span>
            </h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="https://sazi-life-academy.web.app/" className="text-gray-400 hover:text-white transition-colors">Academy</a>
              <a href="https://sazi-life-homeschooling.web.app/" className="text-gray-400 hover:text-white transition-colors">Online & Home School</a>
              <a href="https://sazi-life-language.web.app/" className="text-gray-400 hover:text-white transition-colors">Language</a>
              <a href="https://sazi-life-home-life.web.app/" className="text-gray-400 hover:text-white transition-colors">Home Life</a>
              <a href="https://sazi-life-code-create.web.app/" className="text-gray-400 hover:text-white transition-colors">Code Create</a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact Us</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="mailto:hub@salatiso.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                hub@salatiso.com
              </a>
              <span className="text-gray-600">•</span>
              <a href="mailto:lifecvhub@gmail.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                lifecvhub@gmail.com
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-center">
            <div className="text-gray-400 text-sm flex flex-nowrap items-center justify-center gap-2 md:gap-3 overflow-x-auto">
              <span className="whitespace-nowrap">© 2025 LifeSync by Salatiso</span>
              <span className="text-gray-600">•</span>
              <span className="whitespace-nowrap">Part of the Salatiso Ecosystem</span>
              <span className="text-gray-600">•</span>
              <a href="/terms/reciprocity" className="text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap">Terms of Reciprocity</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
