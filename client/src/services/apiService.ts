import { AICharacter } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface CreateSessionResponse {
  sessionId: string;
  aiCharacter: AICharacter;
}

export interface SessionResponse {
  id: string;
  aiCharacter: AICharacter;
  messages: any[];
  timeRemaining: number;
  isActive: boolean;
  createdAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.request<CreateSessionResponse>('/sessions', {
      method: 'POST',
    });
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.request<SessionResponse>(`/sessions/${sessionId}`);
  }

  async testConnection(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/test');
  }
}

export const apiService = new ApiService();