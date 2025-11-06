import React from 'react';

interface KeyboardShortcutsPanelProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], description: 'Find next partner', category: 'Navigation' },
  { keys: ['Esc'], description: 'Stop chat', category: 'Navigation' },
  { keys: ['M'], description: 'Toggle microphone', category: 'Controls' },
  { keys: ['C'], description: 'Toggle camera', category: 'Controls' },
  { keys: ['Ctrl', 'S'], description: 'Open settings', category: 'General' },
  { keys: ['Ctrl', 'K'], description: 'Open keyboard shortcuts', category: 'General' },
  { keys: ['R'], description: 'Report user', category: 'Safety' },
  { keys: ['Space'], description: 'Send message (when in input)', category: 'Chat' },
];

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ onClose }) => {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-gray-400 text-sm">Master these shortcuts for faster navigation</p>
          </div>
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
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">{category}</h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-gray-500 mx-1">+</span>}
                          <kbd className="px-3 py-1 bg-gray-600 text-white rounded font-mono text-sm shadow-md border border-gray-500">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">Tip</p>
                <p>Press <kbd className="px-2 py-0.5 bg-gray-600 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-gray-600 rounded text-xs">K</kbd> anytime to view shortcuts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
