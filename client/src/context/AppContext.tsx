import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AICharacter, Timer, Message, ExtensionState } from '../types';

interface AppState {
  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  sessionId: string | null;
  nextAI: AICharacter | null;
  
  // AI character state
  aiCharacter: AICharacter | null;
  
  // Timer state
  timer: Timer;
  
  // Messages state
  messages: Message[];
  
  // Extension state
  extensionState: ExtensionState;
}

type AppAction = 
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_SESSION_ID'; payload: string | null }
  | { type: 'SET_NEXT_AI'; payload: AICharacter | null }
  | { type: 'SET_AI_CHARACTER'; payload: AICharacter | null }
  | { type: 'SET_TIMER'; payload: Timer }
  | { type: 'UPDATE_TIMER'; payload: Partial<Timer> }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_EXTENSION_STATE'; payload: ExtensionState }
  | { type: 'UPDATE_EXTENSION_STATE'; payload: Partial<ExtensionState> }
  | { type: 'RESET_SESSION' };

const initialState: AppState = {
  isConnecting: true,
  isConnected: false,
  sessionId: null,
  nextAI: null,
  aiCharacter: null,
  timer: {
    minutes: 15,
    seconds: 0,
    isActive: false
  },
  messages: [],
  extensionState: {
    isModalVisible: false,
    userDecision: null,
    aiDecision: null,
    hasBeenOffered: false
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_NEXT_AI':
      return { ...state, nextAI: action.payload };
    case 'SET_AI_CHARACTER':
      return { ...state, aiCharacter: action.payload };
    case 'SET_TIMER':
      return { ...state, timer: action.payload };
    case 'UPDATE_TIMER':
      return { ...state, timer: { ...state.timer, ...action.payload } };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_EXTENSION_STATE':
      return { ...state, extensionState: action.payload };
    case 'UPDATE_EXTENSION_STATE':
      return { ...state, extensionState: { ...state.extensionState, ...action.payload } };
    case 'RESET_SESSION':
      return {
        ...state,
        sessionId: null,
        messages: [],
        timer: { minutes: 15, seconds: 0, isActive: false },
        extensionState: {
          isModalVisible: false,
          userDecision: null,
          aiDecision: null,
          hasBeenOffered: false
        }
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};