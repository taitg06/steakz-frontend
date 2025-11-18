import React from 'react';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <div className="soul-steaks-logo">
      <svg 
        className="logo-svg" 
        width="48" 
        height="48" 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="24" cy="24" r="22" fill="#1b0f0a" />
        
        {/* Gold Ring */}
        <circle cx="24" cy="24" r="20" fill="none" stroke="#ffd700" strokeWidth="2" />
        
        {/* Steak Shape */}
        <ellipse cx="24" cy="24" rx="16" ry="12" fill="#b3001b" />
        <ellipse cx="24" cy="24" rx="14" ry="10" fill="#8b0015" />
        
        {/* Grill Marks */}
        <line x1="14" y1="18" x2="34" y2="18" stroke="#2a130a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="24" x2="34" y2="24" stroke="#2a130a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="30" x2="34" y2="30" stroke="#2a130a" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Highlight */}
        <ellipse cx="28" cy="20" rx="4" ry="2.5" fill="#ffd700" opacity="0.5" />
        
        {/* Inner Gold Circle */}
        <circle cx="24" cy="24" r="8" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.3" />
      </svg>
      <div className="logo-text">
        <span className="logo-title">Soul Steaks</span>
        <span className="logo-subtitle">Premium Steakhouse</span>
      </div>
    </div>
  );
};

export default Logo;
