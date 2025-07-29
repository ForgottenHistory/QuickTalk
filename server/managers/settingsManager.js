const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');
const DATA_DIR = path.join(__dirname, '../data');
const IMAGES_DIR = path.join(__dirname, '../data/images');

// Default settings
const defaultSettings = {
  appSettings: {
    sessionDuration: 15,
    extensionDuration: 15,
    extensionWarningTime: 2,
    autoConnect: true,
    soundEnabled: true
  },
  llmSettings: {
    model: 'moonshotai/Kimi-K2-Instruct',
    temperature: 0.8,
    maxTokens: 300,
    systemPromptCustomization: false,
    responseLength: 'medium',
    customSystemPrompt: '',
    authorsNote: '',
    contextTemplate: `{{#if system}}{{system}}

# **Roleplay Context**
{{/if}}{{#if description}}## {{char}}'s Description:
{{description}}

{{/if}}## {{char}}'s Personality:
{{personality}}

## User's Persona:
A human conversing with AI characters.

## Scenario:
You are {{char}} engaging in a conversation with a human user.
{{#if examples}}
## {{char}}'s Example Response:
{{examples}}
{{/if}}
### **End of Roleplay Context**`
  }
};

class SettingsManager {
  constructor() {
    this.settings = { ...defaultSettings };
    this.saveInProgress = false;
    this.ensureDataDirectory();
    this.loadSettings();
  }

  async ensureDataDirectory() {
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('Created data directory:', DATA_DIR);
    }
  }

  async loadSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8');
      const savedSettings = JSON.parse(data);
      
      // Merge with defaults to ensure all fields exist
      this.settings = {
        appSettings: { ...defaultSettings.appSettings, ...savedSettings.appSettings },
        llmSettings: { ...defaultSettings.llmSettings, ...savedSettings.llmSettings }
      };
      
      console.log('Settings loaded from file');
    } catch (error) {
      console.log('No settings file found, using defaults');
      await this.saveSettings();
    }
  }

  async saveSettings() {
    // Prevent concurrent saves and potential file conflicts
    if (this.saveInProgress) {
      console.log('Save already in progress, skipping...');
      return;
    }

    this.saveInProgress = true;
    
    try {
      await this.ensureDataDirectory();
      
      // Use atomic write with temporary file to prevent partial writes
      const tempFile = SETTINGS_FILE + '.tmp';
      const settingsData = JSON.stringify(this.settings, null, 2);
      
      await fs.writeFile(tempFile, settingsData);
      await fs.rename(tempFile, SETTINGS_FILE);
      
      console.log('Settings saved to file');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    } finally {
      this.saveInProgress = false;
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  async updateAppSettings(updates) {
    this.settings.appSettings = { ...this.settings.appSettings, ...updates };
    await this.saveSettings();
    return this.settings.appSettings;
  }

  async updateLLMSettings(updates) {
    this.settings.llmSettings = { ...this.settings.llmSettings, ...updates };
    await this.saveSettings();
    return this.settings.llmSettings;
  }

  async resetAppSettings() {
    this.settings.appSettings = { ...defaultSettings.appSettings };
    await this.saveSettings();
    return this.settings.appSettings;
  }

  async resetLLMSettings() {
    this.settings.llmSettings = { ...defaultSettings.llmSettings };
    await this.saveSettings();
    return this.settings.llmSettings;
  }

  async resetAllSettings() {
    this.settings = { ...defaultSettings };
    await this.saveSettings();
    return this.settings;
  }

  // Get specific setting values
  getSessionDuration() {
    return this.settings.appSettings.sessionDuration;
  }

  getExtensionDuration() {
    return this.settings.appSettings.extensionDuration;
  }

  getExtensionWarningTime() {
    return this.settings.appSettings.extensionWarningTime;
  }

  getLLMModel() {
    return this.settings.llmSettings.model;
  }

  getTemperature() {
    return this.settings.llmSettings.temperature;
  }

  getMaxTokens() {
    return this.settings.llmSettings.maxTokens;
  }

  getResponseLength() {
    return this.settings.llmSettings.responseLength;
  }

  getCustomSystemPrompt() {
    return this.settings.llmSettings.customSystemPrompt;
  }

  getAuthorsNote() {
    return this.settings.llmSettings.authorsNote;
  }

  getSystemPromptCustomization() {
    return this.settings.llmSettings.systemPromptCustomization;
  }

  getContextTemplate() {
    return this.settings.llmSettings.contextTemplate;
  }
}

module.exports = new SettingsManager();