import React from 'react';

interface LevelBadgeProps {
  text: string;
  bg: string;
  color: string;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ text, bg, color, className }) => (
  <span
    className={`text-xs font-bold px-2 py-0.5 rounded-full ${className || ''}`}
    style={{ background: bg, color }}
  >
    {text}
  </span>
);
