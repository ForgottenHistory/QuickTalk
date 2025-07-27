import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { 
  SettingField, 
  NumberInput, 
  SelectInput, 
  CheckboxInput, 
  RangeInput, 
  ResetButton 
} from './SettingField';

const LLMSettingsTab: React.FC = () => {
  const { settings, dispatch, resetLLMSettings } = useSettingsContext();

  const updateString = (key: string, value: string) => {
    dispatch({ 
      type: 'UPDATE_LLM_SETTINGS_LOCAL', 
      payload: { [key]: value } 
    });
  };

  const updateNumber = (key: string, value: number) => {
    dispatch({ 
      type: 'UPDATE_LLM_SETTINGS_LOCAL', 
      payload: { [key]: value } 
    });
  };

  const updateBoolean = (key: string, value: boolean) => {
    dispatch({ 
      type: 'UPDATE_LLM_SETTINGS_LOCAL', 
      payload: { [key]: value } 
    });
  };

  const handleReset = async () => {
    if (window.confirm('Reset LLM settings to defaults?')) {
      await resetLLMSettings();
    }
  };

  const modelOptions = [
    { value: 'moonshotai/Kimi-K2-Instruct', label: 'moonshotai/Kimi-K2-Instruct' },
    { value: 'claude-3-sonnet', label: 'claude-3-sonnet' },
    { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
    { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
    { value: 'llama-2-70b', label: 'llama-2-70b' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short (50-150 tokens)' },
    { value: 'medium', label: 'Medium (150-300 tokens)' },
    { value: 'long', label: 'Long (300-500 tokens)' }
  ];

  return (
    <div>
      <h3 style={{ color: '#ffd900', marginBottom: '24px', fontSize: '20px' }}>
        Large Language Model Settings
      </h3>

      <SettingField
        label="🤖 AI Model"
        description="Choose the AI model for generating responses"
      >
        <SelectInput
          value={settings.llmSettings.model}
          onChange={(v) => updateString('model', v)}
          options={modelOptions}
        />
      </SettingField>

      <SettingField
        label={`🌡️ Creativity (Temperature): ${settings.llmSettings.temperature}`}
        description="Higher values make responses more creative but less predictable"
      >
        <RangeInput
          value={settings.llmSettings.temperature}
          onChange={(v) => updateNumber('temperature', v)}
          min={0}
          max={1}
          step={0.1}
          minLabel="Conservative (0.0)"
          maxLabel="Creative (1.0)"
        />
      </SettingField>

      <SettingField
        label="📝 Max Response Length (tokens)"
        description="Maximum length of AI responses (50-1000 tokens, ~300 tokens ≈ 200 words)"
      >
        <NumberInput
          value={settings.llmSettings.maxTokens}
          onChange={(v) => updateNumber('maxTokens', v)}
          min={50}
          max={1000}
          step={50}
        />
      </SettingField>

      <SettingField
        label="📏 Response Length Preset"
        description="Quick preset for common response lengths"
      >
        <SelectInput
          value={settings.llmSettings.responseLength}
          onChange={(v) => updateString('responseLength', v)}
          options={lengthOptions}
        />
      </SettingField>

      <SettingField
        description="Allow modification of AI character system prompts (Advanced users only)"
      >
        <CheckboxInput
          id="systemPromptCustomization"
          checked={settings.llmSettings.systemPromptCustomization}
          onChange={(v) => updateBoolean('systemPromptCustomization', v)}
          label="⚙️ Enable custom system prompts"
        />
      </SettingField>

      <div className="performance-info">
        <h4>💡 Performance Tips</h4>
        <ul>
          <li>Lower temperature (0.3-0.5) for more consistent responses</li>
          <li>Higher temperature (0.7-0.9) for more creative conversations</li>
          <li>Shorter responses load faster and use less API credits</li>
          <li>Different models have different personalities and capabilities</li>
        </ul>
      </div>

      <ResetButton
        onClick={handleReset}
        loading={settings.isLoading}
        type="LLM"
      />
    </div>
  );
};

export default LLMSettingsTab;