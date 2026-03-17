'use client';

import { useRef, useState } from 'react';
import { FaUpload, FaXmark } from 'react-icons/fa6';
import { AudioPlayer } from '@/components/AudioPlayer';

interface Props {
  type: 'audio' | 'image';
  value: string;
  onChange: (url: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
}

export function MediaUploadField({ type, value, onChange, label, placeholder, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const accept = type === 'audio' ? 'audio/*' : 'image/*';

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={value}
          onChange={e => { setError(''); onChange(e.target.value); }}
          placeholder={placeholder ?? (type === 'audio' ? 'https://...mp3' : 'https://...jpg')}
          required={required}
        />
        {/* Upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title={`Upload ${type === 'audio' ? 'audio' : 'ảnh'}`}
          className="flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: uploading ? 'var(--bg-muted)' : type === 'audio' ? '#FFF7ED' : '#EFF6FF',
            color: uploading ? 'var(--text-muted)' : type === 'audio' ? '#C2410C' : '#2563EB',
            border: `1px solid ${type === 'audio' ? '#FED7AA' : '#BFDBFE'}`,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
            </svg>
          ) : (
            <FaUpload size={12} />
          )}
          <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
        </button>

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Xóa"
            className="flex items-center justify-center w-8 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <FaXmark size={12} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onPickFile}
      />

      {/* Drop zone hint (only when no value) */}
      {!value && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-lg border-2 border-dashed flex items-center justify-center py-3 text-xs transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
        >
          Kéo thả file {type === 'audio' ? 'âm thanh (mp3, wav…)' : 'hình ảnh (jpg, png…)'} vào đây
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>
      )}

      {/* Preview */}
      {value && type === 'audio' && (
        <div className="mt-1">
          <AudioPlayer src={value} />
        </div>
      )}
      {value && type === 'image' && (
        <div className="mt-1 rounded-xl overflow-hidden border" style={{ borderColor: '#FDE68A', maxWidth: 320 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full max-h-48 object-contain" style={{ background: '#FEFCE8' }} />
        </div>
      )}
    </div>
  );
}
