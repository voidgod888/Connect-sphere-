import React from 'react';
import { UserStats } from '../types';

interface StatsPanelProps {
  stats: UserStats;
  onClose?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onClose }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const statItems = [
    {
      label: 'Total Chats',
      value: stats.totalChats.toLocaleString(),
      icon: '💬',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Time Spent',
      value: formatTime(stats.totalMinutes),
      icon: '⏱️',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Countries',
      value: stats.countriesConnected.length.toString(),
      icon: '🌍',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: '🔥',
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      icon: '⭐',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      label: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      icon: '⭐',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  if (stats.rank) {
    statItems.push({
      label: 'Global Rank',
      value: `#${stats.rank}`,
      icon: '🏆',
      color: 'from-indigo-500 to-indigo-600'
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Your Statistics</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="bg-gray-700/50 rounded-xl p-4 hover:scale-105 transition-transform duration-200"
              >
                <div className={`bg-gradient-to-br ${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 shadow-lg`}>
                  {item.icon}
                </div>
                <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                <p className="text-white text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Countries Section */}
          {stats.countriesConnected.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>🗺️</span>
                Countries Connected ({stats.countriesConnected.length})
              </h3>
              <div className="bg-gray-700/50 rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                <div className="flex flex-wrap gap-2">
                  {stats.countriesConnected.map((country) => (
                    <span
                      key={country}
                      className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ratings Section */}
          {stats.totalRatings > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-yellow-400">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-yellow-500 text-2xl">★</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total Ratings</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRatings}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
