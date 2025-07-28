import React from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Avatar, Button } from './shared';
import { CharacterCardV2 } from '../types/character';

interface CharacterCardProps {
  character: CharacterCardV2;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onEdit, 
  onDelete, 
  onSelect 
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="character-card">
      <div className="character-card-header">
        {character.data.avatar.startsWith('data:') ? (
          <img 
            src={character.data.avatar} 
            alt={character.data.name}
            className="character-card-avatar-image"
          />
        ) : (
          <Avatar emoji={character.data.avatar} size="large" />
        )}
        <div className="character-card-info">
          <h3 className="character-card-name">{character.data.name}</h3>
          <p className="character-card-description">{character.data.description}</p>
        </div>
      </div>

      <div className="character-card-body">
        {character.data.tags.length > 0 && (
          <div className="character-tags">
            {character.data.tags.map((tag, index) => (
              <span key={index} className="character-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="character-meta">
          <div className="character-meta-item">
            <span className="character-meta-label">Version:</span>
            <span className="character-meta-value">{character.data.character_version}</span>
          </div>
          {character.data.creator && (
            <div className="character-meta-item">
              <span className="character-meta-label">Creator:</span>
              <span className="character-meta-value">{character.data.creator}</span>
            </div>
          )}
          <div className="character-meta-item">
            <span className="character-meta-label">Updated:</span>
            <span className="character-meta-value">{formatDate(character.data.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="character-card-actions">
        <Button onClick={onSelect} variant="primary" className="character-action-btn">
          Select
        </Button>
        <Button onClick={onEdit} variant="secondary" className="character-action-btn">
          ✏️ Edit
        </Button>
        <Button onClick={onDelete} variant="secondary" className="character-action-btn character-delete-btn">
          🗑️ Delete
        </Button>
      </div>
    </div>
  );
};

const CharacterGrid: React.FC = () => {
  const { state, dispatch, deleteCharacter, paginatedCharacters, totalPages } = useCharacterContext();

  const handleEdit = (character: CharacterCardV2) => {
    dispatch({ type: 'START_EDITING', payload: character });
  };

  const handleDelete = async (character: CharacterCardV2) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${character.data.name}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      await deleteCharacter(character.data.id);
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const handleSelect = (character: CharacterCardV2) => {
    dispatch({ type: 'SET_SELECTED_CHARACTER', payload: character });
    dispatch({ type: 'SET_MANAGEMENT_OPEN', payload: false });
  };

  if (paginatedCharacters.length === 0) {
    return (
      <div className="character-grid-empty">
        {state.searchQuery || state.selectedTags.length > 0 ? (
          <>
            <div className="empty-state-icon">🔍</div>
            <h3>No characters found</h3>
            <p>Try adjusting your search criteria or filters.</p>
            <Button 
              onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
              variant="secondary"
            >
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <div className="empty-state-icon">👥</div>
            <h3>No characters yet</h3>
            <p>Create your first character to get started!</p>
            <Button 
              onClick={() => dispatch({ type: 'START_EDITING', payload: null })}
              variant="primary"
            >
              Create Character
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="character-grid">
      {paginatedCharacters.map((character: CharacterCardV2) => (
        <CharacterCard
          key={character.data.id}
          character={character}
          onEdit={() => handleEdit(character)}
          onDelete={() => handleDelete(character)}
          onSelect={() => handleSelect(character)}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;