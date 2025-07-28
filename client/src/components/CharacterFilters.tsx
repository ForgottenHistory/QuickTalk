import React, { useState } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Button } from './shared';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, onClear }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="character-search-form">
    <div className="character-search-input-group">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search characters by name or description..."
        className="character-search-input"
      />
      <button type="submit" className="btn btn-primary character-search-btn">
        🔍
      </button>
      {value && (
        <Button onClick={onClear} variant="secondary" className="character-search-clear-btn">
          ✕
        </Button>
      )}
    </div>
  </form>
);

interface TagFiltersProps {
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

const TagFilters: React.FC<TagFiltersProps> = ({ 
  availableTags, selectedTags, onToggleTag, onClearTags 
}) => {
  if (availableTags.length === 0) return null;

  return (
    <div className="character-tag-filters">
      <div className="character-tag-filters-header">
        <span className="character-tag-filters-label">Filter by tags:</span>
        {selectedTags.length > 0 && (
          <Button onClick={onClearTags} variant="secondary" className="character-tag-clear-btn">
            Clear Tags
          </Button>
        )}
      </div>
      
      <div className="character-tag-list">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`character-tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
          >
            {tag}
            {selectedTags.includes(tag) && (
              <span className="character-tag-filter-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

interface ActiveFiltersProps {
  searchQuery: string;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ 
  searchQuery, selectedTags, onRemoveTag, onClearAll 
}) => {
  const hasFilters = searchQuery || selectedTags.length > 0;
  if (!hasFilters) return null;

  return (
    <div className="character-active-filters">
      <div className="character-active-filters-header">
        <span className="character-active-filters-label">Active filters:</span>
        <Button onClick={onClearAll} variant="secondary" className="character-clear-all-btn">
          Clear All
        </Button>
      </div>
      
      <div className="character-active-filters-list">
        {searchQuery && (
          <div className="character-active-filter">
            <span className="character-active-filter-type">Search:</span>
            <span className="character-active-filter-value">"{searchQuery}"</span>
          </div>
        )}
        
        {selectedTags.map((tag) => (
          <div key={tag} className="character-active-filter">
            <span className="character-active-filter-type">Tag:</span>
            <span className="character-active-filter-value">{tag}</span>
            <button
              onClick={() => onRemoveTag(tag)}
              className="character-active-filter-remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CharacterFilters: React.FC = () => {
  const { state, dispatch, searchCharacters } = useCharacterContext();
  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);

  const handleSearchSubmit = () => {
    searchCharacters(localSearchQuery);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    searchCharacters('');
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];
    
    dispatch({ type: 'SET_SELECTED_TAGS', payload: newSelectedTags });
  };

  const handleClearAllFilters = () => {
    setLocalSearchQuery('');
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  return (
    <div className="character-filters">
      <SearchBar
        value={localSearchQuery}
        onChange={setLocalSearchQuery}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
      />

      <TagFilters
        availableTags={state.availableTags}
        selectedTags={state.selectedTags}
        onToggleTag={handleTagToggle}
        onClearTags={() => dispatch({ type: 'SET_SELECTED_TAGS', payload: [] })}
      />

      <ActiveFilters
        searchQuery={state.searchQuery}
        selectedTags={state.selectedTags}
        onRemoveTag={handleTagToggle}
        onClearAll={handleClearAllFilters}
      />
    </div>
  );
};

export default CharacterFilters;