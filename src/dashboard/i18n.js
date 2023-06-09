import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_translate from './locales/en.json';
import zh_translation from './locales/zh.json';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector)
    .use(initReactI18next).init({
        fallbackLng: 'en',
        resources: {
            en: {
                translation: en_translate
            },
            zh: {
                translation: zh_translation
            }
        },
        interpolation: {
            escapeValue: false
        }
    });
