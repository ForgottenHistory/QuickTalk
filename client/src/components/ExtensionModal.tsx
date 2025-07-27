import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
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
  const extensionDuration = settings.appSettings.extensionDuration;

  const getStatusText = () => {
    if (userDecision === 'extend' && aiWantsExtension) {
      return `🎉 Both parties want to extend! Adding ${extensionDuration} minutes...`;
    } else if (userDecision === 'extend' && !aiWantsExtension) {
      return "😔 Sorry, the AI doesn't want to continue. Connecting to new AI...";
    } else if (userDecision === 'decline') {
      return "👋 Session ending. Connecting to new AI...";
    }
    return null;
  };

  const statusText = getStatusText();

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
              {aiWantsExtension 
                ? "🌙 Luna wants to continue chatting!" 
                : "🌙 Luna is deciding..."
              }
            </div>
            
            <div className="extension-buttons">
              <Button onClick={onDecline} variant="secondary">
                No, thanks
              </Button>
              <Button onClick={onExtend} variant="primary">
                Yes, extend!
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExtensionModal;