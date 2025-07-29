const API_BASE_URL = 'http://localhost:5000/api';

export interface FeatherlessModel {
  id: string;
  name: string;
  model_class: string;
  context_length: number;
  max_completion_tokens: number;
}

class ModelsService {
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

  async getModels(): Promise<FeatherlessModel[]> {
    return this.request<FeatherlessModel[]>('/models');
  }

  async refreshModels(): Promise<{ message: string; count: number }> {
    return this.request<{ message: string; count: number }>('/models/refresh', {
      method: 'POST',
    });
  }
}

export const modelsService = new ModelsService();