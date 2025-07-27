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