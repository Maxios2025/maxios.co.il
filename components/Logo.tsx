
import React from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-[0.3em] ${className} font-black italic tracking-tighter leading-none select-none`}
    >
      {/* Speed Lines Icon */}
      <svg 
        viewBox="0 0 100 60" 
        className="h-[0.9em] w-auto flex-shrink-0"
        fill="currentColor"
      >
        <rect x="0" y="8" width="40" height="5" rx="1" />
        <rect x="20" y="20" width="60" height="5" rx="1" />
        <rect x="10" y="32" width="75" height="5" rx="1" />
        <rect x="30" y="44" width="45" height="5" rx="1" />
      </svg>
      
      {/* Text: MAXIOS */}
      <span className="text-[1em] block">
        MAXIOS
      </span>
    </div>
  );
};
