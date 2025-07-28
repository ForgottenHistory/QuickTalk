const express = require('express');
const { characterManager } = require('../utils/aiCharacters');

const router = express.Router();

// Get all characters
router.get('/characters', async (req, res) => {
  try {
    const characters = characterManager.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).json({ error: 'Failed to get characters' });
  }
});

// Get character by ID
router.get('/characters/:id', async (req, res) => {
  try {
    const character = characterManager.getCharacterById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({ error: 'Failed to get character' });
  }
});

// Create new character
router.post('/characters', async (req, res) => {
  try {
    const characterData = req.body;
    
    // Validate required fields
    if (!characterData.name || !characterData.avatar) {
      return res.status(400).json({ 
        error: 'Name and avatar are required' 
      });
    }
    
    const newCharacter = await characterManager.createCharacter(characterData);
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character
router.patch('/characters/:id', async (req, res) => {
  try {
    const updates = req.body;
    const characterId = req.params.id;
    
    // Remove fields that shouldn't be updated via API
    delete updates.id;
    delete updates.created_at;
    
    const updatedCharacter = await characterManager.updateCharacter(characterId, updates);
    if (!updatedCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete character
router.delete('/characters/:id', async (req, res) => {
  try {
    const characterId = req.params.id;
    
    // Prevent deletion if it's the last character
    const allCharacters = characterManager.getAllCharacters();
    if (allCharacters.length <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last character' 
      });
    }
    
    const deleted = await characterManager.deleteCharacter(characterId);
    if (!deleted) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// Search characters
router.get('/characters/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const characters = characterManager.getAllCharacters();
    
    const filtered = characters.filter(char => 
      char.data.name.toLowerCase().includes(query.toLowerCase()) ||
      char.data.description.toLowerCase().includes(query.toLowerCase()) ||
      char.data.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json(filtered);
  } catch (error) {
    console.error('Error searching characters:', error);
    res.status(500).json({ error: 'Failed to search characters' });
  }
});

// Get all tags
router.get('/characters/meta/tags', async (req, res) => {
  try {
    const characters = characterManager.getAllCharacters();
    const allTags = characters.flatMap(char => char.data.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    
    res.json(uniqueTags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// Export characters
router.get('/characters/export/all', async (req, res) => {
  try {
    const characters = characterManager.getAllCharacters();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="quicktalk-characters.json"');
    res.json(characters);
  } catch (error) {
    console.error('Error exporting characters:', error);
    res.status(500).json({ error: 'Failed to export characters' });
  }
});

// Import characters
router.post('/characters/import', async (req, res) => {
  try {
    const { characters, replace = false } = req.body;
    
    if (!Array.isArray(characters)) {
      return res.status(400).json({ 
        error: 'Characters must be an array' 
      });
    }
    
    // Validate each character
    for (const char of characters) {
      if (!char.spec || char.spec !== 'chara_card_v2' || !char.data) {
        return res.status(400).json({ 
          error: 'Invalid character format' 
        });
      }
    }
    
    if (replace) {
      // Replace all characters
      characterManager.characters = characters;
    } else {
      // Add to existing characters (with ID conflict resolution)
      const existingIds = new Set(characterManager.getAllCharacters().map(c => c.data.id));
      
      for (const char of characters) {
        if (existingIds.has(char.data.id)) {
          // Generate new ID for conflicts
          char.data.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        characterManager.characters.push(char);
      }
    }
    
    await characterManager.saveCharacters();
    
    res.json({ 
      message: `Successfully imported ${characters.length} characters`,
      total: characterManager.getAllCharacters().length
    });
  } catch (error) {
    console.error('Error importing characters:', error);
    res.status(500).json({ error: 'Failed to import characters' });
  }
});

module.exports = router;