const express = require('express');
const settingsManager = require('../managers/settingsManager');

const router = express.Router();

// Get all settings
router.get('/settings', (req, res) => {
  try {
    const settings = settingsManager.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update app settings
router.patch('/settings/app', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate app settings
    const validFields = ['sessionDuration', 'extensionDuration', 'extensionWarningTime', 'autoConnect', 'soundEnabled'];
    const filteredUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (validFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    const updatedSettings = await settingsManager.updateAppSettings(filteredUpdates);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({ error: 'Failed to update app settings' });
  }
});

// Update LLM settings
router.patch('/settings/llm', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate LLM settings
    const validFields = [
      'model', 
      'temperature', 
      'maxTokens', 
      'systemPromptCustomization', 
      'responseLength',
      'customSystemPrompt',
      'authorsNote',
      'contextTemplate'
    ];
    const filteredUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (validFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    const updatedSettings = await settingsManager.updateLLMSettings(filteredUpdates);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating LLM settings:', error);
    res.status(500).json({ error: 'Failed to update LLM settings' });
  }
});

// Reset app settings to defaults
router.post('/settings/app/reset', async (req, res) => {
  try {
    const resetSettings = await settingsManager.resetAppSettings();
    res.json(resetSettings);
  } catch (error) {
    console.error('Error resetting app settings:', error);
    res.status(500).json({ error: 'Failed to reset app settings' });
  }
});

// Reset LLM settings to defaults
router.post('/settings/llm/reset', async (req, res) => {
  try {
    const resetSettings = await settingsManager.resetLLMSettings();
    res.json(resetSettings);
  } catch (error) {
    console.error('Error resetting LLM settings:', error);
    res.status(500).json({ error: 'Failed to reset LLM settings' });
  }
});

// Reset all settings to defaults
router.post('/settings/reset', async (req, res) => {
  try {
    const resetSettings = await settingsManager.resetAllSettings();
    res.json(resetSettings);
  } catch (error) {
    console.error('Error resetting all settings:', error);
    res.status(500).json({ error: 'Failed to reset all settings' });
  }
});

module.exports = router;