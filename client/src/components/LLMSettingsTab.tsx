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
      <h3 className="section-title">Large Language Model Settings</h3>

      {/* Basic LLM Settings */}
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

      {/* Custom Prompt Settings */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-yellow)' }}>
        <h4 className="section-title">Custom Prompt Settings</h4>

        <SettingField
          description="Enable custom system prompts and author's notes (Advanced users only)"
        >
          <CheckboxInput
            id="systemPromptCustomization"
            checked={settings.llmSettings.systemPromptCustomization}
            onChange={(v) => updateBoolean('systemPromptCustomization', v)}
            label="⚙️ Enable custom prompts"
          />
        </SettingField>

        {settings.llmSettings.systemPromptCustomization && (
          <>
            <SettingField
              label="📜 Custom System Prompt"
              description="Override the default character behavior with a custom system prompt. Leave empty to use character defaults."
            >
              <textarea
                value={settings.llmSettings.customSystemPrompt || ''}
                onChange={(e) => updateString('customSystemPrompt', e.target.value)}
                placeholder="Enter your custom system prompt here..."
                className="form-input form-textarea"
                rows={6}
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </SettingField>

            <SettingField
              label="📋 Author's Note"
              description="Additional instructions added at the end of each prompt. Useful for style guidance or special instructions."
            >
              <textarea
                value={settings.llmSettings.authorsNote || ''}
                onChange={(e) => updateString('authorsNote', e.target.value)}
                placeholder="e.g., 'Keep responses under 100 words', 'Use a formal tone', 'Focus on practical advice'..."
                className="form-input form-textarea"
                rows={3}
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </SettingField>
          </>
        )}
      </div>

      <div className="performance-info">
        <h4>💡 Custom Prompt Tips</h4>
        <ul>
          <li><strong>System Prompt:</strong> Defines the AI's core personality and behavior</li>
          <li><strong>Author's Note:</strong> Fine-tune responses without changing the main prompt</li>
          <li>Use the Prompt Inspector to see how your changes affect the final prompt</li>
          <li>Custom prompts override character defaults completely</li>
          <li>Test changes incrementally to see their effects</li>
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