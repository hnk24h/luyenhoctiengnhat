"use client";

import React, { useState } from 'react';
import { LearnSidebar } from '../LearnSidebar';
import { LearnBottomBar } from '../LearnBottomBar';


interface LearnLayoutProps {
  sidebarProps: any;
  bottomBarProps: any;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const LearnLayout: React.FC<LearnLayoutProps> = ({ sidebarProps, bottomBarProps, children, rightPanel }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<'level' | 'skill'>('level');
  const [selectedLevel, setSelectedLevel] = useState<string>(sidebarProps?.levels?.[0]?.code ?? '');
  const [selectedSkill, setSelectedSkill] = useState<string>(sidebarProps?.skills?.[0]?.key ?? '');

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row pt-4 md:pt-0"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Sidebar desktop */}
      <div
        className="hidden md:block transition-all duration-300 ease-in-out"
        style={{ marginLeft: 0, marginRight: 12, width: collapsed ? 56 : 256, flexShrink: 0 }}
      >
        {sidebarProps?.customSidebar
          ? sidebarProps.customSidebar
          : <LearnSidebar
              mode={mode}
              setMode={setMode}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedSkill={selectedSkill}
              setSelectedSkill={setSelectedSkill}
              {...sidebarProps}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed(c => !c)}
            />
        }
      </div>
      {/* Bottom bar mobile/tablet */}
      <LearnBottomBar {...bottomBarProps} />
      <main
        className="flex-1 min-w-0 px-3 sm:px-4 md:px-8 py-5 md:py-8 pb-[132px] md:pb-8 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-[0_4px_24px_0_rgba(61,58,140,0.07),0_1.5px_6px_0_rgba(0,0,0,0.04)] mb-8 transition-all duration-300"
      >
        {children}
      </main>
      {/* Right panel (optional) */}
      {rightPanel && (
        <div
          className="hidden lg:block transition-all duration-300 ease-in-out"
          style={{ marginLeft: 12, width: 280, flexShrink: 0 }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
};
