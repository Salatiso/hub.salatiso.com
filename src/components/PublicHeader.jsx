/**
 * PublicHeader Component
 * Used on all public pages (/, /auth, /contact, /onboarding, /terms/reciprocity)
 * Features:
 * - No Sidebar toggle
 * - No User menu
 * - Clean navigation to Home/Auth
 * - Theme toggle
 * - Language selector
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';

const PublicHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">LifeSync</span>
                <div className="text-xs text-gray-500 dark:text-gray-400" style={{ lineHeight: '1' }}>
                  by Salatiso
                </div>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Desktop only */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('home')}
            </Link>
            <a 
              href="#features" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('features.title')}
            </a>
            <a 
              href="#about" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('about')}
            </a>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Login/Signup Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to="/auth?mode=signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                {t('signup')}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              {t('features.title')}
            </a>
            <a href="#about" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              {t('about')}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
