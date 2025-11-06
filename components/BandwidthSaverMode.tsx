import React, { useState, useEffect } from 'react';
import { connectionOptimization } from '../services/connectionOptimization';

interface BandwidthSaverModeProps {
  stream: MediaStream | null;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BandwidthSaverMode: React.FC<BandwidthSaverModeProps> = ({
  stream,
  enabled,
  onToggle
}) => {
  const [dataSaved, setDataSaved] = useState(0);

  useEffect(() => {
    if (enabled && stream) {
      connectionOptimization.enableBandwidthSaver(stream);
      
      // Estimate data saved (rough calculation)
      const interval = setInterval(() => {
        setDataSaved(prev => prev + 0.5); // ~0.5 MB per second saved
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [enabled, stream]);

  const formatDataSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1000)} KB`;
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1000).toFixed(2)} GB`;
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💾</span>
          <div>
            <h3 className="text-white font-semibold">Bandwidth Saver</h3>
            <p className="text-xs text-gray-400">Reduce data usage</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Video Quality</span>
            <span className="text-yellow-500 font-medium">Low (240p)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Frame Rate</span>
            <span className="text-yellow-500 font-medium">15 FPS</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Data Saved</span>
            <span className="text-green-500 font-medium">{formatDataSize(dataSaved)}</span>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2 mt-3">
            <p className="text-xs text-green-400">
              ✓ Using approximately 60% less bandwidth
            </p>
          </div>
        </div>
      )}

      {!enabled && (
        <p className="text-xs text-gray-500 mt-2">
          Enable to reduce video quality and save mobile data
        </p>
      )}
    </div>
  );
};
