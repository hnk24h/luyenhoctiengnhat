import React from 'react';

interface LearnHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const LearnHeader: React.FC<LearnHeaderProps> = ({ icon, title, subtitle, children }) => (
  <div className="flex items-center gap-3 mb-4 flex-wrap">
    {icon && <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-light text-primary">
      {icon}
    </div>}
    <h1 className="text-lg font-extrabold text-ink-primary">{title}</h1>
    {subtitle && <span className="text-xs text-ink-muted font-medium">{subtitle}</span>}
    {children}
  </div>
);
