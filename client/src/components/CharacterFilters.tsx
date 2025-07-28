import React, { useState } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Button } from './shared';

const CharacterFilters: React.FC = () => {
  const { state, dispatch, searchCharacters } = useCharacterContext();
  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const hasActiveFilters = state.searchQuery || state.selectedTags.length > 0;

  return (
    <div className="character-filters">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="character-search-form">
        <div className="character-search-input-group">
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="Search characters by name or description..."
            className="character-search-input"
          />
          <button 
            type="submit" 
            className="btn btn-primary character-search-btn"
          >
            🔍
          </button>
          {localSearchQuery && (
            <Button 
              onClick={handleSearchClear}
              variant="secondary" 
              className="character-search-clear-btn"
            >
              ✕
            </Button>
          )}
        </div>
      </form>

      {/* Tag Filters */}
      {state.availableTags.length > 0 && (
        <div className="character-tag-filters">
          <div className="character-tag-filters-header">
            <span className="character-tag-filters-label">Filter by tags:</span>
            {state.selectedTags.length > 0 && (
              <Button
                onClick={() => dispatch({ type: 'SET_SELECTED_TAGS', payload: [] })}
                variant="secondary"
                className="character-tag-clear-btn"
              >
                Clear Tags
              </Button>
            )}
          </div>
          
          <div className="character-tag-list">
            {state.availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`character-tag-filter ${
                  state.selectedTags.includes(tag) ? 'active' : ''
                }`}
              >
                {tag}
                {state.selectedTags.includes(tag) && (
                  <span className="character-tag-filter-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="character-active-filters">
          <div className="character-active-filters-header">
            <span className="character-active-filters-label">Active filters:</span>
            <Button
              onClick={handleClearAllFilters}
              variant="secondary"
              className="character-clear-all-btn"
            >
              Clear All
            </Button>
          </div>
          
          <div className="character-active-filters-list">
            {state.searchQuery && (
              <div className="character-active-filter">
                <span className="character-active-filter-type">Search:</span>
                <span className="character-active-filter-value">"{state.searchQuery}"</span>
              </div>
            )}
            
            {state.selectedTags.map((tag) => (
              <div key={tag} className="character-active-filter">
                <span className="character-active-filter-type">Tag:</span>
                <span className="character-active-filter-value">{tag}</span>
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="character-active-filter-remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterFilters;