import React from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isVisible, 
  onClose, 
  children, 
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${className}`}>
        {onClose && (
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
};