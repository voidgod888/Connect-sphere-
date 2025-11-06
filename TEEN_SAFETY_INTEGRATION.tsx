/**
 * Teen Safety Integration Example
 * How to integrate age verification and teen safety features
 */

import React, { useState, useEffect } from 'react';
import { AgeVerification } from './components/AgeVerification';
import { TeenSafetyMode, TeenSafetyBanner } from './components/TeenSafetyMode';
import { apiService } from './services/api';

// Add to your App.tsx state
const TeenSafetyIntegration = () => {
  const [user, setUser] = useState<any>(null);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showTeenSafety, setShowTeenSafety] = useState(false);
  const [userAge, setUserAge] = useState<number | undefined>();
  const [hasAcknowledgedSafety, setHasAcknowledgedSafety] = useState(false);

  // Check if user needs age verification
  useEffect(() => {
    if (user && !user.age) {
      setShowAgeVerification(true);
    } else if (user && user.age) {
      setUserAge(user.age);
      
      // Show teen safety modal on first login
      const hasSeenSafety = localStorage.getItem(`teen_safety_${user.id}`);
      if (user.age < 18 && !hasSeenSafety) {
        setShowTeenSafety(true);
      }
    }
  }, [user]);

  const handleAgeVerification = async (age: number) => {
    try {
      // Save age to backend
      // Note: You would need to add an age update endpoint to the backend API
      // await apiService.updateUserAge(age);
      
      // Update user object
      setUser({ ...user, age });
      setUserAge(age);
      setShowAgeVerification(false);

      // Show teen safety if under 18
      if (age < 18) {
        setShowTeenSafety(true);
      }

      // Apply teen safety defaults on backend
      await fetch('/api/settings/apply-teen-safety', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error saving age:', error);
    }
  };

  const handleTeenSafetyAcknowledge = () => {
    setShowTeenSafety(false);
    setHasAcknowledgedSafety(true);
    // Store in localStorage so we don't show again
    localStorage.setItem(`teen_safety_${user.id}`, 'true');
  };

  const handleViewSafetyGuidelines = () => {
    setShowTeenSafety(true);
  };

  return (
    <div className="app">
      {/* Age Verification Modal */}
      {showAgeVerification && (
        <AgeVerification
          onVerify={handleAgeVerification}
          onCancel={() => {
            // Handle cancel - maybe logout or go back
            setShowAgeVerification(false);
          }}
        />
      )}

      {/* Teen Safety Guidelines Modal */}
      {showTeenSafety && userAge && userAge < 18 && (
        <TeenSafetyMode
          userAge={userAge}
          onAcknowledge={handleTeenSafetyAcknowledge}
        />
      )}

      {/* Show teen safety banner during chat */}
      {userAge && userAge < 18 && hasAcknowledgedSafety && (
        <TeenSafetyBanner onViewGuidelines={handleViewSafetyGuidelines} />
      )}

      {/* Rest of your app */}
    </div>
  );
};

// Backend Integration: Add this route to server/routes/settings.js
/*
import { applyTeenSafetyDefaults } from '../middleware/teenSafety.js';

settingsRouter.post('/apply-teen-safety', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    applyTeenSafetyDefaults(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error applying teen safety defaults:', error);
    res.status(500).json({ error: 'Failed to apply teen safety defaults' });
  }
});
*/

// Matching Service: Validate teen safety rules before creating match
/*
import { validateTeenSafetyRules } from '../middleware/teenSafety.js';

// In your matching logic
const validation = validateTeenSafetyRules(user1Id, user2Id);
if (!validation.allowed) {
  return {
    error: validation.reason || 'Cannot create match due to safety rules'
  };
}
*/

// Session Management: Enforce time limits
/*
import { getSessionTimeLimits } from '../middleware/teenSafety.js';

// In your chat handler
const timeLimits = getSessionTimeLimits(userId);
if (timeLimits) {
  // Set up timer to warn at timeLimits.warningAt minutes
  // Auto-disconnect at timeLimits.maxSessionLength minutes
  
  setTimeout(() => {
    socket.emit('session-warning', {
      minutesRemaining: timeLimits.maxSessionLength - timeLimits.warningAt
    });
  }, timeLimits.warningAt * 60 * 1000);

  setTimeout(() => {
    socket.emit('session-ended', {
      reason: 'Time limit reached'
    });
    // End the chat session
  }, timeLimits.maxSessionLength * 60 * 1000);
}
*/

export default TeenSafetyIntegration;

// Example of displaying session time limit warning in UI
export const SessionTimeWarning: React.FC<{ minutesRemaining: number }> = ({ minutesRemaining }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn z-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏰</span>
        <div>
          <p className="font-semibold">Session Time Warning</p>
          <p className="text-sm">
            {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''} remaining in this session
          </p>
        </div>
      </div>
    </div>
  );
};

// Example of displaying daily usage limit
export const DailyUsageWarning: React.FC<{ minutesUsed: number; limit: number }> = ({ 
  minutesUsed, 
  limit 
}) => {
  const percentUsed = (minutesUsed / limit) * 100;
  
  if (percentUsed < 80) return null;

  return (
    <div className="bg-orange-500/20 border-l-4 border-orange-500 px-4 py-3 mb-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📊</span>
          <div>
            <p className="text-white font-semibold text-sm">Daily Usage Limit</p>
            <p className="text-gray-300 text-xs">
              {minutesUsed} / {limit} minutes used today
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-orange-400 font-bold text-lg">{Math.round(percentUsed)}%</p>
        </div>
      </div>
      <div className="mt-2 bg-gray-700 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
    </div>
  );
};
