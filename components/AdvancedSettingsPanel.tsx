import React from 'react';
import { AdvancedSettings } from '../types';

interface AdvancedSettingsPanelProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
  onClose: () => void;
}

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  settings,
  onChange,
  onClose
}) => {
  const updateSetting = <K extends keyof AdvancedSettings>(
    key: K,
    value: AdvancedSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Advanced Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Quality */}
          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-3">
              Connection Quality
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['auto', 'high', 'medium', 'low'] as const).map((quality) => (
                <button
                  key={quality}
                  type="button"
                  onClick={() => updateSetting('connectionQuality', quality)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    settings.connectionQuality === quality
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Lower quality saves bandwidth
            </p>
          </div>

          {/* Profanity Filter */}
          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-3">
              Profanity Filter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['off', 'low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateSetting('profanityFilter', level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    settings.profanityFilter === level
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Filter inappropriate language in chats
            </p>
          </div>

          {/* Min Chat Duration */}
          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-3">
              Minimum Chat Duration (seconds)
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={settings.minChatDuration}
              onChange={(e) => updateSetting('minChatDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>0s</span>
              <span className="text-blue-400 font-semibold">{settings.minChatDuration}s</span>
              <span>60s</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Prevent accidental skips by requiring minimum chat time
            </p>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-semibold">Auto-skip Mismatch</h4>
                <p className="text-xs text-gray-400">Automatically skip when preferences don't match</p>
              </div>
              <button
                onClick={() => updateSetting('autoSkipMismatch', !settings.autoSkipMismatch)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSkipMismatch ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSkipMismatch ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-semibold">Show Typing Indicator</h4>
                <p className="text-xs text-gray-400">Let partners know when you're typing</p>
              </div>
              <button
                onClick={() => updateSetting('showTypingIndicator', !settings.showTypingIndicator)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showTypingIndicator ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showTypingIndicator ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
