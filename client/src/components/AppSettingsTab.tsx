import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { 
  SettingField, 
  NumberInput, 
  CheckboxInput, 
  ResetButton 
} from './SettingField';

const AppSettingsTab: React.FC = () => {
  const { settings, dispatch, resetAppSettings } = useSettingsContext();

  const updateNumber = (key: string, value: number) => {
    dispatch({ 
      type: 'UPDATE_APP_SETTINGS_LOCAL', 
      payload: { [key]: value } 
    });
  };

  const updateBoolean = (key: string, value: boolean) => {
    dispatch({ 
      type: 'UPDATE_APP_SETTINGS_LOCAL', 
      payload: { [key]: value } 
    });
  };

  const handleReset = async () => {
    if (window.confirm('Reset app settings to defaults?')) {
      await resetAppSettings();
    }
  };

  return (
    <div>
      <h3 style={{ color: '#ffd900', marginBottom: '24px', fontSize: '20px' }}>
        Application Settings
      </h3>

      <SettingField
        label="⏱️ Default Session Duration (minutes)"
        description="How long each chat session lasts (5-60 minutes)"
      >
        <NumberInput
          value={settings.appSettings.sessionDuration}
          onChange={(v) => updateNumber('sessionDuration', v)}
          min={5}
          max={60}
        />
      </SettingField>

      <SettingField
        label="➕ Extension Duration (minutes)"
        description="How much time is added when extending a session (5-30 minutes)"
      >
        <NumberInput
          value={settings.appSettings.extensionDuration}
          onChange={(v) => updateNumber('extensionDuration', v)}
          min={5}
          max={30}
        />
      </SettingField>

      <SettingField
        label="⚠️ Extension Warning Time (minutes)"
        description="How many minutes before session ends to show extension prompt (1-5 minutes)"
      >
        <NumberInput
          value={settings.appSettings.extensionWarningTime}
          onChange={(v) => updateNumber('extensionWarningTime', v)}
          min={1}
          max={5}
        />
      </SettingField>

      <SettingField
        description="Automatically start a new session when current one ends"
      >
        <CheckboxInput
          id="autoConnect"
          checked={settings.appSettings.autoConnect}
          onChange={(v) => updateBoolean('autoConnect', v)}
          label="🔄 Auto-connect to new AI after session ends"
        />
      </SettingField>

      <SettingField
        description="Play sounds for new messages and time warnings"
      >
        <CheckboxInput
          id="soundEnabled"
          checked={settings.appSettings.soundEnabled}
          onChange={(v) => updateBoolean('soundEnabled', v)}
          label="🔊 Enable sound notifications"
        />
      </SettingField>

      <ResetButton
        onClick={handleReset}
        loading={settings.isLoading}
        type="App"
      />
    </div>
  );
};

export default AppSettingsTab;