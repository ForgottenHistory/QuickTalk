import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal, Button } from './shared';

interface PromptBlock {
  type: 'system' | 'user' | 'assistant';
  content: string;
  role: string;
  tokens?: number;
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
  const [promptBlocks, setPromptBlocks] = useState<PromptBlock[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);

  // Rough token estimation (4 chars ≈ 1 token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  useEffect(() => {
    if (!isVisible || !state.aiCharacter) return;

    const blocks: PromptBlock[] = [];
    
    // System prompt block
    const systemPrompt = getSystemPrompt(state.aiCharacter);
    blocks.push({
      type: 'system',
      role: 'system',
      content: systemPrompt,
      tokens: estimateTokens(systemPrompt)
    });

    // Conversation history (last 6 messages)
    const recentHistory = state.messages.slice(-6);
    recentHistory.forEach(msg => {
      blocks.push({
        type: msg.sender === 'user' ? 'user' : 'assistant',
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        tokens: estimateTokens(msg.text)
      });
    });

    // Current user message if provided
    if (currentUserMessage.trim()) {
      blocks.push({
        type: 'user',
        role: 'user',
        content: currentUserMessage,
        tokens: estimateTokens(currentUserMessage)
      });
    }

    setPromptBlocks(blocks);
    setTotalTokens(blocks.reduce((sum, block) => sum + (block.tokens || 0), 0));
  }, [isVisible, state.aiCharacter, state.messages, currentUserMessage]);

  // This matches the system prompt logic from aiService.js
  const getSystemPrompt = (character: any): string => {
    const systemPrompts: Record<string, string> = {
      'Luna': 'You are Luna, a creative and curious AI assistant. You love exploring creative ideas and asking thought-provoking questions. You\'re imaginative, artistic, and always excited about new possibilities. Keep responses conversational, engaging, and under 200 words. Use your curious nature to ask follow-up questions.',
      'Max': 'You are Max, a tech enthusiast and problem solver. You love discussing technology, coding, and innovative solutions. You\'re analytical but friendly, always ready to dive into technical details. Keep responses conversational, helpful, and under 200 words. Focus on practical solutions and technical insights.',
      'Sage': 'You are Sage, a wise and philosophical AI thinker. You speak with depth and wisdom, often connecting ideas to broader life principles. You\'re contemplative, insightful, and enjoy meaningful conversations. Keep responses thoughtful, profound, and under 200 words. Draw connections to deeper meanings.',
      'Zara': 'You are Zara, an energetic and adventurous AI spirit. You\'re enthusiastic, optimistic, and love talking about exciting possibilities and adventures. You bring high energy to conversations. Keep responses upbeat, exciting, and under 200 words. Focus on possibilities and adventures.',
      'Echo': 'You are Echo, a mysterious and poetic AI soul. You speak in a unique, artistic way, often using metaphors and beautiful language. You\'re enigmatic, creative, and slightly mystical. Keep responses poetic, intriguing, and under 200 words. Use creative and metaphorical language.',
      'Nova': 'You are Nova, a scientific and analytical AI mind. You love research, data, and scientific thinking. You\'re logical, precise, and enjoy analyzing things from multiple angles. Keep responses scientific, analytical, and under 200 words. Focus on evidence and logical reasoning.'
    };

    return systemPrompts[character.name] || systemPrompts['Luna'];
  };

  const getBlockColor = (type: string): string => {
    switch (type) {
      case 'system': return '#ff8800';
      case 'user': return '#ffd900';
      case 'assistant': return '#44ff44';
      default: return '#ffffff';
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
    const fullPrompt = promptBlocks.map(block => 
      `[${block.role.toUpperCase()}]\n${block.content}`
    ).join('\n\n---\n\n');
    
    copyToClipboard(fullPrompt);
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
            📋 Copy Full Prompt
          </Button>
          <small className="prompt-inspector-note">
            This shows the exact prompt structure sent to the AI
          </small>
        </div>

        <div className="prompt-blocks">
          {promptBlocks.map((block, index) => (
            <div key={index} className="prompt-block">
              <div 
                className="prompt-block-header"
                style={{ borderLeftColor: getBlockColor(block.type) }}
              >
                <div className="prompt-block-info">
                  <span className="prompt-block-role">
                    {block.role.toUpperCase()}
                  </span>
                  <span className="prompt-block-tokens">
                    ~{block.tokens} tokens
                  </span>
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
        </div>
      </div>
    </Modal>
  );
};

export default PromptInspector;