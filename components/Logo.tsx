
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  isRTL?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", onClick, isRTL = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center ${className} leading-none select-none cursor-pointer relative`}
      style={{ textShadow: '0 0 60px rgba(255,255,255,0.5), 0 0 100px rgba(255,255,255,0.3)' }}
    >
      {/* Single image with CSS filter transition — avoids loading two images */}
      <img
        src="/logo.svg"
        alt="MAXIOS"
        className="h-[8em] w-auto"
        draggable={false}
        style={{
          filter: hovered
            ? 'brightness(0) invert(50%) sepia(98%) saturate(1352%) hue-rotate(1deg) brightness(103%) contrast(105%)'
            : 'brightness(0) invert(1)',
          transition: 'filter 0.2s',
        }}
      />
    </div>
  );
};
