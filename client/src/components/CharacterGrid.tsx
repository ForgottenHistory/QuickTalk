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
  character, onEdit, onDelete, onSelect 
}) => {
  const { data } = character;
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const renderAvatar = () => {
    return data.avatar.startsWith('data:') ? (
      <img 
        src={data.avatar} 
        alt={data.name}
        className="character-card-avatar-image"
      />
    ) : (
      <Avatar emoji={data.avatar} size="large" />
    );
  };

  const metaItems = [
    { label: 'Version', value: data.character_version },
    ...(data.creator ? [{ label: 'Creator', value: data.creator }] : []),
    { label: 'Updated', value: formatDate(data.updated_at) }
  ];

  return (
    <div className="character-card">
      <div className="character-card-header">
        {renderAvatar()}
        <div className="character-card-info">
          <h3 className="character-card-name">{data.name}</h3>
          <p className="character-card-description">{data.personality}</p>
        </div>
      </div>

      <div className="character-card-body">
        {data.tags.length > 0 && (
          <div className="character-tags">
            {data.tags.map((tag, index) => (
              <span key={index} className="character-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="character-meta">
          {metaItems.map((item, index) => (
            <div key={index} className="character-meta-item">
              <span className="character-meta-label">{item.label}:</span>
              <span className="character-meta-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="character-card-actions">
        <Button onClick={onSelect} variant="primary" className="character-action-btn">
          Select
        </Button>
        <Button onClick={onEdit} variant="secondary" className="character-action-btn">
          ✏️ Edit
        </Button>
        <Button 
          onClick={onDelete} 
          variant="secondary" 
          className="character-action-btn character-delete-btn"
        >
          🗑️ Delete
        </Button>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateCharacter: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  hasFilters, onClearFilters, onCreateCharacter 
}) => (
  <div className="character-grid-empty">
    {hasFilters ? (
      <>
        <div className="empty-state-icon">🔍</div>
        <h3>No characters found</h3>
        <p>Try adjusting your search criteria or filters.</p>
        <Button onClick={onClearFilters} variant="secondary">
          Clear Filters
        </Button>
      </>
    ) : (
      <>
        <div className="empty-state-icon">👥</div>
        <h3>No characters yet</h3>
        <p>Create your first character to get started!</p>
        <Button onClick={onCreateCharacter} variant="primary">
          Create Character
        </Button>
      </>
    )}
  </div>
);

const CharacterGrid: React.FC = () => {
  const { state, dispatch, deleteCharacter, paginatedCharacters } = useCharacterContext();

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

  const hasFilters = Boolean(state.searchQuery || state.selectedTags.length > 0);

  if (paginatedCharacters.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters}
        onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
        onCreateCharacter={() => dispatch({ type: 'START_EDITING', payload: null })}
      />
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