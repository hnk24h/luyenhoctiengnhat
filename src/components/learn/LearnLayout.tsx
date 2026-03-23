import React from 'react';
import { LearnSidebar } from '../LearnSidebar';
import { LearnBottomBar } from '../LearnBottomBar';

interface LearnLayoutProps {
  sidebarProps: any;
  bottomBarProps: any;
  children: React.ReactNode;
}

export const LearnLayout: React.FC<LearnLayoutProps> = ({ sidebarProps, bottomBarProps, children }) => {
  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Sidebar desktop */}
      <div
        className="hidden md:block"
        style={{ marginTop: 40, marginLeft: 0, marginRight: 12 }}
      >
        <LearnSidebar {...sidebarProps} />
      </div>
      {/* Bottom bar mobile/tablet */}
      <LearnBottomBar {...bottomBarProps} />
      <main
        className="flex-1 px-2 sm:px-4 md:px-8 py-6 md:py-8 pb-24"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1.5px solid var(--border)',
          boxShadow: '0 4px 24px 0 rgba(61,58,140,0.07), 0 1.5px 6px 0 rgba(0,0,0,0.04)',
          marginTop: 40,
          marginBottom: 32,
          marginLeft: 0,
          marginRight: 0,
          maxWidth: '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
};
