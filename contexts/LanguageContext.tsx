
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'english' | 'nepali';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Headers kept in English as requested
  'Trending Now': { english: 'Trending Now', nepali: 'Trending Now' },
  'Top Artists': { english: 'Top Artists', nepali: 'Top Artists' },
  'View All': { english: 'View All', nepali: 'View All' },
  'Favorites': { english: 'Favorites', nepali: 'Favorites' },
  'No favorites yet': { english: 'No favorites yet', nepali: 'No favorites yet' },
  'Start browsing songs and artists to add them to your collection.': { 
    english: 'Start browsing songs and artists to add them to your collection.', 
    nepali: 'Start browsing songs and artists to add them to your collection.' 
  },
  'Browse Music': { english: 'Browse Music', nepali: 'Browse Music' },
  'Menu': { english: 'Menu', nepali: 'Menu' },
  'Categories': { english: 'Categories', nepali: 'Categories' },
  'Search': { english: 'Search', nepali: 'Search' },
  'Home': { english: 'Home', nepali: 'Home' },
  'Songs': { english: 'Songs', nepali: 'Songs' },
  'Artists': { english: 'Artists', nepali: 'Artists' },
  'Songs starting with': { english: 'Songs starting with', nepali: 'Songs starting with' },
  'Artists starting with': { english: 'Artists starting with', nepali: 'Artists starting with' },
  'Discover popular': { english: 'Discover popular', nepali: 'Discover popular' },
  'found': { english: 'found', nepali: 'found' },
  'No': { english: 'No', nepali: 'No' },
  'Try selecting a different letter.': { english: 'Try selecting a different letter.', nepali: 'Try selecting a different letter.' },
  'Play All': { english: 'Play All', nepali: 'Play All' },
  'Select Order': { english: 'Select Order', nepali: 'Select Order' },
  'Cancel Selection': { english: 'Cancel Selection', nepali: 'Cancel Selection' },
  'Custom Presentation Mode': { english: 'Custom Presentation Mode', nepali: 'Custom Presentation Mode' },
  'Click songs to add them to your presentation queue.': { english: 'Click songs to add them to your presentation queue.', nepali: 'Click songs to add them to your presentation queue.' },
  'Play': { english: 'Play', nepali: 'Play' },
  'Results for': { english: 'Results for', nepali: 'Results for' },
  'Search again...': { english: 'Search again...', nepali: 'Search again...' },
  'No results found': { english: 'No results found', nepali: 'No results found' },
  'Try checking for typos or using different keywords.': { english: 'Try checking for typos or using different keywords.', nepali: 'Try checking for typos or using different keywords.' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
      return (localStorage.getItem('app_language') as Language) || 'english';
  });

  useEffect(() => {
      localStorage.setItem('app_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'nepali' : 'english');
  };

  const t = (key: string) => {
    const entry = translations[key];
    if (entry) return entry[language];
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
