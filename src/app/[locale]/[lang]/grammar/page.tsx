'use client';


import { Suspense } from 'react';
import { GrammarPageContent } from '@/components/learn/GrammarPageContent';

export default function GrammarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><p style={{ color: 'var(--text-muted)' }}>Đang tải...</p></div>}>
      <GrammarPageContent />
    </Suspense>
  );
}
