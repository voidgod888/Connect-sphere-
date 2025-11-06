import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { settingsQueries, interestQueries, languageQueries, database } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const settingsRouter = express.Router();

// Get user settings
settingsRouter.get('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Get advanced settings
    let settings = settingsQueries.getUserSettings.get(userId);
    if (!settings) {
      settingsQueries.createUserSettings.run(userId);
      settings = settingsQueries.getUserSettings.get(userId);
    }

    // Get interests
    const interests = interestQueries.getUserInterests.all(userId);

    // Get languages
    const languages = languageQueries.getUserLanguages.all(userId);

    res.json({
      theme: settings.theme,
      connectionQuality: settings.connection_quality,
      autoSkipMismatch: Boolean(settings.auto_skip_mismatch),
      minChatDuration: settings.min_chat_duration,
      profanityFilter: settings.profanity_filter,
      showTypingIndicator: Boolean(settings.show_typing_indicator),
      safeMode: Boolean(settings.safe_mode),
      ageRange: {
        min: settings.age_range_min || 18,
        max: settings.age_range_max || 99
      },
      interests: interests.map(i => i.interest),
      languages: languages.map(l => l.language)
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update advanced settings
settingsRouter.put('/advanced', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const {
      theme,
      connectionQuality,
      autoSkipMismatch,
      minChatDuration,
      profanityFilter,
      showTypingIndicator,
      safeMode,
      ageRange
    } = req.body;

    // Ensure settings row exists
    settingsQueries.createUserSettings.run(userId);

    // Update settings
    settingsQueries.updateUserSettings.run(
      theme || 'dark',
      connectionQuality || 'auto',
      autoSkipMismatch ? 1 : 0,
      minChatDuration || 0,
      profanityFilter || 'medium',
      showTypingIndicator !== false ? 1 : 0,
      safeMode ? 1 : 0,
      ageRange?.min || 18,
      ageRange?.max || 99,
      userId
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update interests
settingsRouter.put('/interests', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({ error: 'Interests must be an array' });
    }

    // Remove existing interests
    interestQueries.removeUserInterests.run(userId);

    // Add new interests
    for (const interest of interests.slice(0, 5)) {
      const id = uuidv4();
      interestQueries.addInterest.run(id, userId, interest);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating interests:', error);
    res.status(500).json({ error: 'Failed to update interests' });
  }
});

// Update languages
settingsRouter.put('/languages', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { languages } = req.body;

    if (!Array.isArray(languages)) {
      return res.status(400).json({ error: 'Languages must be an array' });
    }

    // Remove existing languages
    languageQueries.removeUserLanguages.run(userId);

    // Add new languages
    for (const language of languages.slice(0, 3)) {
      const id = uuidv4();
      languageQueries.addLanguage.run(id, userId, language);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating languages:', error);
    res.status(500).json({ error: 'Failed to update languages' });
  }
});
