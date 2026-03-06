'use client';
import { THEMES, useTheme, type ThemeId, type AppearanceMode } from '@/context/ThemeContext';
import { FaCheck, FaDesktop, FaMoon, FaPalette, FaSun } from 'react-icons/fa6';

export default function AdminThemePage() {
  const { theme: currentTheme, appearance, resolvedAppearance, setTheme, setAppearance } = useTheme();
  const appearanceOptions: { id: AppearanceMode; label: string; hint: string; icon: typeof FaSun }[] = [
    { id: 'light', label: 'Sáng', hint: 'Luôn dùng nền sáng', icon: FaSun },
    { id: 'dark', label: 'Tối', hint: 'Nền slate dịu mắt, không dùng đen gắt', icon: FaMoon },
    { id: 'system', label: 'Theo hệ thống', hint: 'Tự theo máy của người dùng', icon: FaDesktop },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
        >
          <FaPalette size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Giao diện & Theme
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thay đổi màu sắc toàn bộ website
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          Chế độ sáng tối
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {appearanceOptions.map((option) => {
            const active = appearance === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setAppearance(option.id)}
                className="text-left rounded-2xl border-2 p-4 transition-all duration-150 hover:shadow-lg"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  boxShadow: active ? '0 0 0 3px rgba(61,58,140,.12)' : 'var(--shadow-sm)',
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      <option.icon size={14} />
                      {option.label}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{option.hint}</p>
                  </div>
                  {active && (
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--primary)' }}>
                      <FaCheck size={10} color="#fff" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Hiện tại đang hiển thị theo chế độ: <strong style={{ color: 'var(--text-primary)' }}>{resolvedAppearance === 'dark' ? 'Tối' : 'Sáng'}</strong>
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Chế độ tối đã được tinh chỉnh theo tông xanh xám để giảm mỏi mắt khi dùng lâu.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          Chọn theme
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const isActive = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className="text-left rounded-2xl border-2 p-4 transition-all duration-150 hover:shadow-lg focus:outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: isActive ? t.preview.primary : 'var(--border)',
                  boxShadow: isActive
                    ? `0 0 0 3px ${t.preview.primary}28`
                    : 'var(--shadow-sm)',
                }}
              >
                {/* Preview swatch */}
                <div className="flex gap-2 mb-3">
                  <div
                    className="h-10 flex-1 rounded-xl"
                    style={{ background: t.preview.bg }}
                  />
                  <div
                    className="h-10 w-10 rounded-xl"
                    style={{ background: t.preview.surface, border: `1px solid ${t.preview.primary}40` }}
                  />
                  <div
                    className="h-10 w-10 rounded-xl"
                    style={{ background: t.preview.primary }}
                  />
                  <div
                    className="h-10 w-10 rounded-xl"
                    style={{ background: t.preview.accent }}
                  />
                </div>

                {/* Info + check */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.emoji} {t.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {t.description}
                    </p>
                  </div>
                  {isActive && (
                    <span
                      className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: t.preview.primary }}
                    >
                      <FaCheck size={10} color="#fff" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview section */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          Xem trước
        </h2>
        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
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
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Tiến độ học: 65%
            </p>
          </div>
          <input className="input" placeholder="Ô nhập liệu mẫu..." />
        </div>
      </div>

      {/* Note */}
      <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        * Theme và chế độ sáng tối được lưu trong trình duyệt và áp dụng ngay lập tức cho toàn bộ website.
      </p>
    </div>
  );
}
