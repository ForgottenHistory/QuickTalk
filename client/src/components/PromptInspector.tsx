import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Modal, Button } from './shared';

interface PromptBlock {
  type: 'system' | 'roleplay_context' | 'conversation' | 'authors_note';
  category: string;
  content: string;
  tokens?: number;
  editable?: boolean;
}

interface PromptInspectorProps {
  isVisible: boolean;
  onClose: () => void;
  currentUserMessage: string;
}

const PromptInspector: React.FC<PromptInspectorProps> = ({
  isVisible,
  onClose,
  currentUserMessage
}) => {
  const { state } = useAppContext();
  const { settings } = useSettingsContext();
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);

  // Rough token estimation (4 chars ≈ 1 token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  useEffect(() => {
    if (!isVisible || !state.aiCharacter) return;

    const blocks: PromptBlock[] = [];

    // 1. System Prompt (using template)
    const systemPrompt = getSystemPromptFromTemplate();
    if (systemPrompt) {
      blocks.push({
        type: 'system',
        category: 'Complete System Prompt (from Template)',
        content: systemPrompt,
        tokens: estimateTokens(systemPrompt),
        editable: true
      });
    }

    // 2. Conversation History
    const conversationHistory = getConversationHistory(currentUserMessage);
    if (conversationHistory) {
      blocks.push({
        type: 'conversation',
        category: 'Conversation History',
        content: conversationHistory,
        tokens: estimateTokens(conversationHistory),
        editable: false
      });
    }

    // 3. Author's Note (Style instructions)
    const authorsNote = settings.llmSettings.authorsNote;
    if (authorsNote && authorsNote.trim()) {
      blocks.push({
        type: 'authors_note',
        category: 'Style Instructions',
        content: `[Style: ${authorsNote}]`,
        tokens: estimateTokens(authorsNote) + 2, // +2 for wrapper
        editable: true
      });
    }

    setPromptBlocks(blocks);
    setTotalTokens(blocks.reduce((sum, block) => sum + (block.tokens || 0), 0));
  }, [
    isVisible,
    state.aiCharacter,
    state.messages,
    state.timer.minutes, // Add timer dependency
    state.timer.seconds, // Add timer dependency  
    state.timer.isActive, // Add timer dependency
    currentUserMessage,
    settings.llmSettings
  ]);

  // Simple template engine matching backend
  const renderTemplate = (template: string, data: Record<string, any>): string => {
    let result = template;

    // Handle {{#if variable}} blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    // Handle simple variable substitutions
    result = result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || '';
    });

    return result.trim();
  };

  const getSystemPromptFromTemplate = (): string => {
    if (!state.aiCharacter) return '';

    // Calculate time variables
    const totalSeconds = state.timer.minutes * 60 + state.timer.seconds;
    let timeMinutes = 0;
    let timeSeconds = 0;
    let timeFormatted = '';
    let timeGuidance = '';

    if (state.timer.isActive && totalSeconds > 0) {
      timeMinutes = Math.floor(totalSeconds / 60);
      timeSeconds = totalSeconds % 60;

      if (timeMinutes > 0) {
        timeFormatted = `${timeMinutes} minute${timeMinutes !== 1 ? 's' : ''}${timeSeconds > 0 ? ` and ${timeSeconds} second${timeSeconds !== 1 ? 's' : ''}` : ''}`;
      } else {
        timeFormatted = `${timeSeconds} second${timeSeconds !== 1 ? 's' : ''}`;
      }

      // Generate time-based guidance
      if (timeMinutes <= 2) {
        timeGuidance = 'The conversation is nearing its end. You may naturally acknowledge this and express whether you\'d be interested in extending the chat if you\'re enjoying it.';
      } else if (timeMinutes <= 5) {
        timeGuidance = 'The conversation is in its later stages. Continue engaging meaningfully.';
      }
    }

    // Prepare template data with all available variables
    const templateData: Record<string, any> = {
      // Character variables (standard format)
      char: state.aiCharacter.name,
      description: state.aiCharacter.description,
      personality: state.aiCharacter.personality,

      // Common character card aliases
      character: state.aiCharacter.name,
      name: state.aiCharacter.name,
      user: 'Human', // Standard user reference

      // Session variables
      sessionDuration: settings.appSettings.sessionDuration.toString(),
      extensionDuration: settings.appSettings.extensionDuration.toString(),
      extensionWarningTime: settings.appSettings.extensionWarningTime.toString(),

      // Time variables
      timeRemaining: timeFormatted,
      timeMinutes: timeMinutes.toString(),
      timeSeconds: timeSeconds.toString(),
      timeGuidance: timeGuidance,

      // Response length
      responseLength: settings.llmSettings.responseLength,
      maxTokens: settings.llmSettings.maxTokens.toString(),
    };

    // Get system prompt (custom or default) and apply template processing
    let systemPrompt;
    if (settings.llmSettings.systemPromptCustomization &&
      settings.llmSettings.customSystemPrompt &&
      settings.llmSettings.customSystemPrompt.trim()) {
      // Apply template processing to custom system prompt
      const customPromptTemplate = settings.llmSettings.customSystemPrompt;
      systemPrompt = renderTemplate(customPromptTemplate, templateData);
    } else {
      systemPrompt = getDefaultCharacterPrompt();
    }

    // Add system prompt to template data for context template
    templateData.system = systemPrompt;

    // Get the context template
    const template = settings.llmSettings.contextTemplate || '';

    console.log('Frontend template data with processed system prompt:', JSON.stringify(templateData, null, 2));

    // Only include description if it exists and is different from personality
    if (!templateData.description || templateData.description === templateData.personality) {
      delete templateData.description;
    }

    console.log('Final template data:', JSON.stringify(templateData, null, 2));

    const result = renderTemplate(template, templateData);
    console.log('Rendered template result:', result);

    return result;
  };

  const getDefaultCharacterPrompt = (): string => {
    if (!state.aiCharacter) return '';

    // Calculate time remaining for display
    const totalSeconds = state.timer.minutes * 60 + state.timer.seconds;

    let prompt = `You are ${state.aiCharacter.name}, an AI character with the following personality: ${state.aiCharacter.personality}

Stay true to your character while being conversational, engaging, and helpful. Respond naturally and authentically based on your personality traits.`;

    // Add scenario context (matching backend)
    prompt += `\n\n## SCENARIO CONTEXT
You are participating in Quicktalk - a unique chat platform where humans have timed conversations with AI characters. Here's how it works:

- Each conversation has a ${settings.appSettings.sessionDuration}-minute time limit
- When time is almost up (${settings.appSettings.extensionWarningTime} minutes remaining), both you and the human can choose to extend for another ${settings.appSettings.extensionDuration} minutes
- If either party declines extension, the human connects to a different AI character
- You should be aware of the time remaining and engage meaningfully within this timeframe
- Near the end, you might naturally reference the time limit or express interest in continuing if you're enjoying the conversation`;

    // Add time awareness if timer is active
    if (state.timer.isActive && totalSeconds > 0) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes > 0) {
        prompt += `\n\n## TIME REMAINING: ${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds > 0 ? `and ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
      } else {
        prompt += `\n\n## TIME REMAINING: ${seconds} second${seconds !== 1 ? 's' : ''}`;
      }

      // Add time-based guidance
      if (minutes <= 2) {
        prompt += `\nThe conversation is nearing its end. You may naturally acknowledge this and express whether you'd be interested in extending the chat if you're enjoying it.`;
      } else if (minutes <= 5) {
        prompt += `\nThe conversation is in its later stages. Continue engaging meaningfully.`;
      }
    }

    // Adjust prompt based on response length setting
    const responseLength = settings.llmSettings.responseLength;
    const lengthInstructions = {
      'short': 'Keep responses very concise, under 100 words.',
      'medium': 'Keep responses moderate length, around 100-150 words.',
      'long': 'You can provide detailed responses, up to 200-250 words.'
    };

    prompt += ` ${lengthInstructions[responseLength]}`;

    return prompt;
  };

  const getRoleplayContext = (): string => {
    if (!state.aiCharacter) return '';

    // Only show roleplay context if NOT using custom system prompt
    if (settings.llmSettings.systemPromptCustomization &&
      settings.llmSettings.customSystemPrompt &&
      settings.llmSettings.customSystemPrompt.trim()) {
      return '';
    }

    const parts = [];
    parts.push('# **Roleplay Context**');

    // Character Description (use description if available, otherwise personality)
    const description = state.aiCharacter.personality; // For now, this is our description
    if (description) {
      parts.push(`## ${state.aiCharacter.name}'s Description:`);
      parts.push(description);
    }

    // Character Personality (same as description for our current setup)
    parts.push(`## ${state.aiCharacter.name}'s Personality:`);
    parts.push(state.aiCharacter.personality);

    // User Persona
    parts.push(`## User's Persona:`);
    parts.push('A human conversing with AI characters.');

    // Scenario
    parts.push(`## Scenario:`);
    parts.push(`You are ${state.aiCharacter.name} engaging in a conversation with a human user.`);

    // Example responses would go here if we had them
    // if (state.aiCharacter.exampleMessages) {
    //   parts.push(`## ${state.aiCharacter.name}'s Example Response:`);
    //   parts.push(state.aiCharacter.exampleMessages);
    // }

    parts.push('### **End of Roleplay Context**');

    return parts.join('\n\n');
  };

  const getConversationHistory = (currentMessage: string): string => {
    const recentHistory = state.messages.slice(-6);
    const historyParts: string[] = [];

    // Add conversation history
    recentHistory.forEach(msg => {
      const role = msg.sender === 'user' ? 'Human' : (state.aiCharacter?.name || 'Assistant');
      historyParts.push(`${role}: ${msg.text}`);
    });

    // Add current user message if provided
    if (currentMessage.trim()) {
      historyParts.push(`Human: ${currentMessage}`);
    }

    return historyParts.length > 0 ? historyParts.join('\n\n') : '';
  };

  const getCategoryColor = (type: string): string => {
    switch (type) {
      case 'system': return '#ff8800';
      case 'roleplay_context': return '#8844ff';
      case 'conversation': return '#44ff44';
      case 'authors_note': return '#ff4488';
      default: return '#ffffff';
    }
  };

  const getCategoryIcon = (type: string): string => {
    switch (type) {
      case 'system': return '⚙️';
      case 'roleplay_context': return '🎭';
      case 'conversation': return '💬';
      case 'authors_note': return '🎨';
      default: return '📄';
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportFullPrompt = () => {
    // Export the complete SillyTavern format as it's actually sent
    const fullPrompt = promptBlocks.map(block => block.content).join('\n\n');
    copyToClipboard(fullPrompt);
  };

  const exportCleanFormat = () => {
    // Export without any role prefixes - just the raw content
    const parts: string[] = [];

    promptBlocks.forEach(block => {
      parts.push(block.content);
    });

    const cleanPrompt = parts.join('\n\n');
    copyToClipboard(cleanPrompt);
  };

  const exportApiMessages = () => {
    // Export showing how it's structured as API messages
    const messages: string[] = [];

    // System message (combines system prompt + roleplay context)
    const systemParts: string[] = [];
    const systemBlock = promptBlocks.find(b => b.type === 'system');
    const contextBlock = promptBlocks.find(b => b.type === 'roleplay_context');

    if (systemBlock) systemParts.push(systemBlock.content);
    if (contextBlock) systemParts.push(contextBlock.content);

    if (systemParts.length > 0) {
      messages.push(`{"role": "system", "content": "${systemParts.join('\\n\\n').replace(/"/g, '\\"')}"}`);
    }

    // Add conversation history as separate messages
    const recentHistory = state.messages.slice(-6);
    recentHistory.forEach(msg => {
      const role = msg.sender === 'user' ? 'user' : 'assistant';
      messages.push(`{"role": "${role}", "content": "${msg.text.replace(/"/g, '\\"')}"}`);
    });

    // Current user message
    if (currentUserMessage.trim()) {
      messages.push(`{"role": "user", "content": "${currentUserMessage.replace(/"/g, '\\"')}"}`);
    }

    // Author's note as system message
    const authorsBlock = promptBlocks.find(b => b.type === 'authors_note');
    if (authorsBlock) {
      messages.push(`{"role": "system", "content": "${authorsBlock.content.replace(/"/g, '\\"')}"}`);
    }

    const apiFormat = `[\n  ${messages.join(',\n  ')}\n]`;
    copyToClipboard(apiFormat);
  };

  const openSettings = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal isVisible={true} onClose={onClose} className="prompt-inspector-modal">
      <div className="prompt-inspector-header">
        <h2 className="prompt-inspector-title">🔍 Prompt Inspector</h2>
        <div className="prompt-inspector-stats">
          <span className="prompt-stat">
            📝 {promptBlocks.length} blocks
          </span>
          <span className="prompt-stat">
            🔢 ~{totalTokens} tokens
          </span>
        </div>
      </div>

      <div className="prompt-inspector-content">
        <div className="prompt-inspector-controls">
          <Button onClick={exportFullPrompt} variant="primary">
            📋 Copy SillyTavern Format
          </Button>
          <Button onClick={exportCleanFormat} variant="secondary">
            📋 Copy Clean Text
          </Button>
          <Button onClick={exportApiMessages} variant="secondary">
            📋 Copy API Messages
          </Button>
          <Button onClick={openSettings} variant="secondary">
            ⚙️ Edit Prompts
          </Button>
          <small className="prompt-inspector-note">
            SillyTavern Format shows the complete structured prompt. API Messages shows the raw API call format.
          </small>
        </div>

        <div className="prompt-blocks">
          {promptBlocks.map((block, index) => (
            <div key={index} className="prompt-block">
              <div
                className="prompt-block-header"
                style={{ borderLeftColor: getCategoryColor(block.type) }}
              >
                <div className="prompt-block-info">
                  <span className="prompt-block-category">
                    {getCategoryIcon(block.type)} {block.category}
                  </span>
                  <div className="prompt-block-meta">
                    <span className="prompt-block-tokens">
                      ~{block.tokens} tokens
                    </span>
                    {block.editable && (
                      <span className="prompt-block-editable">
                        ✏️ Editable in Settings
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(block.content)}
                  variant="secondary"
                  className="prompt-block-copy"
                >
                  📋
                </Button>
              </div>

              <div className="prompt-block-content">
                <pre className="prompt-block-text">
                  {block.content}
                </pre>
              </div>
            </div>
          ))}

          {promptBlocks.length === 0 && (
            <div className="prompt-inspector-empty">
              <p>No prompt data available. Start a conversation to see the prompt structure.</p>
            </div>
          )}
        </div>

        {/* Show complete prompt preview */}
        <div className="prompt-clean-preview">
          <h4 style={{ color: 'var(--color-yellow)', marginBottom: '12px' }}>
            🎯 Complete Prompt (SillyTavern Format):
          </h4>
          <div className="prompt-clean-content">
            <pre className="prompt-clean-text">
              {promptBlocks.map(block => block.content).join('\n\n')}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptInspector;