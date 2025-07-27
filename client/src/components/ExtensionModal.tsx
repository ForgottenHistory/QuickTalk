import React from 'react';

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
  if (!isVisible) return null;

  const getStatusText = () => {
    if (userDecision === 'extend' && aiWantsExtension) {
      return "🎉 Both parties want to extend! Adding 15 minutes...";
    } else if (userDecision === 'extend' && !aiWantsExtension) {
      return "😔 Sorry, the AI doesn't want to continue. Connecting to new AI...";
    } else if (userDecision === 'decline') {
      return "👋 Session ending. Connecting to new AI...";
    }
    return null;
  };

  const statusText = getStatusText();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#212121',
        padding: '30px',
        borderRadius: '16px',
        border: '2px solid #ffd900',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        {statusText ? (
          <div>
            <div style={{
              fontSize: '18px',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              {statusText}
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontSize: '20px',
              color: '#ffd900',
              marginBottom: '16px',
              fontWeight: 'bold'
            }}>
              ⏰ Time's Almost Up!
            </div>
            
            <div style={{
              fontSize: '16px',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Would you like to extend this conversation by 15 minutes?
            </div>
            
            <div style={{
              fontSize: '14px',
              color: '#ffec3d',
              marginBottom: '24px',
              fontStyle: 'italic'
            }}>
              {aiWantsExtension 
                ? "🌙 Luna wants to continue chatting!" 
                : "🌙 Luna is deciding..."
              }
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={onDecline}
                style={{
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: '2px solid #ffd900',
                  backgroundColor: 'transparent',
                  color: '#ffd900',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                No, thanks
              </button>
              <button
                onClick={onExtend}
                style={{
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#ffd900',
                  color: '#000000',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Yes, extend!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtensionModal;