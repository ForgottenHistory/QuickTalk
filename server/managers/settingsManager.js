const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');
const DATA_DIR = path.join(__dirname, '../data');

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

{{/if}}# **Roleplay Context**

{{#if description}}## {{char}}'s Description:
{{description}}

{{/if}}{{#if personality}}## {{char}}'s Personality:
{{personality}}

{{/if}}## User's Persona:
A human conversing with AI characters.

## Scenario:
You are {{char}} engaging in a conversation with a human user.

{{#if examples}}## {{char}}'s Example Response:
{{examples}}

{{/if}}### **End of Roleplay Context**`
  }
};

class SettingsManager {
  constructor() {
    this.settings = { ...defaultSettings };
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
    try {
      await this.ensureDataDirectory();
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
      console.log('Settings saved to file');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
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

  getContextTemplate() {
    return this.settings.llmSettings.contextTemplate;
  }

  getSystemPromptCustomization() {
    return this.settings.llmSettings.systemPromptCustomization;
  }
}

module.exports = new SettingsManager();