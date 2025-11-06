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
}> = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-6 animate-fadeInUp">
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`group px-4 py-3 rounded-xl font-medium transition-all duration-300 text-center text-sm sm:text-base transform
            ${selectedValue === option.value
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-400'
              : 'bg-gray-700/50 text-gray-200 hover:bg-gray-600 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm'
            }`}
          style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
        >
          <span className="relative">{option.label}</span>
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
}> = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-6 animate-fadeInUp">
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="flex w-full bg-gray-700/50 backdrop-blur-sm rounded-xl p-1.5 border-2 border-gray-600/50 shadow-inner">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative w-full text-center px-2 py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base overflow-hidden
            ${selectedValue === option.value
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 transform scale-105'
              : 'text-gray-300 hover:bg-gray-600/50 hover:text-white'
            }`}
          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
        >
          {selectedValue === option.value && (
            <span className="absolute inset-0 bg-white/20 animate-shimmer"></span>
          )}
          <span className="relative">{option.label}</span>
        </button>
      ))}
    </div>
  </div>
);


export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onStart, error }) => {
  const [identity, setIdentity] = useState<UserIdentity>(UserIdentity.Male);
  const [preference, setPreference] = useState<PartnerPreference>(PartnerPreference.Everyone);
  const [country, setCountry] = useState<string>('Global');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ identity, preference, country });
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-lg mx-auto bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-700/50 relative z-10 animate-scaleIn">
        <h2 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 animate-fadeInUp">
          Chat Settings
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 text-center animate-slideInLeft shadow-lg shadow-red-500/20">
                <p className="font-medium">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SettingsOption
            label="You are"
            options={[
              { value: UserIdentity.Male, label: 'Male' },
              { value: UserIdentity.Female, label: 'Female' },
              { value: UserIdentity.Multiple, label: 'Multiple' },
            ]}
            selectedValue={identity}
            onChange={setIdentity}
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
          />

          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <label htmlFor="country" className="block text-lg font-semibold text-gray-300 mb-3">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-700/70 backdrop-blur-sm text-white px-4 py-3 rounded-xl border-2 border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-500 cursor-pointer shadow-inner"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-gray-800">{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="group relative w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-bold py-4 px-4 rounded-xl text-xl hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-2xl shadow-blue-500/50 overflow-hidden animate-fadeInUp"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <span className="relative flex items-center justify-center gap-2">
              Start Chatting
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};