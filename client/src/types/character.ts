export interface CharacterCardV2 {
  spec: 'chara_card_v2';
  spec_version: '2.0';
  data: CharacterData;
}

export interface CharacterData {
  // Required V1 fields (simplified for your use case)
  name: string;
  description: string;
  
  // V2 fields you want to use
  creator_notes: string;
  system_prompt: string;
  tags: string[];
  creator: string;
  character_version: string;
  
  // Your custom fields
  id: string;
  avatar: string; // emoji
  personality: string; // your existing personality field
  created_at: string;
  updated_at: string;
}

// For backward compatibility with existing system
export interface AICharacter {
  id: string;
  name: string;
  personality: string;
  avatar: string;
}

// Convert between formats
export const convertToAICharacter = (card: CharacterCardV2): AICharacter => ({
  id: card.data.id,
  name: card.data.name,
  personality: card.data.personality,
  avatar: card.data.avatar
});

export const convertFromAICharacter = (char: AICharacter): CharacterCardV2 => ({
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    id: char.id,
    name: char.name,
    description: char.personality,
    personality: char.personality,
    avatar: char.avatar,
    creator_notes: '',
    system_prompt: '',
    tags: [],
    creator: '',
    character_version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
});

// Default character template
export const createDefaultCharacter = (id?: string): CharacterCardV2 => ({
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    id: id || `char_${Date.now()}`,
    name: 'New Character',
    description: 'A new AI character',
    personality: 'Friendly and helpful assistant',
    avatar: '🤖',
    creator_notes: '',
    system_prompt: '',
    tags: [],
    creator: '',
    character_version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
});