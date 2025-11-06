# 🚀 Quick Start Guide - New Features

This guide will help you quickly integrate and use the new features added to ConnectSphere.

## 📦 Installation

No new dependencies needed! All features use existing libraries:
- React
- TypeScript
- Tailwind CSS
- Socket.io
- Better-sqlite3 (backend)

## 🎯 Quick Integration Steps

### 1. Database Setup

The database will auto-initialize with new tables on server start. Just run:

```bash
cd server
npm install
npm start
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

### 3. Using Individual Features

#### Show User Stats
```typescript
import { StatsPanel } from './components/StatsPanel';
import { apiService } from './services/api';

// Load stats
const stats = await apiService.getUserStats();

// Display panel
<StatsPanel stats={stats} onClose={handleClose} />
```

#### Show Premium Modal
```typescript
import { PremiumModal } from './components/PremiumModal';

<PremiumModal
  currentTier={user.subscriptionTier}
  userCoins={user.coins}
  onClose={handleClose}
  onUpgrade={(tier) => apiService.upgradeSubscription(tier)}
  onPurchaseCoins={(amount) => apiService.purchaseCoins(amount)}
/>
```

#### Add Connection Quality Monitoring
```typescript
import { ConnectionQualityIndicator } from './components/ConnectionQualityIndicator';

<ConnectionQualityIndicator 
  stream={localStream}
  onPresetChange={handleQualityChange}
/>
```

#### Enable Bandwidth Saver
```typescript
import { BandwidthSaverMode } from './components/BandwidthSaverMode';

<BandwidthSaverMode
  stream={localStream}
  enabled={bandwidthSaverEnabled}
  onToggle={setBandwidthSaverEnabled}
/>
```

#### Enhanced Settings Screen
The `SettingsScreen` component is already updated with:
- Interest tags selector
- Language selector
- Age range filter
- Safe mode toggle

No additional changes needed!

#### Add Interest/Language Selection
```typescript
import { InterestSelector } from './components/InterestSelector';
import { LanguageSelector } from './components/LanguageSelector';

<InterestSelector
  selectedInterests={interests}
  onChange={setInterests}
  maxSelection={5}
/>

<LanguageSelector
  selectedLanguages={languages}
  onChange={setLanguages}
  maxSelection={3}
/>
```

## 🎨 Theme System

Apply themes to your app:

```typescript
import { ThemeSelector } from './components/ThemeSelector';
import { Theme } from './types';

// In component
const [theme, setTheme] = useState(Theme.Dark);

<ThemeSelector 
  currentTheme={theme} 
  onChange={setTheme} 
/>

// Apply theme
document.documentElement.setAttribute('data-theme', theme);
```

## ⌨️ Keyboard Shortcuts

Already integrated! Users can press `Ctrl+K` to view shortcuts anytime.

To add the shortcuts panel:

```typescript
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';

{showShortcuts && <KeyboardShortcutsPanel onClose={handleClose} />}
```

## 🏆 Achievements

Achievements unlock automatically when users meet criteria. To display:

```typescript
import { AchievementList } from './components/AchievementBadge';

const stats = await apiService.getUserStats();
<AchievementList achievements={stats.achievements} />
```

## 🎯 Leaderboard

```typescript
import { LeaderboardPanel } from './components/LeaderboardPanel';

const leaderboard = await apiService.getLeaderboard(100);

<LeaderboardPanel
  entries={leaderboard.entries}
  currentUserId={user.id}
  onClose={handleClose}
/>
```

## 🛡️ Enhanced Reporting

```typescript
import { EnhancedReportModal } from './components/EnhancedReportModal';

<EnhancedReportModal
  onReport={(category, description) => {
    // Handle report
  }}
  onClose={handleClose}
/>
```

## 🔧 Network Diagnostics

```typescript
import { NetworkDiagnostics } from './components/NetworkDiagnostics';

<NetworkDiagnostics onClose={handleClose} />
```

## 📊 Queue Statistics

```typescript
import { QueueStatsDisplay } from './components/QueueStatsDisplay';

<QueueStatsDisplay stats={queueStats} />
```

## 🎮 Advanced Settings

```typescript
import { AdvancedSettingsPanel } from './components/AdvancedSettingsPanel';

<AdvancedSettingsPanel
  settings={advancedSettings}
  onChange={handleSave}
  onClose={handleClose}
/>
```

## 💡 Pro Tips

1. **Load user data on login**: Call `apiService.getUserStats()` after authentication
2. **Monitor connection**: Start `connectionOptimization.startMonitoring()` when stream is available
3. **Save settings**: Call `apiService.updateAdvancedSettings()` when user changes settings
4. **Track achievements**: Backend automatically updates achievement progress
5. **Update streak**: Daily login automatically updates streak counter

## 🔌 API Endpoints Reference

### Stats
- `GET /api/stats/me` - Get user statistics
- `GET /api/stats/leaderboard` - Get leaderboard
- `POST /api/stats/rate` - Rate a user

### Premium
- `POST /api/premium/upgrade` - Upgrade subscription
- `POST /api/premium/coins/purchase` - Buy coins
- `POST /api/premium/boost` - Boost profile
- `POST /api/premium/username` - Set username

### Settings
- `GET /api/settings/me` - Get settings
- `PUT /api/settings/advanced` - Update advanced settings
- `PUT /api/settings/interests` - Update interests
- `PUT /api/settings/languages` - Update languages

## 🎨 Styling

All components use Tailwind CSS and match the existing app design. The color scheme is consistent:
- Blue/Indigo for primary actions
- Green for success states
- Red for errors/reports
- Purple/Pink for premium features
- Yellow for coins/rewards

## 🐛 Common Issues

**Achievement not unlocking?**
- Check backend logs for progress updates
- Ensure user_stats row exists

**Connection quality always poor?**
- Check if server is accessible at `/api/health`
- Verify WebSocket connection

**Premium features not working?**
- Verify subscription_tier in database
- Check if coins balance is correct

**Themes not applying?**
- Ensure `data-theme` attribute is set on root element
- Check Tailwind configuration includes theme variants

## 📚 Learn More

- See `FEATURES_ADDED.md` for comprehensive feature documentation
- See `INTEGRATION_EXAMPLE.tsx` for complete integration example
- Check individual component files for prop interfaces

## ✅ Quick Test

After integration, test:
1. ✓ Stats panel opens and displays data
2. ✓ Premium modal shows subscription tiers
3. ✓ Connection quality indicator displays
4. ✓ Settings save successfully
5. ✓ Keyboard shortcuts work
6. ✓ Leaderboard displays
7. ✓ Enhanced reporting modal opens

## 🚀 Next Steps

1. Customize coin packages and prices
2. Add real payment integration (Stripe/PayPal)
3. Implement WebRTC stats for accurate connection monitoring
4. Add more achievements
5. Create admin dashboard for moderation
6. Add virtual gifts catalog

---

Need help? Check the comprehensive `FEATURES_ADDED.md` documentation or review `INTEGRATION_EXAMPLE.tsx` for detailed examples.

Happy coding! 🎉
