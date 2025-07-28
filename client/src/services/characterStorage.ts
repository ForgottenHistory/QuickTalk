import { CharacterCardV2, createDefaultCharacter, convertFromAICharacter } from '../types/character';

const STORAGE_KEY = 'quicktalk_characters';

class CharacterStorageService {
  private characters: CharacterCardV2[] = [];

  constructor() {
    this.loadCharacters();
  }

  private loadCharacters(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.characters = JSON.parse(stored);
      } else {
        // Migrate existing hardcoded characters
        this.migrateFromHardcoded();
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      this.migrateFromHardcoded();
    }
  }

  private migrateFromHardcoded(): void {
    // Import existing hardcoded characters
    const hardcodedCharacters = [
      { id: '1', name: 'Luna', personality: 'Creative and curious assistant', avatar: '🌙' },
      { id: '2', name: 'Max', personality: 'Tech enthusiast and problem solver', avatar: '🤖' },
      { id: '3', name: 'Sage', personality: 'Wise and philosophical thinker', avatar: '🦉' },
      { id: '4', name: 'Zara', personality: 'Energetic and adventurous spirit', avatar: '⚡' },
      { id: '5', name: 'Echo', personality: 'Mysterious and poetic soul', avatar: '🎭' },
      { id: '6', name: 'Nova', personality: 'Scientific and analytical mind', avatar: '🔬' }
    ];

    this.characters = hardcodedCharacters.map(convertFromAICharacter);
    this.saveCharacters();
  }

  private saveCharacters(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.characters));
    } catch (error) {
      console.error('Failed to save characters:', error);
    }
  }

  getAllCharacters(): CharacterCardV2[] {
    return [...this.characters];
  }

  getCharacterById(id: string): CharacterCardV2 | null {
    return this.characters.find(char => char.data.id === id) || null;
  }

  getRandomCharacter(excludeId?: string): CharacterCardV2 | null {
    const available = excludeId 
      ? this.characters.filter(char => char.data.id !== excludeId)
      : this.characters;
    
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  createCharacter(data?: Partial<CharacterCardV2['data']>): CharacterCardV2 {
    const newCharacter = createDefaultCharacter();
    
    if (data) {
      newCharacter.data = {
        ...newCharacter.data,
        ...data,
        id: newCharacter.data.id, // Keep generated ID
        created_at: newCharacter.data.created_at,
        updated_at: new Date().toISOString()
      };
    }

    this.characters.push(newCharacter);
    this.saveCharacters();
    return newCharacter;
  }

  updateCharacter(id: string, updates: Partial<CharacterCardV2['data']>): CharacterCardV2 | null {
    const index = this.characters.findIndex(char => char.data.id === id);
    if (index === -1) return null;

    this.characters[index].data = {
      ...this.characters[index].data,
      ...updates,
      id, // Prevent ID changes
      updated_at: new Date().toISOString()
    };

    this.saveCharacters();
    return this.characters[index];
  }

  deleteCharacter(id: string): boolean {
    const index = this.characters.findIndex(char => char.data.id === id);
    if (index === -1) return false;

    this.characters.splice(index, 1);
    this.saveCharacters();
    return true;
  }

  searchCharacters(query: string): CharacterCardV2[] {
    const lowercaseQuery = query.toLowerCase();
    return this.characters.filter(char => 
      char.data.name.toLowerCase().includes(lowercaseQuery) ||
      char.data.description.toLowerCase().includes(lowercaseQuery) ||
      char.data.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getCharactersByTag(tag: string): CharacterCardV2[] {
    return this.characters.filter(char => 
      char.data.tags.includes(tag)
    );
  }

  getAllTags(): string[] {
    const allTags = this.characters.flatMap(char => char.data.tags);
    return Array.from(new Set(allTags)).sort();
  }

  exportCharacters(): string {
    return JSON.stringify(this.characters, null, 2);
  }

  importCharacters(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        this.characters = imported;
        this.saveCharacters();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import characters:', error);
      return false;
    }
  }
}

export const characterStorage = new CharacterStorageService();