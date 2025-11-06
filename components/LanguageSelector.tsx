import React from 'react';
import { LANGUAGES, Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguages: Language[];
  onChange: (languages: Language[]) => void;
  maxSelection?: number;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onChange,
  maxSelection = 3
}) => {
  const toggleLanguage = (language: Language) => {
    if (selectedLanguages.includes(language)) {
      onChange(selectedLanguages.filter(l => l !== language));
    } else if (selectedLanguages.length < maxSelection) {
      onChange([...selectedLanguages, language]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-base sm:text-lg font-semibold text-gray-300">
          Languages ({selectedLanguages.length}/{maxSelection})
        </label>
        {selectedLanguages.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
        {LANGUAGES.map((language) => {
          const isSelected = selectedLanguages.includes(language);
          const isDisabled = !isSelected && selectedLanguages.length >= maxSelection;
          
          return (
            <button
              key={language}
              type="button"
              onClick={() => toggleLanguage(language)}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform active:scale-95 touch-manipulation
                ${isSelected
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                  : isDisabled
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
            >
              {language}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Select up to {maxSelection} languages you speak
      </p>
    </div>
  );
};
