export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date | string;
}

export interface AICharacter {
  id: string;
  name: string;
  personality: string;
  avatar: string;
}

export interface ChatSession {
  id: string;
  aiCharacter: AICharacter;
  messages: Message[];
  timeRemaining: number;
  isActive: boolean;
  extensionRequested: boolean;
}

export interface Timer {
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export interface ExtensionState {
  isModalVisible: boolean;
  userDecision: 'extend' | 'decline' | null;
  aiDecision: 'extend' | 'decline' | null;
  hasBeenOffered: boolean;
}

export interface TypingState {
  isAITyping: boolean;
  isUserTyping: boolean;
}

export interface TypingEvent {
  sessionId: string;
  isTyping: boolean;
  sender: 'user' | 'ai';
}

export interface AppSettings {
  sessionDuration: number; // minutes
  extensionDuration: number; // minutes
  extensionWarningTime: number; // minutes before end to show warning
  autoConnect: boolean;
  soundEnabled: boolean;
}

export interface LLMSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPromptCustomization: boolean;
  responseLength: 'short' | 'medium' | 'long';
  customSystemPrompt: string;
  authorsNote: string;
}

export interface SettingsState {
  isOpen: boolean;
  activeTab: 'app' | 'llm';
  appSettings: AppSettings;
  llmSettings: LLMSettings;
}

export * from './character';