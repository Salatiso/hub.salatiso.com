import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'nr', name: 'isiNdebele', flag: '🇿🇦' },
    { code: 'nso', name: 'Sepedi', flag: '🇿🇦' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ss', name: 'siSwati', flag: '🇿🇦' },
    { code: 'st', name: 'Sesotho', flag: '🇿🇦' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
    { code: 'tn', name: 'Setswana', flag: '🇿🇦' },
    { code: 'ts', name: 'Xitsonga', flag: '🇿🇦' },
    { code: 've', name: 'Tshivenda', flag: '🇿🇦' },
    { code: 'xh', name: 'xh', flag: '🇿🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                  i18n.language === language.code
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {i18n.language === language.code && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
