import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onClose: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  entries,
  currentUserId,
  onClose
}) => {
  const currentUserEntry = entries.find(e => e.userId === currentUserId);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏆</span> Global Leaderboard
            </h2>
            <p className="text-yellow-100 text-sm">Top chatters worldwide</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {currentUserEntry && (
          <div className="px-6 py-4 bg-blue-600/20 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                  #{currentUserEntry.rank}
                </div>
                <div>
                  <p className="text-white font-semibold">Your Rank</p>
                  <p className="text-sm text-gray-300">{currentUserEntry.score.toLocaleString()} points</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📊</p>
                <p>No leaderboard data available yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  const medal = getMedalEmoji(entry.rank);

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        isCurrentUser
                          ? 'bg-blue-600/30 ring-2 ring-blue-500'
                          : entry.rank <= 3
                          ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30'
                          : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gray-600'
                        } text-white shadow-lg`}>
                          {medal || `#${entry.rank}`}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                              {entry.username}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {entry.score.toLocaleString()} points
                          </p>
                        </div>
                      </div>

                      {entry.rank <= 10 && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil((11 - entry.rank) / 2)) }).map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
