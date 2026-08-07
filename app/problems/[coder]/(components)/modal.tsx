import React, { ReactNode } from 'react';
import Modal from 'react-modal';


type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  children: ReactNode;
};

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999999// Good practice to ensure it sits on top!
  },
  content: {
    zIndex: 1000000,
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    
    // THE NEW SIZING RULES 
    width: '90%',          // Take up most of the screen on mobile...
    maxWidth: '600px',     // ...but never get wider than 600px on desktop
    height: 'auto',        // Automatically stretch vertically to fit the content
    maxHeight: '90vh',     // Never get taller than the screen (prevents getting cut off)
    
    padding: '2rem',
    borderRadius: '1rem', // Slightly rounder to match app theme
    backgroundColor: '#1f2937', 
    border: '2px solid #2f3a4f',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
};

const ModalComponent: React.FC<Props> = ({ isOpen, onRequestClose, children }) => {
  return (
  
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
        
        {children}
        
    </Modal>
    
  );
};

export default ModalComponent;
// This file is what controls our modal components. So that includes sizing color etc