/**
 * Integration Example - How to use the new features in App.tsx
 * This file shows example code for integrating all the new features
 */

import React, { useState, useEffect } from 'react';
import { 
  User, UserStats, AdvancedSettings, SubscriptionTier, Theme,
  LeaderboardEntry, Achievement, QueueStats
} from './types';
import { apiService } from './services/api';
import { connectionOptimization } from './services/connectionOptimization';

// Import new components
import { StatsPanel } from './components/StatsPanel';
import { PremiumModal } from './components/PremiumModal';
import { AdvancedSettingsPanel } from './components/AdvancedSettingsPanel';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { EnhancedReportModal } from './components/EnhancedReportModal';
import { ConnectionQualityIndicator } from './components/ConnectionQualityIndicator';
import { BandwidthSaverMode } from './components/BandwidthSaverMode';
import { NetworkDiagnostics } from './components/NetworkDiagnostics';
import { ThemeSelector } from './components/ThemeSelector';

// Example state additions for App component
const AppIntegrationExample = () => {
  // Existing state...
  const [user, setUser] = useState<User | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // NEW STATE FOR FEATURES
  
  // Stats & Gamification
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Premium
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.Free);

  // Settings
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    connectionQuality: 'auto',
    autoSkipMismatch: false,
    minChatDuration: 0,
    profanityFilter: 'medium',
    showTypingIndicator: true
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(Theme.Dark);

  // UI Helpers
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNetworkDiagnostics, setShowNetworkDiagnostics] = useState(false);

  // Security
  const [showEnhancedReport, setShowEnhancedReport] = useState(false);

  // Connection
  const [bandwidthSaverEnabled, setBandwidthSaverEnabled] = useState(false);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    activeUsers: 0,
    estimatedWait: 0
  });

  // LOAD USER DATA ON MOUNT
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load stats
      const stats = await apiService.getUserStats();
      setUserStats(stats);

      // Load settings
      const settings = await apiService.getUserSettings();
      setAdvancedSettings(settings);
      setCurrentTheme(settings.theme || Theme.Dark);

      // Update user coins and subscription
      setUserCoins(user?.coins || 0);
      setSubscriptionTier(user?.subscriptionTier || SubscriptionTier.Free);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // PREMIUM HANDLERS
  const handleUpgradeSubscription = async (tier: SubscriptionTier) => {
    try {
      const response = await apiService.upgradeSubscription(tier);
      setSubscriptionTier(response.subscription);
      setUserCoins(response.coins);
      showToast('Subscription upgraded successfully!', 'success');
    } catch (error) {
      showToast('Failed to upgrade subscription', 'error');
    }
  };

  const handlePurchaseCoins = async (amount: number) => {
    try {
      const response = await apiService.purchaseCoins(amount);
      setUserCoins(response.coins);
      showToast(`Purchased ${amount} coins!`, 'success');
    } catch (error) {
      showToast('Failed to purchase coins', 'error');
    }
  };

  const handleBoostProfile = async () => {
    try {
      const response = await apiService.boostProfile();
      setUserCoins(response.coins);
      showToast('Profile boosted for 24 hours!', 'success');
    } catch (error) {
      showToast('Failed to boost profile', 'error');
    }
  };

  // STATS HANDLERS
  const handleViewLeaderboard = async () => {
    try {
      const response = await apiService.getLeaderboard(100);
      setLeaderboardEntries(response.entries);
      setShowLeaderboard(true);
    } catch (error) {
      showToast('Failed to load leaderboard', 'error');
    }
  };

  const handleRatePartner = async (partnerId: string, matchId: string, rating: number) => {
    try {
      await apiService.rateUser(partnerId, matchId, rating);
      showToast('Thanks for your rating!', 'success');
    } catch (error) {
      showToast('Failed to submit rating', 'error');
    }
  };

  // SETTINGS HANDLERS
  const handleSaveAdvancedSettings = async (settings: AdvancedSettings) => {
    try {
      await apiService.updateAdvancedSettings(settings);
      setAdvancedSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save to backend
    apiService.updateAdvancedSettings({ ...advancedSettings, theme });
  };

  // SECURITY HANDLERS
  const handleEnhancedReport = async (category: any, description: string) => {
    try {
      // Call report endpoint with enhanced data
      showToast('User reported successfully', 'success');
      setShowEnhancedReport(false);
    } catch (error) {
      showToast('Failed to submit report', 'error');
    }
  };

  // CONNECTION HANDLERS
  const handleQualityPresetChange = (preset: any) => {
    connectionOptimization.setQualityPreset(preset);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const constraints = connectionOptimization.getVideoConstraints(preset);
      videoTrack.applyConstraints(constraints);
    }
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Ctrl/Cmd + S for settings
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowAdvancedSettings(true);
      }

      // R for report (when in chat)
      if (e.key === 'r' && chatState === 'connected') {
        e.preventDefault();
        setShowEnhancedReport(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Your existing toast implementation
    console.log(`[${type}] ${message}`);
  };

  return (
    <div className="app" data-theme={currentTheme}>
      {/* Your existing app content */}

      {/* ADD TO HEADER - Stats & Premium Buttons */}
      <header className="app-header">
        <div className="header-actions">
          {/* Coins Display */}
          <button 
            onClick={() => setShowPremiumModal(true)}
            className="coin-display"
          >
            <span>🪙</span>
            <span>{userCoins}</span>
          </button>

          {/* Stats Button */}
          <button onClick={() => setShowStatsPanel(true)}>
            📊 Stats
          </button>

          {/* Leaderboard Button */}
          <button onClick={handleViewLeaderboard}>
            🏆 Leaderboard
          </button>

          {/* Settings Button */}
          <button onClick={() => setShowAdvancedSettings(true)}>
            ⚙️ Settings
          </button>

          {/* Premium Badge */}
          {subscriptionTier !== SubscriptionTier.Free && (
            <span className="premium-badge">
              {subscriptionTier === SubscriptionTier.VIP ? '👑 VIP' : '⭐ Premium'}
            </span>
          )}
        </div>
      </header>

      {/* ADD TO CHAT SCREEN - Connection Quality & Bandwidth Saver */}
      {localStream && (
        <div className="connection-controls">
          <ConnectionQualityIndicator 
            stream={localStream}
            onPresetChange={handleQualityPresetChange}
          />
          
          <BandwidthSaverMode
            stream={localStream}
            enabled={bandwidthSaverEnabled}
            onToggle={setBandwidthSaverEnabled}
          />
          
          <button onClick={() => setShowNetworkDiagnostics(true)}>
            🔧 Diagnostics
          </button>
        </div>
      )}

      {/* MODALS */}
      {showStatsPanel && userStats && (
        <StatsPanel 
          stats={userStats} 
          onClose={() => setShowStatsPanel(false)} 
        />
      )}

      {showPremiumModal && (
        <PremiumModal
          currentTier={subscriptionTier}
          userCoins={userCoins}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgradeSubscription}
          onPurchaseCoins={handlePurchaseCoins}
        />
      )}

      {showAdvancedSettings && (
        <AdvancedSettingsPanel
          settings={advancedSettings}
          onChange={handleSaveAdvancedSettings}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}

      {showKeyboardShortcuts && (
        <KeyboardShortcutsPanel
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardPanel
          entries={leaderboardEntries}
          currentUserId={user?.id || ''}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showEnhancedReport && (
        <EnhancedReportModal
          onReport={handleEnhancedReport}
          onClose={() => setShowEnhancedReport(false)}
        />
      )}

      {showNetworkDiagnostics && (
        <NetworkDiagnostics
          onClose={() => setShowNetworkDiagnostics(false)}
        />
      )}
    </div>
  );
};

export default AppIntegrationExample;
