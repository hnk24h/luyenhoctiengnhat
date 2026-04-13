'use client';
import { THEMES, useTheme, type ThemeId, type AppearanceMode } from '@/context/ThemeContext';
import { FaCheck, FaDesktop, FaMoon, FaPalette, FaSun, FaHouse, FaChevronRight } from 'react-icons/fa6';

export default function AdminThemePage() {
  const { theme: currentTheme, appearance, resolvedAppearance, setTheme, setAppearance } = useTheme();
  const appearanceOptions: { id: AppearanceMode; label: string; hint: string; icon: typeof FaSun }[] = [
    { id: 'light', label: 'Sáng', hint: 'Luôn dùng nền sáng', icon: FaSun },
    { id: 'dark', label: 'Tối', hint: 'Nền slate dịu mắt, không dùng đen gắt', icon: FaMoon },
    { id: 'system', label: 'Theo hệ thống', hint: 'Tự theo máy của người dùng', icon: FaDesktop },
  ];

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Giao diện & Theme</span>
      </nav>

      {/* ── Appearance mode ── */}
      <div className="admin-card p-4 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Chế độ sáng tối
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {appearanceOptions.map((option) => {
            const active = appearance === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setAppearance(option.id)}
                className="text-left rounded-xl border-2 p-3 transition-all duration-150 hover:shadow-md"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  boxShadow: active ? '0 0 0 3px rgba(61,58,140,.12)' : 'none',
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      <option.icon size={13} />
                      {option.label}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{option.hint}</p>
                  </div>
                  {active && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--primary)' }}>
                      <FaCheck size={10} color="#fff" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Hiện tại: <strong style={{ color: 'var(--text-primary)' }}>{resolvedAppearance === 'dark' ? 'Tối' : 'Sáng'}</strong>
          {' '}— Chế độ tối tinh chỉnh theo tông xanh xám, giảm mỏi mắt khi dùng lâu.
        </p>
      </div>

      {/* ── Theme picker ── */}
      <div className="admin-card p-4 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Chọn theme màu sắc
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const isActive = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className="text-left rounded-xl border-2 p-3 transition-all duration-150 hover:shadow-md focus:outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: isActive ? t.preview.primary : 'var(--border)',
                  boxShadow: isActive ? `0 0 0 3px ${t.preview.primary}28` : 'none',
                }}
              >
                {/* Preview swatch */}
                <div className="flex gap-1.5 mb-2.5">
                  <div className="h-8 flex-1 rounded-lg" style={{ background: t.preview.bg }} />
                  <div className="h-8 w-8 rounded-lg" style={{ background: t.preview.surface, border: `1px solid ${t.preview.primary}40` }} />
                  <div className="h-8 w-8 rounded-lg" style={{ background: t.preview.primary }} />
                  <div className="h-8 w-8 rounded-lg" style={{ background: t.preview.accent }} />
                </div>
                {/* Info + check */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.emoji} {t.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                  </div>
                  {isActive && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: t.preview.primary }}>
                      <FaCheck size={10} color="#fff" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className="admin-card p-4 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Xem trước
        </h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary">Nút chính</button>
          <button className="btn-accent">Nút nhấn mạnh</button>
          <button className="btn-secondary">Nút phụ</button>
          <button className="btn-ghost">Ghost</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge level-n5">N5</span>
          <span className="badge level-n4">N4</span>
          <span className="badge level-n3">N3</span>
          <span className="badge level-n2">N2</span>
          <span className="badge level-n1">N1</span>
        </div>
        <div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '65%' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tiến độ học: 65%</p>
        </div>
        <input className="input" placeholder="Ô nhập liệu mẫu..." />
      </div>

      <p className="text-xs px-1 pb-1" style={{ color: 'var(--text-muted)' }}>
        * Theme và chế độ sáng tối được lưu trong trình duyệt và áp dụng ngay lập tức cho toàn bộ website.
      </p>
    </div>
  );
}

