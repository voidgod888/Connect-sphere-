import React from 'react';
import { QueueStats } from '../types';

interface QueueStatsDisplayProps {
  stats: QueueStats;
}

export const QueueStatsDisplay: React.FC<QueueStatsDisplayProps> = ({ stats }) => {
  const formatWaitTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 mb-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <h3 className="text-lg font-semibold text-white">Queue Status</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-600/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Active Users</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-white text-xl font-bold">{stats.activeUsers}</p>
          </div>
        </div>

        {stats.estimatedWait !== undefined && (
          <div className="bg-gray-600/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Est. Wait Time</p>
            <p className="text-blue-400 text-xl font-bold">
              {formatWaitTime(stats.estimatedWait)}
            </p>
          </div>
        )}

        {stats.position !== undefined && (
          <div className="bg-gray-600/50 rounded-lg p-3 col-span-2">
            <p className="text-gray-400 text-xs mb-2">Your Position in Queue</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, 100 - stats.position * 10)}%` }}
                ></div>
              </div>
              <span className="text-white font-bold">#{stats.position}</span>
            </div>
          </div>
        )}
      </div>

      {stats.usersByRegion && Object.keys(stats.usersByRegion).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-gray-400 text-xs mb-2">Active by Region</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.usersByRegion)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([region, count]) => (
                <div
                  key={region}
                  className="bg-gray-600/70 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1"
                >
                  <span>{region}</span>
                  <span className="text-blue-400 font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
