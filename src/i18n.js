import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import af from './locales/af.json';
import nr from './locales/nr.json';
import nso from './locales/nso.json';
import pt from './locales/pt.json';
import ss from './locales/ss.json';
import st from './locales/st.json';
import sw from './locales/sw.json';
import tn from './locales/tn.json';
import ts from './locales/ts.json';
import ve from './locales/ve.json';
import xh from './locales/xh.json';
import zu from './locales/zu.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  af: { translation: af },
  nr: { translation: nr },
  nso: { translation: nso },
  pt: { translation: pt },
  ss: { translation: ss },
  st: { translation: st },
  sw: { translation: sw },
  tn: { translation: tn },
  ts: { translation: ts },
  ve: { translation: ve },
  xh: { translation: xh },
  zu: { translation: zu },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
