const aiCharacters = [
  { id: '1', name: 'Luna', personality: 'Creative and curious assistant', avatar: '🌙' },
  { id: '2', name: 'Max', personality: 'Tech enthusiast and problem solver', avatar: '🤖' },
  { id: '3', name: 'Sage', personality: 'Wise and philosophical thinker', avatar: '🦉' },
  { id: '4', name: 'Zara', personality: 'Energetic and adventurous spirit', avatar: '⚡' },
  { id: '5', name: 'Echo', personality: 'Mysterious and poetic soul', avatar: '🎭' },
  { id: '6', name: 'Nova', personality: 'Scientific and analytical mind', avatar: '🔬' }
];

const getRandomAICharacter = (excludeId) => {
  const available = excludeId 
    ? aiCharacters.filter(char => char.id !== excludeId)
    : aiCharacters;
  return available[Math.floor(Math.random() * available.length)];
};

const getCharacterById = (id) => {
  return aiCharacters.find(char => char.id === id);
};

const getAllCharacters = () => {
  return [...aiCharacters];
};

module.exports = {
  getRandomAICharacter,
  getCharacterById,
  getAllCharacters
};