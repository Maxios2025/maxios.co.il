
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
      <img
        src="/logo.svg"
        alt="MAXIOS"
        className="h-[8em] w-auto"
        draggable={false}
        style={{
          filter: 'brightness(0) invert(1)',
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.2s',
          position: 'absolute',
        }}
      />
      <img
        src="/logo.svg"
        alt=""
        className="h-[8em] w-auto"
        draggable={false}
        style={{
          filter: 'brightness(0) invert(50%) sepia(98%) saturate(1352%) hue-rotate(1deg) brightness(103%) contrast(105%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
    </div>
  );
};
