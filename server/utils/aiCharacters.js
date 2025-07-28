const fs = require('fs').promises;
const path = require('path');

const CHARACTERS_FILE = path.join(__dirname, '../data/characters.json');
const DATA_DIR = path.join(__dirname, '../data');

// Default characters for migration/fallback
const defaultCharacters = [
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '1',
      name: 'Luna',
      description: 'Luna is a creative and curious AI assistant who loves exploring new ideas and asking thought-provoking questions. She brings an artistic and imaginative perspective to conversations.',
      personality: 'Creative and curious assistant',
      avatar: '🌙',
      creator_notes: '',
      system_prompt: '',
      tags: ['creative', 'curious'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '2',
      name: 'Max',
      description: 'Max is a tech enthusiast and problem solver who loves discussing technology, coding, and innovative solutions. He is analytical but friendly, always ready to dive into technical details.',
      personality: 'Tech enthusiast and problem solver',
      avatar: '🤖',
      creator_notes: '',
      system_prompt: '',
      tags: ['tech', 'problem-solving'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '3',
      name: 'Sage',
      description: 'Sage is a wise and philosophical thinker who speaks with depth and wisdom, often connecting ideas to broader life principles. He is contemplative, insightful, and enjoys meaningful conversations.',
      personality: 'Wise and philosophical thinker',
      avatar: '🦉',
      creator_notes: '',
      system_prompt: '',
      tags: ['wisdom', 'philosophy'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '4',
      name: 'Zara',
      description: 'Zara is an energetic and adventurous spirit who is enthusiastic, optimistic, and loves talking about exciting possibilities and adventures. She brings high energy to conversations.',
      personality: 'Energetic and adventurous spirit',
      avatar: '⚡',
      creator_notes: '',
      system_prompt: '',
      tags: ['energetic', 'adventure'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '5',
      name: 'Echo',
      description: 'Echo is a mysterious and poetic soul who speaks in a unique, artistic way, often using metaphors and beautiful language. She is enigmatic, creative, and slightly mystical.',
      personality: 'Mysterious and poetic soul',
      avatar: '🎭',
      creator_notes: '',
      system_prompt: '',
      tags: ['mysterious', 'poetry'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      id: '6',
      name: 'Nova',
      description: 'Nova is a scientific and analytical mind who loves research, data, and scientific thinking. She is logical, precise, and enjoys analyzing things from multiple angles.',
      personality: 'Scientific and analytical mind',
      avatar: '🔬',
      creator_notes: '',
      system_prompt: '',
      tags: ['science', 'analytical'],
      creator: 'Quicktalk',
      character_version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

class CharacterManager {
  constructor() {
    this.characters = [];
    this.ensureDataDirectory();
    this.loadCharacters();
  }

  async ensureDataDirectory() {
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('Created data directory:', DATA_DIR);
    }
  }

  async loadCharacters() {
    try {
      const data = await fs.readFile(CHARACTERS_FILE, 'utf8');
      this.characters = JSON.parse(data);
      console.log('Characters loaded from file');
    } catch (error) {
      console.log('No characters file found, using defaults');
      this.characters = [...defaultCharacters];
      await this.saveCharacters();
    }
  }

  async saveCharacters() {
    try {
      await this.ensureDataDirectory();
      await fs.writeFile(CHARACTERS_FILE, JSON.stringify(this.characters, null, 2));
      console.log('Characters saved to file');
    } catch (error) {
      console.error('Failed to save characters:', error);
      throw error;
    }
  }

  getAllCharacters() {
    return [...this.characters];
  }

  getCharacterById(id) {
    return this.characters.find(char => char.data.id === id) || null;
  }

  getRandomCharacter(excludeId) {
    const available = excludeId 
      ? this.characters.filter(char => char.data.id !== excludeId)
      : this.characters;
    
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  async createCharacter(characterData) {
    const newCharacter = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        id: `char_${Date.now()}`,
        name: 'New Character',
        description: 'A new AI character with detailed background and traits.',
        personality: 'Friendly and helpful assistant',
        avatar: '🤖',
        creator_notes: '',
        system_prompt: '',
        tags: [],
        creator: '',
        character_version: '1.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...characterData
      }
    };

    this.characters.push(newCharacter);
    await this.saveCharacters();
    return newCharacter;
  }

  async updateCharacter(id, updates) {
    const index = this.characters.findIndex(char => char.data.id === id);
    if (index === -1) return null;

    this.characters[index].data = {
      ...this.characters[index].data,
      ...updates,
      id, // Prevent ID changes
      updated_at: new Date().toISOString()
    };

    await this.saveCharacters();
    return this.characters[index];
  }

  async deleteCharacter(id) {
    const index = this.characters.findIndex(char => char.data.id === id);
    if (index === -1) return false;

    this.characters.splice(index, 1);
    await this.saveCharacters();
    return true;
  }

  // Convert to legacy format for compatibility - FIXED to use personality for subtitle
  convertToLegacyFormat(character) {
    return {
      id: character.data.id,
      name: character.data.name,
      personality: character.data.personality, // This is used for the subtitle
      avatar: character.data.avatar,
      description: character.data.description // Keep description for AI context
    };
  }
}

const characterManager = new CharacterManager();

// Legacy exports for backward compatibility
const getRandomAICharacter = (excludeId) => {
  const character = characterManager.getRandomCharacter(excludeId);
  return character ? characterManager.convertToLegacyFormat(character) : null;
};

const getCharacterById = (id) => {
  const character = characterManager.getCharacterById(id);
  return character ? characterManager.convertToLegacyFormat(character) : null;
};

const getAllCharacters = () => {
  return characterManager.getAllCharacters().map(char => 
    characterManager.convertToLegacyFormat(char)
  );
};

module.exports = {
  characterManager,
  getRandomAICharacter,
  getCharacterById,
  getAllCharacters
};