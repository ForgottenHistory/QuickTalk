import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import AppSettingsTab from './AppSettingsTab';
import LLMSettingsTab from './LLMSettingsTab';

const SettingsPanel: React.FC = () => {
  const { settings, dispatch, saveAllSettings, discardChanges } = useSettingsContext();

  if (!settings.isOpen) {
    return null;
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

  const handleSave = async () => {
    await saveAllSettings();
  };

  const handleDiscard = () => {
    discardChanges();
  };

  // Show loading state for initial load
  if (!settings.initialLoadComplete) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#212121',
          borderRadius: '16px',
          border: '2px solid #ffd900',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '24px',
            color: '#ffd900',
            marginBottom: '16px'
          }}>
            ⚙️ Loading Settings...
          </div>
          <div style={{
            color: '#ffffff',
            marginBottom: '20px'
          }}>
            Please wait while we load your preferences
          </div>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#000000',
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '0 auto'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffd900',
              animation: 'loading 2s ease-in-out infinite'
            }} />
          </div>
          <style>
            {`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#212121',
        borderRadius: '16px',
        border: '2px solid #ffd900',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #ffd900',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{
              color: '#ffd900',
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ⚙️ Settings
            </h2>
            {settings.hasUnsavedChanges && (
              <span style={{
                backgroundColor: '#ff4444',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Unsaved Changes
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffd900',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Status Messages */}
        {settings.error && (
          <div style={{
            backgroundColor: settings.error.includes('using defaults') ? '#ff8800' : '#ff4444',
            color: '#ffffff',
            padding: '12px 20px',
            fontSize: '14px'
          }}>
            {settings.error.includes('using defaults') ? '⚠️ ' : '❌ '}
            {settings.error}
          </div>
        )}

        {settings.saveSuccess && (
          <div style={{
            backgroundColor: '#44ff44',
            color: '#000000',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✓ Settings saved successfully!
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #ffd900'
        }}>
          <button
            onClick={() => handleTabClick('app')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: settings.activeTab === 'app' ? '#ffd900' : 'transparent',
              color: settings.activeTab === 'app' ? '#000000' : '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            🏠 App Settings
          </button>
          <button
            onClick={() => handleTabClick('llm')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: settings.activeTab === 'llm' ? '#ffd900' : 'transparent',
              color: settings.activeTab === 'llm' ? '#000000' : '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            🤖 LLM Settings
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {settings.activeTab === 'app' ? <AppSettingsTab /> : <LLMSettingsTab />}
        </div>

        {/* Save/Discard Footer */}
        <div style={{
          padding: '20px',
          borderTop: '2px solid #ffd900',
          backgroundColor: '#000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            color: settings.hasUnsavedChanges ? '#ffec3d' : '#ffffff',
            fontSize: '14px'
          }}>
            {settings.hasUnsavedChanges ? '⚠️ You have unsaved changes' : '✓ All changes saved'}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDiscard}
              disabled={!settings.hasUnsavedChanges || settings.isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #ffd900',
                backgroundColor: 'transparent',
                color: settings.hasUnsavedChanges ? '#ffd900' : '#666666',
                cursor: settings.hasUnsavedChanges && !settings.isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: settings.hasUnsavedChanges ? 1 : 0.5
              }}
            >
              Discard Changes
            </button>
            
            <button
              onClick={handleSave}
              disabled={!settings.hasUnsavedChanges || settings.isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: settings.hasUnsavedChanges ? '#ffd900' : '#666666',
                color: '#000000',
                cursor: settings.hasUnsavedChanges && !settings.isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: settings.isLoading ? 0.6 : 1
              }}
            >
              {settings.isLoading ? '⏳ Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;