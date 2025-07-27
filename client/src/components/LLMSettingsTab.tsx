import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';

const LLMSettingsTab: React.FC = () => {
  const { settings, dispatch } = useSettingsContext();

  const handleLLMSettingChange = (key: string, value: any) => {
    dispatch({ 
      type: 'UPDATE_LLM_SETTINGS', 
      payload: { [key]: value } 
    });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_LLM_SETTINGS' });
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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const availableModels = [
    'moonshotai/Kimi-K2-Instruct',
    'claude-3-sonnet',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'llama-2-70b'
  ];

  return (
    <div>
      <h3 style={{
        color: '#ffd900',
        marginBottom: '24px',
        fontSize: '20px'
      }}>
        Large Language Model Settings
      </h3>

      {/* Model Selection */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          🤖 AI Model
        </label>
        <select
          value={settings.llmSettings.model}
          onChange={(e) => handleLLMSettingChange('model', e.target.value)}
          style={selectStyle}
        >
          {availableModels.map(model => (
            <option key={model} value={model} style={{ backgroundColor: '#000000' }}>
              {model}
            </option>
          ))}
        </select>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Choose the AI model for generating responses
        </small>
      </div>

      {/* Temperature */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          🌡️ Creativity (Temperature): {settings.llmSettings.temperature}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.llmSettings.temperature}
          onChange={(e) => handleLLMSettingChange('temperature', parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: '#000000',
            outline: 'none',
            accentColor: '#ffd900'
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '12px', 
          color: '#ffec3d',
          marginTop: '4px'
        }}>
          <span>Conservative (0.0)</span>
          <span>Creative (1.0)</span>
        </div>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Higher values make responses more creative but less predictable
        </small>
      </div>

      {/* Max Tokens */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          📝 Max Response Length (tokens)
        </label>
        <input
          type="number"
          min="50"
          max="1000"
          step="50"
          value={settings.llmSettings.maxTokens}
          onChange={(e) => handleLLMSettingChange('maxTokens', parseInt(e.target.value))}
          style={inputStyle}
        />
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Maximum length of AI responses (50-1000 tokens, ~300 tokens ≈ 200 words)
        </small>
      </div>

      {/* Response Length Preset */}
      <div style={settingStyle}>
        <label style={labelStyle}>
          📏 Response Length Preset
        </label>
        <select
          value={settings.llmSettings.responseLength}
          onChange={(e) => handleLLMSettingChange('responseLength', e.target.value)}
          style={selectStyle}
        >
          <option value="short" style={{ backgroundColor: '#000000' }}>Short (50-150 tokens)</option>
          <option value="medium" style={{ backgroundColor: '#000000' }}>Medium (150-300 tokens)</option>
          <option value="long" style={{ backgroundColor: '#000000' }}>Long (300-500 tokens)</option>
        </select>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Quick preset for common response lengths
        </small>
      </div>

      {/* System Prompt Customization */}
      <div style={settingStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="checkbox"
            id="systemPromptCustomization"
            checked={settings.llmSettings.systemPromptCustomization}
            onChange={(e) => handleLLMSettingChange('systemPromptCustomization', e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#ffd900'
            }}
          />
          <label htmlFor="systemPromptCustomization" style={{
            ...labelStyle,
            margin: 0,
            cursor: 'pointer'
          }}>
            ⚙️ Enable custom system prompts
          </label>
        </div>
        <small style={{ color: '#ffec3d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Allow modification of AI character system prompts (Advanced users only)
        </small>
      </div>

      {/* Performance Info */}
      <div style={{
        backgroundColor: '#000000',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #ffd900',
        marginBottom: '24px'
      }}>
        <h4 style={{ color: '#ffd900', margin: '0 0 8px 0', fontSize: '14px' }}>
          💡 Performance Tips
        </h4>
        <ul style={{ 
          color: '#ffec3d', 
          fontSize: '12px', 
          margin: 0, 
          paddingLeft: '16px' 
        }}>
          <li>Lower temperature (0.3-0.5) for more consistent responses</li>
          <li>Higher temperature (0.7-0.9) for more creative conversations</li>
          <li>Shorter responses load faster and use less API credits</li>
          <li>Different models have different personalities and capabilities</li>
        </ul>
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

export default LLMSettingsTab;