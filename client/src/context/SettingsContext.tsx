import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SettingsState, AppSettings, LLMSettings } from '../types';

type SettingsAction = 
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: 'app' | 'llm' }
  | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_LLM_SETTINGS'; payload: Partial<LLMSettings> }
  | { type: 'RESET_APP_SETTINGS' }
  | { type: 'RESET_LLM_SETTINGS' };

const defaultAppSettings: AppSettings = {
  sessionDuration: 15,
  extensionDuration: 15,
  extensionWarningTime: 2,
  autoConnect: true,
  soundEnabled: true
};

const defaultLLMSettings: LLMSettings = {
  model: 'moonshotai/Kimi-K2-Instruct',
  temperature: 0.8,
  maxTokens: 300,
  systemPromptCustomization: false,
  responseLength: 'medium'
};

const initialState: SettingsState = {
  isOpen: false,
  activeTab: 'app',
  appSettings: defaultAppSettings,
  llmSettings: defaultLLMSettings
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_SETTINGS_OPEN':
      return { ...state, isOpen: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'UPDATE_APP_SETTINGS':
      return { 
        ...state, 
        appSettings: { ...state.appSettings, ...action.payload } 
      };
    case 'UPDATE_LLM_SETTINGS':
      return { 
        ...state, 
        llmSettings: { ...state.llmSettings, ...action.payload } 
      };
    case 'RESET_APP_SETTINGS':
      return { 
        ...state, 
        appSettings: defaultAppSettings 
      };
    case 'RESET_LLM_SETTINGS':
      return { 
        ...state, 
        llmSettings: defaultLLMSettings 
      };
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  saveSettings: () => void;
  loadSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialState);

  const saveSettings = () => {
    try {
      const settingsToSave = {
        appSettings: settings.appSettings,
        llmSettings: settings.llmSettings
      };
      // Note: Using in-memory storage since localStorage isn't available
      (window as any).quicktalkSettings = settingsToSave;
      console.log('Settings saved to memory');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadSettings = () => {
    try {
      const savedSettings = (window as any).quicktalkSettings;
      if (savedSettings) {
        if (savedSettings.appSettings) {
          dispatch({ type: 'UPDATE_APP_SETTINGS', payload: savedSettings.appSettings });
        }
        if (savedSettings.llmSettings) {
          dispatch({ type: 'UPDATE_LLM_SETTINGS', payload: savedSettings.llmSettings });
        }
        console.log('Settings loaded from memory');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save when settings change
  useEffect(() => {
    saveSettings();
  }, [settings.appSettings, settings.llmSettings]);

  return (
    <SettingsContext.Provider value={{ settings, dispatch, saveSettings, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};