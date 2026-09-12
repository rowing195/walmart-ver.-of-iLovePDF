import React from 'react';

interface TooltipProps {
  label: string;
  position?: 'below' | 'above' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ label, position = 'below', children, className = '' }) => (
  <span className={`tt tt--${position} ${className}`}>
    {children}
    <span className="bubble">{label}</span>
  </span>
);
