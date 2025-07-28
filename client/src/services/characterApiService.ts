import { CharacterCardV2 } from '../types/character';

const API_BASE_URL = 'http://localhost:5000/api';

export interface CharacterApiResponse {
  characters?: CharacterCardV2[];
  character?: CharacterCardV2;
  message?: string;
  total?: number;
  tags?: string[];
  error?: string;
}

class CharacterApiService {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getAllCharacters(): Promise<CharacterCardV2[]> {
    return this.request<CharacterCardV2[]>('/characters');
  }

  async getCharacterById(id: string): Promise<CharacterCardV2> {
    return this.request<CharacterCardV2>(`/characters/${id}`);
  }

  async createCharacter(data: Partial<CharacterCardV2['data']>): Promise<CharacterCardV2> {
    return this.request<CharacterCardV2>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCharacter(id: string, updates: Partial<CharacterCardV2['data']>): Promise<CharacterCardV2> {
    return this.request<CharacterCardV2>(`/characters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCharacter(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/characters/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCharacters(query: string): Promise<CharacterCardV2[]> {
    if (!query.trim()) {
      return this.getAllCharacters();
    }
    return this.request<CharacterCardV2[]>(`/characters/search/${encodeURIComponent(query)}`);
  }

  async getAllTags(): Promise<string[]> {
    return this.request<string[]>('/characters/meta/tags');
  }

  async exportCharacters(): Promise<CharacterCardV2[]> {
    return this.request<CharacterCardV2[]>('/characters/export/all');
  }

  async importCharacters(characters: CharacterCardV2[], replace: boolean = false): Promise<{ message: string; total: number }> {
    return this.request<{ message: string; total: number }>('/characters/import', {
      method: 'POST',
      body: JSON.stringify({ characters, replace }),
    });
  }

  // Helper method for file downloads
  async downloadCharactersAsFile(): Promise<void> {
    try {
      const characters = await this.exportCharacters();
      const dataStr = JSON.stringify(characters, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quicktalk-characters-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Helper method for file uploads
  async uploadCharactersFromFile(file: File, replace: boolean = false): Promise<{ message: string; total: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string;
          const characters = JSON.parse(jsonData);
          
          if (!Array.isArray(characters)) {
            throw new Error('File must contain an array of characters');
          }
          
          const result = await this.importCharacters(characters, replace);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const characterApiService = new CharacterApiService();