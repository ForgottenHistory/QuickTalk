import React from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Modal, Button, LoadingSpinner } from './shared';
import CharacterGrid from './CharacterGrid';
import CharacterEditor from './CharacterEditor';
import CharacterFilters from './CharacterFilters';
import CharacterActions from './CharacterActions';

const CharacterManagementPanel: React.FC = () => {
  const { state, dispatch, filteredCharacters, totalPages } = useCharacterContext();

  if (!state.isManagementOpen) {
    return null;
  }

  const handleClose = () => {
    if (state.isEditing) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
      dispatch({ type: 'STOP_EDITING' });
    }
    dispatch({ type: 'SET_MANAGEMENT_OPEN', payload: false });
  };

  const handleCreateNew = () => {
    dispatch({ type: 'START_EDITING', payload: null });
  };

  if (state.isLoading && state.characters.length === 0) {
    return (
      <Modal isVisible={true} className="character-management-modal">
        <LoadingSpinner
          text="📚 Loading Characters..."
          subtext="Please wait while we load your character library"
        />
      </Modal>
    );
  }

  return (
    <Modal isVisible={true} onClose={handleClose} className="character-management-modal">
      <div className="character-management-header">
        <div className="character-management-title-container">
          <h2 className="character-management-title">📚 Character Management</h2>
          <div className="character-count">
            {filteredCharacters.length} of {state.characters.length} characters
          </div>
        </div>
        <Button onClick={handleCreateNew} variant="primary">
          ➕ Create New Character
        </Button>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className={`status-message ${state.error.startsWith('✓') ? 'success' : 'error'}`}>
          {state.error}
        </div>
      )}

      {/* Editor Modal */}
      {state.isEditing && (
        <CharacterEditor />
      )}

      {/* Main Content */}
      <div className="character-management-content">
        {/* Filters and Actions */}
        <div className="character-management-controls">
          <CharacterFilters />
          <CharacterActions />
        </div>

        {/* Character Grid */}
        <CharacterGrid />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="character-pagination">
            <Button
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage - 1 })}
              disabled={state.currentPage === 1}
              variant="secondary"
            >
              ← Previous
            </Button>
            
            <span className="pagination-info">
              Page {state.currentPage} of {totalPages}
            </span>
            
            <Button
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage + 1 })}
              disabled={state.currentPage === totalPages}
              variant="secondary"
            >
              Next →
            </Button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="character-loading-overlay">
          <div className="character-loading-content">
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CharacterManagementPanel;