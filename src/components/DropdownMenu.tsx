import React from 'react';

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  anchorClassName?: string;
  style?: React.CSSProperties;
}

export function DropdownMenu({ open, onClose, className, children, anchorClassName, style }: DropdownMenuProps) {
  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`absolute z-50 ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
