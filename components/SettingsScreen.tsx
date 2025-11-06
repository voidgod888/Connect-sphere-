import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { UserIdentity, PartnerPreference } from '../types';
import { COUNTRIES } from '../constants';

interface SettingsScreenProps {
  onStart: (settings: UserSettings) => void;
  error: string | null;
}

const SettingsOption: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onChange: (value: any) => void;
    delay?: number;
}> = ({ label, options, selectedValue, onChange, delay = 0 }) => (
  <div className="mb-6 animate-fadeInUp" style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}>
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option, idx) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 text-center text-sm sm:text-base transform hover:scale-105 active:scale-95
            ${selectedValue === option.value
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-400'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:shadow-md'
            }`}
          style={{ transitionDelay: `${idx * 50}ms` }}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

// A segmented control for selecting gender preference.
const PreferenceSelector: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onChange: (value: any) => void;
    delay?: number;
}> = ({ label, options, selectedValue, onChange, delay = 0 }) => (
  <div className="mb-6 animate-fadeInUp" style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}>
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="flex w-full bg-gray-700 rounded-lg p-1 border-2 border-gray-600 shadow-inner">
      {options.map((option, idx) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full text-center px-2 py-2 rounded-md font-medium transition-all duration-300 text-sm sm:text-base transform relative overflow-hidden
            ${selectedValue === option.value
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
              : 'text-gray-300 hover:bg-gray-600/50'
            }`}
          style={{ transitionDelay: `${idx * 50}ms` }}
        >
          {selectedValue === option.value && (
            <span className="absolute inset-0 bg-white/20 animate-pulse-slow"></span>
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  </div>
);


export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onStart, error }) => {
  const [identity, setIdentity] = useState<UserIdentity>(UserIdentity.Male);
  const [preference, setPreference] = useState<PartnerPreference>(PartnerPreference.Everyone);
  const [country, setCountry] = useState<string>('Global');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Small delay for button animation feedback
    setTimeout(() => {
      onStart({ identity, preference, country });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-lg mx-auto bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/50 animate-scaleIn overflow-hidden">
        {/* Animated header */}
        <div className="animate-fadeInDown mb-6">
          <h2 className="text-3xl font-bold text-center text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Chat Settings
          </h2>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
        </div>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center animate-fadeInDown shadow-lg shadow-red-500/20">
                <p className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <SettingsOption
            label="You are"
            options={[
              { value: UserIdentity.Male, label: 'Male' },
              { value: UserIdentity.Female, label: 'Female' },
              { value: UserIdentity.Multiple, label: 'Multiple' },
            ]}
            selectedValue={identity}
            onChange={setIdentity}
            delay={100}
          />

          <PreferenceSelector
            label="You are looking for"
            options={[
              { value: PartnerPreference.Male, label: 'Male' },
              { value: PartnerPreference.Female, label: 'Female' },
              { value: PartnerPreference.Everyone, label: 'Everyone' },
            ]}
            selectedValue={preference}
            onChange={setPreference}
            delay={200}
          />

          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}>
            <label htmlFor="country" className="block text-lg font-semibold text-gray-300 mb-3">Country</label>
            <div className="relative">
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer shadow-inner"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '400ms', opacity: 0, animationFillMode: 'forwards' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-lg text-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/30"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    Start Chatting
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
