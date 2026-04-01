import Link from 'next/link';
import type { IconType } from 'react-icons';

interface NavItemProps {
  href: string;
  label: string;
  icon?: IconType;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function NavItem({ href, label, icon: Icon, active, onClick, className, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-muted)] ${active ? 'bg-[var(--bg-muted)] font-semibold text-[var(--primary)]' : 'text-[var(--text-secondary)]'} ${className || ''}`}
      style={active ? { color: 'var(--primary)', fontWeight: 600 } : {}}
      onClick={onClick}
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
    >
      <span className="flex items-center gap-2.5">
        {Icon && <Icon size={13} />}
        <span>{label}</span>
      </span>
      {children}
    </Link>
  );
}
