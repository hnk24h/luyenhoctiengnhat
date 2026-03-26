"use client";

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
        style={{ marginLeft: 0, marginRight: 12 }}
      >
        {sidebarProps?.customSidebar ? sidebarProps.customSidebar : <LearnSidebar {...sidebarProps} />}
      </div>
      {/* Bottom bar mobile/tablet */}
      <LearnBottomBar {...bottomBarProps} />
      <main
        className="flex-1 px-2 sm:px-4 md:px-8 py-6 md:py-8 pb-24 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[0_4px_24px_0_rgba(61,58,140,0.07),0_1.5px_6px_0_rgba(0,0,0,0.04)] mb-8 max-w-full"
      >
        {children}
      </main>
    </div>
  );
};
