import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SettingsState, AppSettings, LLMSettings } from '../types';
import { settingsService } from '../services/settingsService';

type SettingsAction = 
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: 'app' | 'llm' }
  | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_LLM_SETTINGS'; payload: Partial<LLMSettings> }
  | { type: 'SET_APP_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LLM_SETTINGS'; payload: LLMSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

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

interface ExtendedSettingsState extends SettingsState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ExtendedSettingsState = {
  isOpen: false,
  activeTab: 'app',
  appSettings: defaultAppSettings,
  llmSettings: defaultLLMSettings,
  isLoading: false,
  error: null
};

const settingsReducer = (state: ExtendedSettingsState, action: SettingsAction): ExtendedSettingsState => {
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
    case 'SET_APP_SETTINGS':
      return { ...state, appSettings: action.payload };
    case 'SET_LLM_SETTINGS':
      return { ...state, llmSettings: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: ExtendedSettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateLLMSettings: (updates: Partial<LLMSettings>) => Promise<void>;
  resetAppSettings: () => Promise<void>;
  resetLLMSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialState);

  const handleError = (error: any) => {
    console.error('Settings error:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message || 'An error occurred' });
    setTimeout(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, 5000);
  };

  const loadSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await settingsService.getSettings();
      dispatch({ type: 'SET_APP_SETTINGS', payload: data.appSettings });
      dispatch({ type: 'SET_LLM_SETTINGS', payload: data.llmSettings });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAppSettings = async (updates: Partial<AppSettings>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedSettings = await settingsService.updateAppSettings(updates);
      dispatch({ type: 'SET_APP_SETTINGS', payload: updatedSettings });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateLLMSettings = async (updates: Partial<LLMSettings>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedSettings = await settingsService.updateLLMSettings(updates);
      dispatch({ type: 'SET_LLM_SETTINGS', payload: updatedSettings });
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
      dispatch({ type: 'SET_APP_SETTINGS', payload: resetSettings });
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
      dispatch({ type: 'SET_LLM_SETTINGS', payload: resetSettings });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      dispatch, 
      updateAppSettings,
      updateLLMSettings,
      resetAppSettings,
      resetLLMSettings,
      loadSettings
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