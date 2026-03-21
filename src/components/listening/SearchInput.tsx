import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 max-w-xs">
    <FaMagnifyingGlass size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
    <input
      type="text"
      placeholder={placeholder || 'Tìm kiếm...'}
      value={value}
      onChange={onChange}
      className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border"
      style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  </div>
);
