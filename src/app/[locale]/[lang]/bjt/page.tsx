'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LearnLayout } from '@/components/learn/LearnLayout';
import {
  FaBriefcase, FaBolt, FaClipboardList, FaChartBar,
  FaHeadphones, FaBookOpen, FaBook, FaGraduationCap,
  FaClock, FaCircleCheck, FaStar, FaArrowRight,
} from 'react-icons/fa6';

/* ─── BJT Level data ────────────────────────────────────────── */
const BJT_LEVELS = [
  { code: 'J1+', score: '600~800', label: 'J1+', desc: 'ビジネスのあらゆる場面で日本語を駆使', descVi: 'Sử dụng tiếng Nhật thành thạo trong mọi tình huống kinh doanh', color: '#7c3aed' },
  { code: 'J1',  score: '530~599', label: 'J1',  desc: 'ビジネスの幅広い場面で日本語を適切に使用', descVi: 'Sử dụng tiếng Nhật phù hợp trong nhiều tình huống kinh doanh', color: '#2563eb' },
  { code: 'J2',  score: '420~529', label: 'J2',  desc: 'ビジネスのある程度の場面で日本語を適切に使用', descVi: 'Sử dụng tiếng Nhật phù hợp trong một số tình huống kinh doanh', color: '#0891b2' },
  { code: 'J3',  score: '320~419', label: 'J3',  desc: 'ビジネスの限られた場面で日本語をある程度使用', descVi: 'Sử dụng tiếng Nhật ở mức độ nhất định', color: '#059669' },
  { code: 'J4',  score: '200~319', label: 'J4',  desc: 'ビジネスの限られた場面で最低限の日本語を使用', descVi: 'Sử dụng tiếng Nhật tối thiểu trong một số tình huống', color: '#d97706' },
  { code: 'J5',  score: '0~199',   label: 'J5',  desc: 'ビジネスの日本語力基準以下', descVi: 'Dưới mức cơ bản', color: '#9ca3af' },
];

const SECTIONS = [
  { skill: 'listening', icon: FaHeadphones, title: '聴解テスト', titleVi: 'Nghe hiểu', time: '50 phút', desc: 'Các tình huống giao tiếp kinh doanh: họp, điện thoại, thuyết trình, hướng dẫn', color: '#2563eb' },
  { skill: 'integrated', icon: FaBook, title: '聴読解テスト', titleVi: 'Nghe đọc tổng hợp', time: '30 phút', desc: 'Kết hợp nghe và đọc tài liệu kinh doanh: báo cáo, email, biểu đồ', color: '#7c3aed' },
  { skill: 'reading', icon: FaBookOpen, title: '読解テスト', titleVi: 'Đọc hiểu', time: '40 phút', desc: 'Đọc hiểu văn bản kinh doanh: hợp đồng, thông báo, bài báo', color: '#059669' },
];

const TIPS = [
  { icon: FaGraduationCap, title: 'Nền tảng JLPT', desc: 'Cần ít nhất JLPT N2 để bắt đầu ôn BJT hiệu quả.' },
  { icon: FaBriefcase, title: 'Từ vựng kinh doanh', desc: 'Tập trung vào keigo (kính ngữ), email, họp, báo cáo, đàm phán.' },
  { icon: FaHeadphones, title: 'Nghe hiểu thực tế', desc: 'Luyện nghe các cuộc họp, điện thoại, thuyết trình kinh doanh thật.' },
  { icon: FaClock, title: '120 phút liên tục', desc: 'Luyện làm đề full 120 phút để quen áp lực thời gian thực tế.' },
];

export default function BJTPage() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) ?? 'ja';
  const locale = (routeParams?.locale as string) ?? 'vi';

  const sidebarProps = {
    title: 'BJT',
    levels: BJT_LEVELS.map(lv => ({
      code: lv.code,
      label: lv.label,
      desc: lv.descVi,
      href: `/${locale}/${lang}/mock-exam?level=${lv.code}`,
      active: false,
    })),
    skills: [
      { key: 'mock-exam', label: 'Thi thử', icon: <FaClipboardList size={14} />, href: `/${locale}/${lang}/mock-exam` },
    ],
  };

  return (
    <LearnLayout
      sidebarProps={sidebarProps}
      bottomBarProps={{ items: [{ key: 'bjt', label: 'BJT', icon: <FaBriefcase size={14} />, href: `/${locale}/${lang}/bjt` }] }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 28,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)',
          padding: '32px 28px',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaBriefcase size={22} style={{ color: '#fff' }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaBolt size={11} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Business Japanese</span>
              </div>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              BJT Business Japanese Test
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Kỳ thi đánh giá năng lực tiếng Nhật trong môi trường kinh doanh.
              Được công nhận rộng rãi bởi các doanh nghiệp Nhật Bản và quốc tế.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaClock size={13} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>120 phút</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaClipboardList size={13} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>3 phần thi</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaStar size={13} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>800 điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Cấu trúc bài thi
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {SECTIONS.map(sec => (
            <div key={sec.skill} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${sec.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <sec.icon size={20} style={{ color: sec.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {sec.titleVi} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-muted)' }}>— {sec.title}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{sec.desc}</div>
              </div>
              <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                <FaClock size={10} style={{ marginRight: 4 }} />{sec.time}
              </div>
            </div>
          ))}
        </div>

        {/* ── Levels ── */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Cấp độ BJT
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 28 }}>
          {BJT_LEVELS.map(lv => (
            <div key={lv.code} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${lv.color}18`, color: lv.color, fontWeight: 800, fontSize: 14,
                }}>
                  {lv.label}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{lv.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lv.score} điểm</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{lv.descVi}</p>
            </div>
          ))}
        </div>

        {/* ── Study Tips ── */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Chiến lược ôn thi BJT
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {TIPS.map((tip, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <tip.icon size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="card" style={{
          padding: '24px 28px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.08) 100%)',
          border: '1.5px solid rgba(124,58,237,0.2)',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Sẵn sàng thi thử BJT?
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Làm đề thi thử BJT đầy đủ theo cấu trúc chuẩn, tính giờ từng phần, chấm điểm chi tiết.
          </p>
          <Link
            href={`/${locale}/${lang}/mock-exam`}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '10px 24px' }}
          >
            <FaClipboardList size={15} /> Bắt đầu thi thử <FaArrowRight size={13} />
          </Link>
        </div>
      </div>
    </LearnLayout>
  );
}
