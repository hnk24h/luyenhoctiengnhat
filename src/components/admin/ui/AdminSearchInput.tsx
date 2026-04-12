'use client';

import React from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

interface AdminSearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminSearchInput({
  value, onChange, placeholder = 'Tìm kiếm...', className = '',
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <FaMagnifyingGlass
        size={12}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input w-full text-sm py-1.5 pr-8"
        style={{ paddingLeft: '2rem' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 transition"
          style={{ color: 'var(--text-muted)' }}
        >
          <FaXmark size={11} />
        </button>
      )}
    </div>
  );
}
