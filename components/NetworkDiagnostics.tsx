import React, { useState, useEffect } from 'react';
import { connectionOptimization } from '../services/connectionOptimization';

interface NetworkDiagnosticsProps {
  onClose: () => void;
}

export const NetworkDiagnostics: React.FC<NetworkDiagnosticsProps> = ({ onClose }) => {
  const [report, setReport] = useState(connectionOptimization.getQualityReport());
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<{
    download: number;
    upload: number;
    latency: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(connectionOptimization.getQualityReport());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const runSpeedTest = async () => {
    setIsRunningTest(true);
    
    // Simulate speed test (in production, use real speed test API)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulated results
    const results = {
      download: Math.random() * 50 + 10, // 10-60 Mbps
      upload: Math.random() * 20 + 5,    // 5-25 Mbps
      latency: Math.random() * 100 + 20  // 20-120 ms
    };

    setTestResults(results);
    setIsRunningTest(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Network Diagnostics</h2>
            <p className="text-gray-400 text-sm">Monitor and optimize your connection</p>
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
          {/* Current Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Current Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Quality</p>
                <p className="text-xl font-bold text-white capitalize">{report.quality}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Latency</p>
                <p className="text-xl font-bold text-blue-400">{report.latency}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Bandwidth</p>
                <p className="text-xl font-bold text-green-400">{report.bandwidth}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Packet Loss</p>
                <p className="text-xl font-bold text-yellow-400">{report.packetLoss}</p>
              </div>
            </div>
          </div>

          {/* Speed Test */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Speed Test</h3>
              <button
                onClick={runSpeedTest}
                disabled={isRunningTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isRunningTest ? 'Testing...' : 'Run Test'}
              </button>
            </div>

            {isRunningTest && (
              <div className="bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center animate-fadeIn">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="animate-spin" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-blue-600"
                      strokeDasharray="70 200"
                    />
                  </svg>
                </div>
                <p className="text-gray-300">Running speed test...</p>
              </div>
            )}

            {testResults && !isRunningTest && (
              <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Download</p>
                  <p className="text-2xl font-bold text-blue-400">{testResults.download.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Mbps</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Upload</p>
                  <p className="text-2xl font-bold text-green-400">{testResults.upload.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Mbps</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Ping</p>
                  <p className="text-2xl font-bold text-purple-400">{testResults.latency.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">ms</p>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
            <div className="space-y-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-300">{report.recommendation}</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>💡</span> Tips to Improve Connection
                </h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Move closer to your WiFi router</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Close bandwidth-heavy applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Use wired ethernet instead of WiFi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Enable bandwidth saver mode in settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
