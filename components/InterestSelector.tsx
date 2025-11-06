import React from 'react';
import { INTERESTS, Interest } from '../types';

interface InterestSelectorProps {
  selectedInterests: Interest[];
  onChange: (interests: Interest[]) => void;
  maxSelection?: number;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onChange,
  maxSelection = 5
}) => {
  const toggleInterest = (interest: Interest) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < maxSelection) {
      onChange([...selectedInterests, interest]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-base sm:text-lg font-semibold text-gray-300">
          Interests ({selectedInterests.length}/{maxSelection})
        </label>
        {selectedInterests.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          const isDisabled = !isSelected && selectedInterests.length >= maxSelection;
          
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform active:scale-95 touch-manipulation
                ${isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : isDisabled
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Select up to {maxSelection} interests to find better matches
      </p>
    </div>
  );
};
