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
  <div className="mb-6">
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center text-sm sm:text-base
            ${selectedValue === option.value
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
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
}> = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-6">
    <label className="block text-lg font-semibold text-gray-300 mb-3">{label}</label>
    <div className="flex w-full bg-gray-700 rounded-lg p-1 border-2 border-gray-600">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full text-center px-2 py-2 rounded-md font-medium transition-all duration-300 text-sm sm:text-base
            ${selectedValue === option.value
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-600/50'
            }`}
        >
          {option.label}
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
    <div className="h-full w-full flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Chat Settings</h2>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
                <p>{error}</p>
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

          <div className="mb-8">
            <label htmlFor="country" className="block text-lg font-semibold text-gray-300 mb-3">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-lg text-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
};