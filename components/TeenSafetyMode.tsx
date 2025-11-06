import React from 'react';

interface TeenSafetyModeProps {
  userAge: number | undefined;
  onAcknowledge: () => void;
}

export const TeenSafetyMode: React.FC<TeenSafetyModeProps> = ({ userAge, onAcknowledge }) => {
  const isTeen = userAge && userAge < 18;

  if (!isTeen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scaleIn border-2 border-blue-500">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Teen Safety Mode</h2>
              <p className="text-blue-100 text-sm">Important information for users under 18</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span>✨</span> Enhanced Safety Features Active
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Profanity filter</strong> automatically set to HIGH</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Safe Mode</strong> enabled by default (verified users only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Enhanced reporting</strong> with priority review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Age-appropriate matching</strong> within your age group</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Session time limits</strong> to encourage healthy usage</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-500 mb-3 flex items-center gap-2">
              <span>⚠️</span> Safety Guidelines
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Never share personal information (address, phone, school)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Don't agree to meet strangers in person</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Report any inappropriate behavior immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Tell a trusted adult if you feel uncomfortable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Block and skip anyone who makes you feel unsafe</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span>🚨</span> Report Immediately If:
            </h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">!</span>
                <span>Someone asks for personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">!</span>
                <span>You see inappropriate content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">!</span>
                <span>Someone makes you feel uncomfortable or threatened</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">!</span>
                <span>An adult tries to contact you off-platform</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">📞 Need Help?</h3>
            <p className="text-gray-300 text-sm mb-2">
              If you're experiencing cyberbullying or feel unsafe:
            </p>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>• Talk to a parent, guardian, or trusted adult</li>
              <li>• Contact school counselor or support services</li>
              <li>• Use our 24/7 report system (we review teen reports within 1 hour)</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="teen-safety-acknowledge"
              className="w-5 h-5 rounded accent-blue-600"
            />
            <label htmlFor="teen-safety-acknowledge" className="text-gray-300 text-sm">
              I have read and understand the safety guidelines
            </label>
          </div>

          <button
            onClick={onAcknowledge}
            disabled={!document.getElementById('teen-safety-acknowledge')?.['checked']}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue with Teen Safety Mode
          </button>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our enhanced safety measures and community guidelines
          </p>
        </div>
      </div>
    </div>
  );
};

// Teen-specific safety banner
export const TeenSafetyBanner: React.FC<{ onViewGuidelines: () => void }> = ({ onViewGuidelines }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-l-4 border-blue-500 px-4 py-3 mb-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="text-white font-semibold text-sm">Teen Safety Mode Active</p>
            <p className="text-gray-300 text-xs">Enhanced protections enabled</p>
          </div>
        </div>
        <button
          onClick={onViewGuidelines}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View Guidelines
        </button>
      </div>
    </div>
  );
};
