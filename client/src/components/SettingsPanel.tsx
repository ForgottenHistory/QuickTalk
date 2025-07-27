import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import AppSettingsTab from './AppSettingsTab';
import LLMSettingsTab from './LLMSettingsTab';

const SettingsPanel: React.FC = () => {
  const { settings, dispatch } = useSettingsContext();

  if (!settings.isOpen) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: 'SET_SETTINGS_OPEN', payload: false });
  };

  const handleTabClick = (tab: 'app' | 'llm') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

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
          <h2 style={{
            color: '#ffd900',
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            ⚙️ Settings
          </h2>
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
      </div>
    </div>
  );
};

export default SettingsPanel;