import React from 'react';
import { Button } from 'react-bootstrap';
import { showIntercom } from '../services/intercomService';

interface SupportButtonProps {
  variant?: string;
  size?: 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const SupportButton: React.FC<SupportButtonProps> = ({ 
  variant = 'outline-primary', 
  size,
  className = '',
  children = '💬 Get Help'
}) => {
  const handleClick = () => {
    showIntercom();
  };

  return (
    <Button 
      size={size}
      className={`${className} text-white`}
      onClick={handleClick}
      style={{ 
        backgroundColor: '#f59e0b', 
        borderColor: '#f59e0b' 
      }}
    >
      <i className="fas fa-comments me-2"></i>
      {children}
    </Button>
  );
};

export default SupportButton; 