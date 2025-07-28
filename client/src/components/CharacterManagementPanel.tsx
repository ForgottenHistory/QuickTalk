import React from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Modal, Button, LoadingSpinner, Pagination } from './shared';
import CharacterGrid from './CharacterGrid';
import CharacterEditor from './CharacterEditor';
import CharacterFilters from './CharacterFilters';
import CharacterActions from './CharacterActions';

interface PanelHeaderProps {
  totalCharacters: number;
  filteredCount: number;
  onCreateNew: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ 
  totalCharacters, filteredCount, onCreateNew 
}) => (
  <div className="character-management-header">
    <div className="character-management-title-container">
      <h2 className="character-management-title">📚 Character Management</h2>
      <div className="character-count">
        {filteredCount} of {totalCharacters} characters
      </div>
    </div>
    <Button onClick={onCreateNew} variant="primary">
      ➕ Create New Character
    </Button>
  </div>
);

interface StatusMessageProps {
  error: string | null;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className={`status-message ${error.startsWith('✓') ? 'success' : 'error'}`}>
      {error}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="character-loading-overlay">
      <div className="character-loading-content">
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    </div>
  );
};

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
      <PanelHeader
        totalCharacters={state.characters.length}
        filteredCount={filteredCharacters.length}
        onCreateNew={handleCreateNew}
      />

      <StatusMessage error={state.error} />

      {state.isEditing && <CharacterEditor />}

      <div className="character-management-content">
        <div className="character-management-controls">
          <CharacterFilters />
          <CharacterActions />
        </div>

        <CharacterGrid />

        <Pagination
          currentPage={state.currentPage}
          totalPages={totalPages}
          onPageChange={(page) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page })}
          className="character-pagination"
        />
      </div>

      <LoadingOverlay isVisible={state.isLoading} />
    </Modal>
  );
};

export default CharacterManagementPanel;