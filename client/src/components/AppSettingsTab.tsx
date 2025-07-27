import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';

const AppSettingsTab: React.FC = () => {
  const { settings, dispatch } = useSettingsContext();

  const handleAppSettingChange = (key: string, value: any) => {
    dispatch({ 
      type: 'UPDATE_APP_SETTINGS', 
      payload: { [key]: value } 
    });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_APP_SETTINGS' });
  };

  const settingStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #ffd900',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none'
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div>
      <h3 style={{
        color: '#ffd900',
        marginBottom: '24px',
        fontSize: '20px'
      }}>
        Application Settings
      </h3>

      {/* Session Duration */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          ⏱️ Default Session Duration (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="60"
          value={settings.appSettings.sessionDuration}
          onChange={(e) => handleAppSettingChange('sessionDuration', parseInt(e.target.value))}
          style={inputStyle}
        />
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          How long each chat session lasts (5-60 minutes)
        </small>
      </div>

      {/* Extension Duration */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          ➕ Extension Duration (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="30"
          value={settings.appSettings.extensionDuration}
          onChange={(e) => handleAppSettingChange('extensionDuration', parseInt(e.target.value))}
          style={inputStyle}
        />
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          How much time is added when extending a session (5-30 minutes)
        </small>
      </div>

      {/* Extension Warning Time */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          ⚠️ Extension Warning Time (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="5"
          value={settings.appSettings.extensionWarningTime}
          onChange={(e) => handleAppSettingChange('extensionWarningTime', parseInt(e.target.value))}
          style={inputStyle}
        />
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          How many minutes before session ends to show extension prompt (1-5 minutes)
        </small>
      </div>

      {/* Auto Connect */}
      <div style={settingStyle}>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="autoConnect"
            checked={settings.appSettings.autoConnect}
            onChange={(e) => handleAppSettingChange('autoConnect', e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#ffd900'
            }}
          />
          <label htmlFor="autoConnect" style={{
            ...labelStyle,
            margin: 0,
            cursor: 'pointer'
          }}>
            🔄 Auto-connect to new AI after session ends
          </label>
        </div>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Automatically start a new session when current one ends
        </small>
      </div>

      {/* Sound Enabled */}
      <div style={settingStyle}>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="soundEnabled"
            checked={settings.appSettings.soundEnabled}
            onChange={(e) => handleAppSettingChange('soundEnabled', e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#ffd900'
            }}
          />
          <label htmlFor="soundEnabled" style={{
            ...labelStyle,
            margin: 0,
            cursor: 'pointer'
          }}>
            🔊 Enable sound notifications
          </label>
        </div>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Play sounds for new messages and time warnings
        </small>
      </div>

      {/* Reset Button */}
      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #ffd900'
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '2px solid #ffd900',
            backgroundColor: 'transparent',
            color: '#ffd900',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default AppSettingsTab;