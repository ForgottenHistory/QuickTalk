import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { Modal, Button, LoadingSpinner, StatusBadge } from './shared';
import AppSettingsTab from './AppSettingsTab';
import LLMSettingsTab from './LLMSettingsTab';

const SettingsPanel: React.FC = () => {
  const { settings, dispatch, saveAllSettings, discardChanges } = useSettingsContext();

  if (!settings.isOpen) {
    return null;
  }

  if (!settings.initialLoadComplete) {
    return (
      <Modal isVisible={true} className="settings-modal">
        <LoadingSpinner
          text="⚙️ Loading Settings..."
          subtext="Please wait while we load your preferences"
        />
      </Modal>
    );
  }

  const handleClose = () => {
    if (settings.hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close without saving?');
      if (!confirmClose) return;
    }
    dispatch({ type: 'SET_SETTINGS_OPEN', payload: false });
  };

  const handleTabClick = (tab: 'app' | 'llm') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  return (
    <Modal isVisible={true} onClose={handleClose} className="settings-modal">
      <div className="settings-header">
        <div className="settings-title-container">
          <h2 className="settings-title">⚙️ Settings</h2>
          {settings.hasUnsavedChanges && (
            <StatusBadge text="Unsaved Changes" variant="warning" />
          )}
        </div>
      </div>

      {/* Status Messages */}
      {settings.error && (
        <div className={`status-message ${settings.error.includes('using defaults') ? 'warning' : 'error'}`}>
          {settings.error.includes('using defaults') ? '⚠️ ' : '❌ '}
          {settings.error}
        </div>
      )}

      {settings.saveSuccess && (
        <div className="status-message success">
          ✓ Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          onClick={() => handleTabClick('app')}
          className={`settings-tab ${settings.activeTab === 'app' ? 'active' : ''}`}
        >
          🏠 App Settings
        </button>
        <button
          onClick={() => handleTabClick('llm')}
          className={`settings-tab ${settings.activeTab === 'llm' ? 'active' : ''}`}
        >
          🤖 LLM Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {settings.activeTab === 'app' ? <AppSettingsTab /> : <LLMSettingsTab />}
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <div className={`settings-status ${settings.hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
          {settings.hasUnsavedChanges ? '⚠️ You have unsaved changes' : '✓ All changes saved'}
        </div>
        
        <div className="settings-actions">
          <Button
            onClick={discardChanges}
            disabled={!settings.hasUnsavedChanges || settings.isLoading}
            variant="secondary"
          >
            Discard Changes
          </Button>
          
          <Button
            onClick={saveAllSettings}
            disabled={!settings.hasUnsavedChanges || settings.isLoading}
            variant="primary"
          >
            {settings.isLoading ? '⏳ Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsPanel;