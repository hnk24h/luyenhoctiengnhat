'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaBullseye, FaBook, FaCircleQuestion, FaSeedling, FaUpload,
  FaBookOpen, FaNewspaper, FaUsers, FaPalette, FaHeadphones, FaLayerGroup,
  FaGear, FaChartLine, FaChevronRight,
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
  const [active, setActive] = useState(languages[0]?.key ?? '');
  const lang = languages.find(l => l.key === active) ?? languages[0];

  return (
    <div className="min-h-screen" style={S.pageBg}>

      {/* ── Top Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20" style={{ ...S.surface, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <FaChartLine size={14} className="text-white"/>
            </div>
            <div>
              <span className="font-bold text-sm" style={S.textPrimary}>Admin Panel</span>
              <span className="mx-2" style={S.textMuted}>|</span>
              <span className="text-sm" style={S.textMuted}>Hệ thống luyện thi đa ngôn ngữ</span>
            </div>
          </div>
          <Link href="/admin/settings"
            className="flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg"
            style={S.textSecondary}>
            <FaGear size={13}/> Cài đặt
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Page title ───────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={S.textPrimary}>Dashboard</h1>
          <p className="text-sm mt-1" style={S.textSecondary}>Tổng quan nội dung và người dùng hệ thống</p>
        </div>

        {/* ── Global stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* ── Language panel ───────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={S.textMuted}>Quản lý theo môn học</p>
          <div className="rounded-2xl overflow-hidden" style={{ ...S.surface, boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex min-h-[360px]">

              {/* ── Vertical sidebar tabs ──────────────────────────── */}
              <nav className="w-52 flex-shrink-0 p-3 flex flex-col gap-1"
                style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
                {languages.map(l => {
                  const isActive = active === l.key;
                  return (
                    <button key={l.key} onClick={() => setActive(l.key)}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150"
                      style={isActive
                        ? { background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }
                        : { background: 'transparent', border: '1px solid transparent' }
                      }>
                      <span className="text-2xl leading-none">{l.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-tight"
                          style={isActive ? S.textPrimary : S.textSecondary}>
                          {l.shortLabel}
                        </div>
                        <div className="text-xs mt-0.5 truncate" style={S.textMuted}>{l.desc}</div>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--primary)' }}/>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* ── Content area ────────────────────────────────────── */}
              {lang && (
                <div className="flex-1 p-6 flex flex-col gap-5">

                  {/* Lang header */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <h3 className="text-lg font-bold leading-tight" style={S.textPrimary}>{lang.label}</h3>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 font-medium ${lang.badgeClass}`}>{lang.desc}</span>
                    </div>
                  </div>

                  {/* Sub-stats row */}
                  <div className="grid grid-cols-4 gap-3">
                    {lang.stats.map(s => (
                      <Link key={s.label} href={s.href}
                        className="rounded-xl p-3.5 transition-all hover:-translate-y-0.5"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                        <div className="text-2xl font-bold tabular-nums leading-none" style={S.textPrimary}>
                          {s.value.toLocaleString()}
                        </div>
                        <div className="text-xs mt-1" style={S.textMuted}>{s.label}</div>
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <hr style={{ borderColor: 'var(--border)' }}/>

                  {/* Action cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {lang.links.map(l => (
                      <Link key={l.href} href={l.href}
                        className="group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: l.bg, color: l.color }}>
                          {l.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold leading-tight truncate" style={S.textPrimary}>{l.label}</div>
                          <div className="text-xs mt-0.5 truncate" style={S.textMuted}>{l.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── System tools ─────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={S.textMuted}>Công cụ hệ thống</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/admin/seed',   icon: <FaSeedling size={16}/>,  label: 'Seed dữ liệu', desc: 'Khởi tạo dữ liệu mẫu',   iconBg: 'rgba(161,98,7,.15)',    iconColor: '#d97706' },
              { href: '/admin/users',  icon: <FaUsers size={16}/>,     label: 'Người dùng',   desc: 'Quản lý tài khoản',       iconBg: 'rgba(124,58,237,.15)',  iconColor: '#7c3aed' },
              { href: '/admin/theme',  icon: <FaPalette size={16}/>,   label: 'Theme',         desc: 'Giao diện & màu sắc',     iconBg: 'rgba(219,39,119,.15)',  iconColor: '#db2777' },
              { href: '/admin/import', icon: <FaUpload size={16}/>,    label: 'Import JSON',   desc: 'Nhập dữ liệu hàng loạt', iconBg: 'rgba(67,56,202,.15)',   iconColor: '#4338ca' },
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
