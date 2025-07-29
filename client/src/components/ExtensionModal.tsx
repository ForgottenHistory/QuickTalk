import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { useAppContext } from '../context/AppContext';
import { Modal, Button } from './shared';

interface ExtensionModalProps {
  isVisible: boolean;
  onExtend: () => void;
  onDecline: () => void;
  aiWantsExtension: boolean;
  userDecision?: 'extend' | 'decline' | null;
}

const ExtensionModal: React.FC<ExtensionModalProps> = ({ 
  isVisible, 
  onExtend, 
  onDecline, 
  aiWantsExtension,
  userDecision 
}) => {
  const { settings } = useSettingsContext();
  const { state } = useAppContext();
  const extensionDuration = settings.appSettings.extensionDuration;
  const aiCharacterName = state.aiCharacter?.name || 'AI';

  const getStatusText = () => {
    // If user made decision but AI hasn't yet
    if (userDecision && !state.extensionState.aiDecision) {
      return userDecision === 'extend' 
        ? `⏳ Waiting for ${aiCharacterName} to decide...`
        : `👋 Session ending. Connecting to new AI...`;
    }

    // If both decisions are made
    if (userDecision && state.extensionState.aiDecision) {
      if (userDecision === 'extend' && state.extensionState.aiDecision === 'extend') {
        return `🎉 Both parties want to extend! Adding ${extensionDuration} minutes...`;
      } else if (userDecision === 'extend' && state.extensionState.aiDecision === 'decline') {
        return `😔 Sorry, ${aiCharacterName} doesn't want to continue. Connecting to new AI...`;
      } else {
        return "👋 Session ending. Connecting to new AI...";
      }
    }

    return null;
  };

  const statusText = getStatusText();
  const showButtons = !userDecision; // Hide buttons once user has decided

  return (
    <Modal isVisible={isVisible} className="extension-modal">
      <div className="modal-body">
        {statusText ? (
          <div className="extension-result">
            {statusText}
          </div>
        ) : (
          <div className="extension-prompt">
            <div className="extension-title">
              ⏰ Time's Almost Up!
            </div>
            
            <div className="extension-question">
              Would you like to extend this conversation by {extensionDuration} minutes?
            </div>
            
            <div className="extension-ai-status">
              {state.extensionState.aiDecision === 'extend'
                ? `🌟 ${aiCharacterName} wants to continue chatting!`
                : state.extensionState.aiDecision === 'decline'
                ? `😔 ${aiCharacterName} doesn't want to continue.`
                : `🤔 ${aiCharacterName} is deciding...`
              }
            </div>
            
            {showButtons && (
              <div className="extension-buttons">
                <Button onClick={onDecline} variant="secondary">
                  No, thanks
                </Button>
                <Button onClick={onExtend} variant="primary">
                  Yes, extend!
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExtensionModal;