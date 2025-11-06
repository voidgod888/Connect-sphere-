import React, { useState, useEffect } from 'react';
import { connectionOptimization, ConnectionQuality, QualityPreset } from '../services/connectionOptimization';

interface ConnectionQualityIndicatorProps {
  stream: MediaStream | null;
  onPresetChange?: (preset: QualityPreset) => void;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  stream,
  onPresetChange
}) => {
  const [quality, setQuality] = useState<ConnectionQuality>('excellent');
  const [showDetails, setShowDetails] = useState(false);
  const [report, setReport] = useState(connectionOptimization.getQualityReport());
  const [currentPreset, setCurrentPreset] = useState<QualityPreset>('auto');

  useEffect(() => {
    if (stream) {
      connectionOptimization.startMonitoring(stream);

      const updateQuality = (newQuality: ConnectionQuality) => {
        setQuality(newQuality);
        setReport(connectionOptimization.getQualityReport());
      };

      connectionOptimization.onQualityChange(updateQuality);

      // Update report every 3 seconds
      const interval = setInterval(() => {
        setReport(connectionOptimization.getQualityReport());
      }, 3000);

      return () => {
        connectionOptimization.offQualityChange(updateQuality);
        connectionOptimization.stopMonitoring();
        clearInterval(interval);
      };
    }
  }, [stream]);

  const getQualityColor = (q: ConnectionQuality) => {
    switch (q) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  };

  const getQualityIcon = (q: ConnectionQuality) => {
    switch (q) {
      case 'excellent': return '📶';
      case 'good': return '📶';
      case 'fair': return '📶';
      case 'poor': return '📶';
    }
  };

  const getQualityBars = (q: ConnectionQuality) => {
    switch (q) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'poor': return 1;
    }
  };

  const handlePresetChange = (preset: QualityPreset) => {
    setCurrentPreset(preset);
    connectionOptimization.setQualityPreset(preset);
    onPresetChange?.(preset);
  };

  const bars = getQualityBars(quality);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700/90 transition-all ${getQualityColor(quality)}`}
      >
        <div className="flex gap-0.5 items-end h-4">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm transition-all ${
                bar <= bars ? 'bg-current' : 'bg-gray-600'
              }`}
              style={{ height: `${bar * 25}%` }}
            />
          ))}
        </div>
        <span className="text-sm font-medium capitalize">{quality}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 animate-fadeIn">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Connection Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Latency</p>
                <p className="text-white font-semibold">{report.latency}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Bandwidth</p>
                <p className="text-white font-semibold">{report.bandwidth}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Packet Loss</p>
                <p className="text-white font-semibold">{report.packetLoss}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Jitter</p>
                <p className="text-white font-semibold">{report.jitter}</p>
              </div>
            </div>

            {/* Quality Preset Selector */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Video Quality</label>
              <div className="grid grid-cols-4 gap-2">
                {(['auto', 'high', 'medium', 'low'] as QualityPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      currentPreset === preset
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-300">{report.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for mobile
export const ConnectionQualityBadge: React.FC<{ quality: ConnectionQuality }> = ({ quality }) => {
  const getQualityColor = (q: ConnectionQuality) => {
    switch (q) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  };

  return (
    <div className={`w-2 h-2 rounded-full ${getQualityColor(quality)} animate-pulse`} />
  );
};
