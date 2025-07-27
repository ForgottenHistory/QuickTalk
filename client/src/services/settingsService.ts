import { AppSettings, LLMSettings, SettingsState } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface SettingsResponse {
  appSettings: AppSettings;
  llmSettings: LLMSettings;
}

class SettingsService {
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

  async getSettings(): Promise<SettingsResponse> {
    return this.request<SettingsResponse>('/settings');
  }

  async updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return this.request<AppSettings>('/settings/app', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async updateLLMSettings(settings: Partial<LLMSettings>): Promise<LLMSettings> {
    return this.request<LLMSettings>('/settings/llm', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async resetAppSettings(): Promise<AppSettings> {
    return this.request<AppSettings>('/settings/app/reset', {
      method: 'POST',
    });
  }

  async resetLLMSettings(): Promise<LLMSettings> {
    return this.request<LLMSettings>('/settings/llm/reset', {
      method: 'POST',
    });
  }

  async resetAllSettings(): Promise<SettingsResponse> {
    return this.request<SettingsResponse>('/settings/reset', {
      method: 'POST',
    });
  }
}

export const settingsService = new SettingsService();