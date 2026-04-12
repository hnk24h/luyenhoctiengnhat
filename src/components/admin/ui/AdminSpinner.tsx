'use client';

interface AdminSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' };

export default function AdminSpinner({ size = 'md', className = '', label }: AdminSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span
        className={`inline-block rounded-full border-current border-t-transparent animate-spin ${SIZES[size]}`}
        style={{ color: 'var(--primary)' }}
      />
      {label && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
}

export function AdminPageLoader({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <AdminSpinner size="lg" label={label} />
    </div>
  );
}
