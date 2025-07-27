import { AICharacter } from '../types';

export const aiCharacters: AICharacter[] = [
  {
    id: '1',
    name: 'Luna',
    personality: 'Creative and curious assistant',
    avatar: '🌙'
  },
  {
    id: '2',
    name: 'Max',
    personality: 'Tech enthusiast and problem solver',
    avatar: '🤖'
  },
  {
    id: '3',
    name: 'Sage',
    personality: 'Wise and philosophical thinker',
    avatar: '🦉'
  },
  {
    id: '4',
    name: 'Zara',
    personality: 'Energetic and adventurous spirit',
    avatar: '⚡'
  },
  {
    id: '5',
    name: 'Echo',
    personality: 'Mysterious and poetic soul',
    avatar: '🎭'
  },
  {
    id: '6',
    name: 'Nova',
    personality: 'Scientific and analytical mind',
    avatar: '🔬'
  }
];

export const getRandomAICharacter = (excludeId?: string): AICharacter => {
  const availableCharacters = excludeId 
    ? aiCharacters.filter(char => char.id !== excludeId)
    : aiCharacters;
  
  const randomIndex = Math.floor(Math.random() * availableCharacters.length);
  return availableCharacters[randomIndex];
};