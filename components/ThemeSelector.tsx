import React from 'react';
import { Theme } from '../types';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onChange: (theme: Theme) => void;
}

const themes = [
  { value: Theme.Dark, label: 'Dark', colors: 'from-gray-800 to-gray-900', icon: '🌙' },
  { value: Theme.Light, label: 'Light', colors: 'from-gray-100 to-white', icon: '☀️' },
  { value: Theme.Blue, label: 'Ocean', colors: 'from-blue-800 to-blue-900', icon: '🌊' },
  { value: Theme.Purple, label: 'Purple', colors: 'from-purple-800 to-purple-900', icon: '🔮' },
  { value: Theme.Green, label: 'Forest', colors: 'from-green-800 to-green-900', icon: '🌲' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-base sm:text-lg font-semibold text-gray-300 mb-3">
        Theme
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.value;
          
          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => onChange(theme.value)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 transform active:scale-95 ${
                isSelected ? 'ring-2 ring-blue-400 scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`bg-gradient-to-br ${theme.colors} p-4 aspect-square flex flex-col items-center justify-center`}>
                <span className="text-3xl mb-1">{theme.icon}</span>
                <span className={`text-sm font-medium ${theme.value === Theme.Light ? 'text-gray-800' : 'text-white'}`}>
                  {theme.label}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
