import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SettingsState, AppSettings, LLMSettings } from '../types';
import { settingsService } from '../services/settingsService';

type SettingsAction = 
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: 'app' | 'llm' }
  | { type: 'UPDATE_APP_SETTINGS_LOCAL'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_LLM_SETTINGS_LOCAL'; payload: Partial<LLMSettings> }
  | { type: 'SET_APP_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LLM_SETTINGS'; payload: LLMSettings }
  | { type: 'SET_SAVED_APP_SETTINGS'; payload: AppSettings }
  | { type: 'SET_SAVED_LLM_SETTINGS'; payload: LLMSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVE_SUCCESS'; payload: boolean }
  | { type: 'SET_INITIAL_LOAD_COMPLETE'; payload: boolean };

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
  responseLength: 'medium',
  customSystemPrompt: '',
  authorsNote: ''
};

interface ExtendedSettingsState extends SettingsState {
  isLoading: boolean;
  error: string | null;
  savedAppSettings: AppSettings; // Server state
  savedLLMSettings: LLMSettings; // Server state
  hasUnsavedChanges: boolean;
  saveSuccess: boolean;
  initialLoadComplete: boolean;
}

const initialState: ExtendedSettingsState = {
  isOpen: false,
  activeTab: 'app',
  appSettings: defaultAppSettings,
  llmSettings: defaultLLMSettings,
  savedAppSettings: defaultAppSettings,
  savedLLMSettings: defaultLLMSettings,
  isLoading: true, // Start with loading true
  error: null,
  hasUnsavedChanges: false,
  saveSuccess: false,
  initialLoadComplete: false
};

const settingsReducer = (state: ExtendedSettingsState, action: SettingsAction): ExtendedSettingsState => {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_SETTINGS_OPEN':
      return { ...state, isOpen: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'UPDATE_APP_SETTINGS_LOCAL':
      const newAppSettings = { ...state.appSettings, ...action.payload };
      return { 
        ...state, 
        appSettings: newAppSettings,
        hasUnsavedChanges: JSON.stringify(newAppSettings) !== JSON.stringify(state.savedAppSettings) ||
                          JSON.stringify(state.llmSettings) !== JSON.stringify(state.savedLLMSettings)
      };
    case 'UPDATE_LLM_SETTINGS_LOCAL':
      const newLLMSettings = { ...state.llmSettings, ...action.payload };
      return { 
        ...state, 
        llmSettings: newLLMSettings,
        hasUnsavedChanges: JSON.stringify(state.appSettings) !== JSON.stringify(state.savedAppSettings) ||
                          JSON.stringify(newLLMSettings) !== JSON.stringify(state.savedLLMSettings)
      };
    case 'SET_APP_SETTINGS':
      return { ...state, appSettings: action.payload };
    case 'SET_LLM_SETTINGS':
      return { ...state, llmSettings: action.payload };
    case 'SET_SAVED_APP_SETTINGS':
      return { 
        ...state, 
        savedAppSettings: action.payload,
        appSettings: action.payload,
        hasUnsavedChanges: JSON.stringify(action.payload) !== JSON.stringify(state.savedAppSettings) ||
                          JSON.stringify(state.llmSettings) !== JSON.stringify(state.savedLLMSettings)
      };
    case 'SET_SAVED_LLM_SETTINGS':
      return { 
        ...state, 
        savedLLMSettings: action.payload,
        llmSettings: action.payload,
        hasUnsavedChanges: JSON.stringify(state.appSettings) !== JSON.stringify(state.savedAppSettings) ||
                          JSON.stringify(action.payload) !== JSON.stringify(state.savedLLMSettings)
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SAVE_SUCCESS':
      return { ...state, saveSuccess: action.payload };
    case 'SET_INITIAL_LOAD_COMPLETE':
      return { ...state, initialLoadComplete: action.payload };
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: ExtendedSettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  saveAllSettings: () => Promise<void>;
  resetAppSettings: () => Promise<void>;
  resetLLMSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  discardChanges: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialState);

  const handleError = (error: any) => {
    console.error('Settings error:', error);
    const errorMessage = error.message || 'An error occurred';
    
    // More user-friendly error messages
    let displayMessage = errorMessage;
    if (errorMessage.includes('404')) {
      displayMessage = 'Settings service not available - using defaults';
    } else if (errorMessage.includes('Failed to fetch')) {
      displayMessage = 'Cannot connect to server - using defaults';
    }
    
    dispatch({ type: 'SET_ERROR', payload: displayMessage });
    setTimeout(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, 5000);
  };

  const loadSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await settingsService.getSettings();
      
      // Ensure new fields have defaults
      const llmSettingsWithDefaults = {
        ...defaultLLMSettings,
        ...data.llmSettings
      };
      
      dispatch({ type: 'SET_SAVED_APP_SETTINGS', payload: data.appSettings });
      dispatch({ type: 'SET_SAVED_LLM_SETTINGS', payload: llmSettingsWithDefaults });
      dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', payload: true });
    } catch (error) {
      handleError(error);
      // Use defaults on error
      dispatch({ type: 'SET_SAVED_APP_SETTINGS', payload: defaultAppSettings });
      dispatch({ type: 'SET_SAVED_LLM_SETTINGS', payload: defaultLLMSettings });
      dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', payload: true });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveAllSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Save both app and LLM settings
      const [updatedAppSettings, updatedLLMSettings] = await Promise.all([
        settingsService.updateAppSettings(settings.appSettings),
        settingsService.updateLLMSettings(settings.llmSettings)
      ]);
      
      dispatch({ type: 'SET_SAVED_APP_SETTINGS', payload: updatedAppSettings });
      dispatch({ type: 'SET_SAVED_LLM_SETTINGS', payload: updatedLLMSettings });
      
      // Show success message
      dispatch({ type: 'SET_SAVE_SUCCESS', payload: true });
      setTimeout(() => {
        dispatch({ type: 'SET_SAVE_SUCCESS', payload: false });
      }, 3000);
      
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetAppSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const resetSettings = await settingsService.resetAppSettings();
      dispatch({ type: 'SET_SAVED_APP_SETTINGS', payload: resetSettings });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetLLMSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const resetSettings = await settingsService.resetLLMSettings();
      dispatch({ type: 'SET_SAVED_LLM_SETTINGS', payload: resetSettings });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const discardChanges = () => {
    dispatch({ type: 'SET_APP_SETTINGS', payload: settings.savedAppSettings });
    dispatch({ type: 'SET_LLM_SETTINGS', payload: settings.savedLLMSettings });
  };

  // Load settings on mount with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadWithRetry = async () => {
      try {
        await loadSettings();
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Settings load failed, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(loadWithRetry, 1000 * retryCount); // Exponential backoff
        } else {
          console.log('Settings load failed after retries, using defaults');
          dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', payload: true });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadWithRetry();
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      dispatch, 
      saveAllSettings,
      resetAppSettings,
      resetLLMSettings,
      loadSettings,
      discardChanges
    }}>
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