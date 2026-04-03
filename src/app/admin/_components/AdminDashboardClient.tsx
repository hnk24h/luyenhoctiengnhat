'use client';

import Link from 'next/link';
import {
  FaBullseye, FaCircleQuestion, FaSeedling, FaUpload,
  FaBookOpen, FaUsers, FaPalette, FaLayerGroup, FaChevronRight,
} from 'react-icons/fa6';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangLink {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  bg: string;
  color: string;
}

export interface LangData {
  key: string;
  flag: string;
  label: string;
  shortLabel: string;
  desc: string;
  accent: string;
  tabBg: string;
  tabText: string;
  sectionBg: string;
  badgeClass: string;
  stats: { label: string; value: number; href: string }[];
  links: LangLink[];
}

export interface GlobalStats {
  users: number;
  levels: number;
  questions: number;
  lessons: number;
}

interface Props {
  global: GlobalStats;
  languages: LangData[];
}

// ─── Styles using CSS variables (light + dark mode automatic) ─────────────────
const S = {
  // Backgrounds
  pageBg:    { background: 'var(--bg-base)' },
  surface:   { background: 'var(--bg-surface)', border: '1px solid var(--border)' },
  muted:     { background: 'var(--bg-muted)' },
  // Text
  textPrimary:   { color: 'var(--text-primary)' },
  textSecondary: { color: 'var(--text-secondary)' },
  textMuted:     { color: 'var(--text-muted)' },
  // Borders
  border:    { borderColor: 'var(--border)' },
} as const;

const accentStyle: Record<string, React.CSSProperties> = {
  red:    { background: 'rgba(220,38,38,0.12)',  color: '#dc2626' },
  yellow: { background: 'rgba(161,98,7,0.12)',   color: '#a16207' },
  blue:   { background: 'rgba(37,99,235,0.12)',  color: '#2563eb' },
  purple: { background: 'rgba(124,58,237,0.12)', color: '#7c3aed' },
};

// ─── Subject Card ─────────────────────────────────────────────────────────────

function SubjectCard({ lang }: { lang: LangData }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ ...S.surface, boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 26, lineHeight: 1 }}>{lang.flag}</span>
        <div>
          <div className="text-sm font-bold" style={S.textPrimary}>{lang.shortLabel}</div>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={accentStyle[lang.accent] ?? {}}>
            {lang.desc}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {lang.stats.map(s => (
          <Link key={s.label} href={s.href}
            className="rounded-xl p-2.5 text-center transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
            <div className="text-lg font-bold tabular-nums leading-none" style={S.textPrimary}>
              {s.value.toLocaleString()}
            </div>
            <div className="text-xs mt-0.5" style={S.textMuted}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick link to first management page */}
      <Link href={lang.links[0]?.href ?? `/admin/levels?subject=${lang.key}`}
        className="text-xs text-center py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', ...S.textSecondary }}>
        Quản lý {lang.shortLabel} →
      </Link>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, href, iconBg, iconColor }: {
  label: string; value: number; icon: React.ReactNode;
  href: string; iconBg: string; iconColor: string;
}) {
  return (
    <Link href={href}
      className="group rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200"
      style={{ ...S.surface, boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <FaChevronRight size={12} style={S.textMuted}/>
      </div>
      <div>
        <div className="text-3xl font-bold tabular-nums leading-none" style={S.textPrimary}>
          {value.toLocaleString()}
        </div>
        <div className="text-sm mt-1" style={S.textSecondary}>{label}</div>
      </div>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardClient({ global, languages }: Props) {
  return (
    <div style={S.pageBg}>

      <main className="px-5 py-6 space-y-7">

        {/* ── Page title ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={S.textPrimary}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={S.textSecondary}>Tổng quan nội dung và người dùng</p>
          </div>
          <Link href="/admin/settings"
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ ...S.surface, ...S.textSecondary }}>
            Cài đặt hệ thống
          </Link>
        </div>

        {/* ── Global stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Người dùng" value={global.users}
            icon={<FaUsers size={18}/>} href="/admin/users"
            iconColor="#7c3aed" iconBg="rgba(124,58,237,.15)"/>
          <StatCard label="Cấp độ" value={global.levels}
            icon={<FaBullseye size={18}/>} href="/admin/levels"
            iconColor="#2563eb" iconBg="rgba(37,99,235,.15)"/>
          <StatCard label="Câu hỏi" value={global.questions}
            icon={<FaCircleQuestion size={18}/>} href="/admin/examsets"
            iconColor="#0d9488" iconBg="rgba(13,148,136,.15)"/>
          <StatCard label="Bài học" value={global.lessons}
            icon={<FaLayerGroup size={18}/>} href="/admin/learning"
            iconColor="#d97706" iconBg="rgba(217,119,6,.15)"/>
        </div>

        {/* ── Subject overview ────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={S.textMuted}>
            Theo môn học
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {languages.map(lang => <SubjectCard key={lang.key} lang={lang} />)}
          </div>
        </section>

        {/* ── System tools ─────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={S.textMuted}>Công cụ hệ thống</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {[
              { href: '/admin/seed',   icon: <FaSeedling size={16}/>,  label: 'Seed dữ liệu', desc: 'Khởi tạo dữ liệu mẫu',   iconBg: 'rgba(161,98,7,.15)',    iconColor: '#d97706' },
              { href: '/admin/users',  icon: <FaUsers size={16}/>,     label: 'Người dùng',   desc: 'Quản lý tài khoản',       iconBg: 'rgba(124,58,237,.15)',  iconColor: '#7c3aed' },
              { href: '/admin/theme',  icon: <FaPalette size={16}/>,   label: 'Theme',         desc: 'Giao diện & màu sắc',     iconBg: 'rgba(219,39,119,.15)',  iconColor: '#db2777' },
              { href: '/admin/import', icon: <FaUpload size={16}/>,    label: 'Import JSON',   desc: 'Nhập dữ liệu hàng loạt', iconBg: 'rgba(67,56,202,.15)',   iconColor: '#4338ca' },
              { href: '/admin/normalize', icon: <FaBookOpen size={16}/>, label: 'Chuẩn hóa data', desc: 'Chuẩn hóa txt/csv flashcard', iconBg: 'rgba(37,99,235,.10)', iconColor: '#2563eb' },
            ].map(t => (
              <Link key={t.href} href={t.href}
                className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{ ...S.surface, boxShadow: 'var(--shadow-sm)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.iconBg, color: t.iconColor }}>
                  {t.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={S.textPrimary}>{t.label}</div>
                  <div className="text-xs truncate" style={S.textMuted}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
