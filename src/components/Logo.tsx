
import React from 'react';
import BlobLogo from './BlobLogo';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  interactive?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'default',
  interactive = true
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <BlobLogo interactive={interactive} />
    </div>
  );
};

export default Logo;
