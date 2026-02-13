import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../i18n/en.json';
import jaTranslations from '../i18n/ja.json';
import { useAuth } from './AuthContext';

const LangContext = createContext(null);

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
};

const translations = {
  en: enTranslations,
  ja: jaTranslations
};

export const LangProvider = ({ children }) => {
  const { user } = useAuth();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Set language from user preference or localStorage
    const savedLang = localStorage.getItem('lang');
    if (user?.preferredLang) {
      setLang(user.preferredLang);
    } else if (savedLang) {
      setLang(savedLang);
    }
  }, [user]);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const value = {
    lang,
    changeLang,
    t
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};
