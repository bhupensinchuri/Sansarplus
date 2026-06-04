
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const ENGLISH_ALPHABET = ['All', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
const NEPALI_ALPHABET = ['All', ...'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'.split('')];

interface AlphabetNavProps {
  mode?: 'songs' | 'artists';
}

const AlphabetNav: React.FC<AlphabetNavProps> = ({ mode }) => {
  const location = useLocation();
  const { language } = useLanguage();
  
  // Determine mode from URL if not passed explicitly, default to songs
  const currentMode = mode || (location.pathname.includes('/browse/artists') ? 'artists' : 'songs');
  
  const currentLetter = decodeURIComponent(location.pathname.split('/').pop() || '');
  const baseUrl = currentMode === 'artists' ? '/browse/artists' : '/browse/songs';
  
  const alphabet = language === 'nepali' ? NEPALI_ALPHABET : ENGLISH_ALPHABET;

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          {alphabet.map((char) => {
             const charCode = char === '#' ? '0-9' : char;
             const isActive = currentLetter.toLowerCase() === charCode.toLowerCase();
             
             // Dynamic classes for 'All' pill shape vs single letter circle
             const baseClasses = "flex items-center justify-center rounded-full text-xs md:text-sm font-bold transition-all duration-200";
             const sizeClasses = char === 'All' ? "px-3 h-7 md:h-8" : "w-7 h-7 md:w-8 md:h-8";
             const activeClasses = isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                : 'text-slate-500 hover:text-primary hover:bg-slate-100';

             return (
              <Link
                key={char}
                to={`${baseUrl}/${encodeURIComponent(charCode)}`}
                className={`${baseClasses} ${sizeClasses} ${activeClasses}`}
              >
                {char}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlphabetNav;
