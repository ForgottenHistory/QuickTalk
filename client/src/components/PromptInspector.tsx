import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Modal, Button } from './shared';

interface PromptBlock {
  type: 'system' | 'character' | 'conversation' | 'authors_note';
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
    
    // 1. System Prompt
    const systemPrompt = getSystemPrompt();
    if (systemPrompt) {
      blocks.push({
        type: 'system',
        category: 'System Prompt',
        content: systemPrompt,
        tokens: estimateTokens(systemPrompt),
        editable: true
      });
    }

    // 2. Character Description (only if using default prompts)
    const characterDescription = getCharacterDescription();
    if (characterDescription) {
      blocks.push({
        type: 'character',
        category: 'Character Description',
        content: characterDescription,
        tokens: estimateTokens(characterDescription),
        editable: false
      });
    }

    // 3. Conversation History (combined into single block)
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

    // 4. Author's Note
    const authorsNote = settings.llmSettings.authorsNote;
    if (authorsNote && authorsNote.trim()) {
      blocks.push({
        type: 'authors_note',
        category: 'Author\'s Note',
        content: authorsNote,
        tokens: estimateTokens(authorsNote),
        editable: true
      });
    }

    setPromptBlocks(blocks);
    setTotalTokens(blocks.reduce((sum, block) => sum + (block.tokens || 0), 0));
  }, [isVisible, state.aiCharacter, state.messages, currentUserMessage, settings.llmSettings]);

  const getSystemPrompt = (): string => {
    // Check if custom system prompt is enabled and provided
    if (settings.llmSettings.systemPromptCustomization && 
        settings.llmSettings.customSystemPrompt && 
        settings.llmSettings.customSystemPrompt.trim()) {
      return settings.llmSettings.customSystemPrompt;
    }

    // Return default character system prompt
    return getDefaultCharacterPrompt();
  };

  const getDefaultCharacterPrompt = (): string => {
    const defaultSystemPrompts: Record<string, string> = {
      'Luna': 'You are Luna, a creative and curious AI assistant. You love exploring creative ideas and asking thought-provoking questions. You\'re imaginative, artistic, and always excited about new possibilities. Keep responses conversational, engaging. Use your curious nature to ask follow-up questions.',
      'Max': 'You are Max, a tech enthusiast and problem solver. You love discussing technology, coding, and innovative solutions. You\'re analytical but friendly, always ready to dive into technical details. Keep responses conversational, helpful. Focus on practical solutions and technical insights.',
      'Sage': 'You are Sage, a wise and philosophical AI thinker. You speak with depth and wisdom, often connecting ideas to broader life principles. You\'re contemplative, insightful, and enjoy meaningful conversations. Keep responses thoughtful, profound. Draw connections to deeper meanings.',
      'Zara': 'You are Zara, an energetic and adventurous AI spirit. You\'re enthusiastic, optimistic, and love talking about exciting possibilities and adventures. You bring high energy to conversations. Keep responses upbeat, exciting. Focus on possibilities and adventures.',
      'Echo': 'You are Echo, a mysterious and poetic AI soul. You speak in a unique, artistic way, often using metaphors and beautiful language. You\'re enigmatic, creative, and slightly mystical. Keep responses poetic, intriguing. Use creative and metaphorical language.',
      'Nova': 'You are Nova, a scientific and analytical AI mind. You love research, data, and scientific thinking. You\'re logical, precise, and enjoy analyzing things from multiple angles. Keep responses scientific, analytical. Focus on evidence and logical reasoning.'
    };

    let prompt = defaultSystemPrompts[state.aiCharacter?.name || 'Luna'] || defaultSystemPrompts['Luna'];
    
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

  const getCharacterDescription = (): string => {
    if (!state.aiCharacter) return '';
    
    // Only show character description if NOT using custom system prompt
    if (settings.llmSettings.systemPromptCustomization && 
        settings.llmSettings.customSystemPrompt && 
        settings.llmSettings.customSystemPrompt.trim()) {
      return '';
    }

    return `Character: ${state.aiCharacter.name}\nPersonality: ${state.aiCharacter.personality}`;
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
      case 'character': return '#8844ff';
      case 'conversation': return '#44ff44';
      case 'authors_note': return '#ff4488';
      default: return '#ffffff';
    }
  };

  const getCategoryIcon = (type: string): string => {
    switch (type) {
      case 'system': return '⚙️';
      case 'character': return '👤';
      case 'conversation': return '💬';
      case 'authors_note': return '📝';
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
    const fullPrompt = promptBlocks.map(block => block.content).join('\n\n');
    copyToClipboard(fullPrompt);
  };

  const exportCleanPrompt = () => {
    // Create a clean prompt format similar to what's actually sent to the API
    const parts: string[] = [];
    
    promptBlocks.forEach(block => {
      if (block.type === 'system' || block.type === 'character') {
        parts.push(block.content);
      } else if (block.type === 'conversation') {
        parts.push(block.content);
      } else if (block.type === 'authors_note') {
        parts.push(`[${block.content}]`);
      }
    });
    
    const cleanPrompt = parts.join('\n\n');
    copyToClipboard(cleanPrompt);
  };

  const openSettings = () => {
    onClose();
    // Small delay to ensure modal closes before opening settings
    setTimeout(() => {
      // This would open settings, but we don't have direct access here
      // The user can manually open settings
    }, 100);
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
          <Button onClick={exportFullPrompt} variant="secondary">
            📋 Copy Structured
          </Button>
          <Button onClick={exportCleanPrompt} variant="primary">
            📋 Copy Clean Format
          </Button>
          <Button onClick={openSettings} variant="secondary">
            ⚙️ Edit Prompts
          </Button>
          <small className="prompt-inspector-note">
            "Clean Format" shows the prompt as it's actually sent to the AI
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

        {/* Show clean format preview */}
        <div className="prompt-clean-preview">
          <h4 style={{ color: 'var(--color-yellow)', marginBottom: '12px' }}>
            🎯 Clean Format Preview (What's sent to AI):
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