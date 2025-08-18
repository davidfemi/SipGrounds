import React from 'react';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  size = 'medium',
  overlay = false 
}) => {
  const sizeMap = {
    small: { width: '32px', height: '32px' },
    medium: { width: '64px', height: '64px' },
    large: { width: '96px', height: '96px' }
  };

  const containerClasses = overlay 
    ? 'position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white'
    : 'd-flex flex-column align-items-center justify-content-center py-5';

  return (
    <div className={containerClasses}>
      <div className="d-flex flex-column align-items-center">
        {/* SipGrounds Logo */}
        <img 
          src="/sipgrounds.jpg"
          alt="SipGrounds - Discover Your Next Brew"
          style={sizeMap[size]}
          className="mb-4 rounded-circle"
        />
        
        {/* Spinning indicator */}
        <div className="spinner-border text-success mb-4" role="status" style={{
          width: size === 'small' ? '1.5rem' : size === 'medium' ? '2rem' : '2.5rem',
          height: size === 'small' ? '1.5rem' : size === 'medium' ? '2rem' : '2.5rem'
        }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        
        {/* Loading message */}
        <p className={`text-muted fw-medium text-center mb-0 ${
          size === 'small' ? 'fs-6' : size === 'medium' ? 'fs-5' : 'fs-4'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 