'use client';
import Link from 'next/link';
import { FaBookOpen, FaLayerGroup, FaPencil, FaArrowRight, FaCircleCheck } from 'react-icons/fa6';

const KNOWLEDGE_AREAS = [
  { code: 'integration',      name: 'Integration Management',     nameVi: 'Quản lý Tích hợp',       icon: '🔗', processes: 7, color: '#6C5CE7' },
  { code: 'scope',            name: 'Scope Management',           nameVi: 'Quản lý Phạm vi',         icon: '📋', processes: 6, color: '#0984E3' },
  { code: 'schedule',         name: 'Schedule Management',        nameVi: 'Quản lý Thời gian',       icon: '📅', processes: 6, color: '#00B894' },
  { code: 'cost',             name: 'Cost Management',            nameVi: 'Quản lý Chi phí',         icon: '💰', processes: 4, color: '#FDCB6E' },
  { code: 'quality',          name: 'Quality Management',         nameVi: 'Quản lý Chất lượng',      icon: '⭐', processes: 3, color: '#E17055' },
  { code: 'resource',         name: 'Resource Management',        nameVi: 'Quản lý Nguồn lực',       icon: '👥', processes: 6, color: '#A29BFE' },
  { code: 'communications',   name: 'Communications Management',  nameVi: 'Quản lý Truyền thông',    icon: '📢', processes: 3, color: '#74B9FF' },
  { code: 'risk',             name: 'Risk Management',            nameVi: 'Quản lý Rủi ro',          icon: '⚠️', processes: 7, color: '#FF7675' },
  { code: 'procurement',      name: 'Procurement Management',     nameVi: 'Quản lý Mua sắm',         icon: '🛒', processes: 3, color: '#55EFC4' },
  { code: 'stakeholder',      name: 'Stakeholder Management',     nameVi: 'Quản lý Các bên liên quan', icon: '🤝', processes: 4, color: '#FD79A8' },
];

const PROCESS_GROUPS = [
  { code: 'initiating',   name: 'Initiating',   nameVi: 'Khởi động',    processes: 2,  color: '#6C5CE7' },
  { code: 'planning',     name: 'Planning',     nameVi: 'Lập kế hoạch', processes: 24, color: '#0984E3' },
  { code: 'executing',    name: 'Executing',    nameVi: 'Thực thi',     processes: 10, color: '#00B894' },
  { code: 'monitoring',   name: 'Monitoring & Controlling', nameVi: 'Giám sát & Kiểm soát', processes: 12, color: '#E17055' },
  { code: 'closing',      name: 'Closing',      nameVi: 'Kết thúc',     processes: 1,  color: '#FDCB6E' },
];

const STUDY_TIPS = [
  'Học ITTO (Inputs, Tools, Techniques, Outputs) cho từng quy trình',
  'Hiểu rõ sự khác biệt giữa các Process Group',
  'Nắm vững vai trò của Project Manager trong từng Knowledge Area',
  'Luyện tập với câu hỏi tình huống thực tế',
  'Ôn tập theo PMI Code of Ethics & Professional Conduct',
];

export default function PMPPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, white 1px, transparent 1px), radial-gradient(circle at 70% 20%, white 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            📊 PMP — Project Management Professional
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Luyện Thi PMP<br />
            <span style={{ color: '#BEE3F8' }}>theo PMBOK Guide 6th Edition</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)' }}>
            10 Knowledge Areas · 5 Process Groups · 49 Processes. Học có hệ thống, luyện tập chuyên sâu, đạt chứng chỉ PMP.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pmp/knowledge-areas"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'white', color: '#2b6cb0' }}>
              <FaLayerGroup size={14} /> Xem Knowledge Areas <FaArrowRight size={12} />
            </Link>
            <Link href="/pmp/exam"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
              <FaPencil size={14} /> Luyện thi ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '49',  label: 'Quy trình (Processes)' },
            { value: '10',  label: 'Knowledge Areas' },
            { value: '5',   label: 'Process Groups' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold" style={{ color: '#2b6cb0' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Areas Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Knowledge Areas</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>10 lĩnh vực quản lý dự án theo PMBOK 6</p>
          </div>
          <Link href="/pmp/knowledge-areas"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#2b6cb0' }}>
            Xem tất cả <FaArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KNOWLEDGE_AREAS.map(ka => (
            <Link
              key={ka.code}
              href={`/pmp/knowledge-areas/${ka.code}`}
              className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-lg border"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{ka.icon}</span>
                <div>
                  <div className="font-bold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{ka.nameVi}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ka.name}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-xl font-semibold"
                  style={{ background: `${ka.color}18`, color: ka.color }}>
                  {ka.processes} processes
                </span>
                <FaArrowRight size={12} style={{ color: 'var(--text-muted)' }}
                  className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Process Groups + Tips */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Groups */}
        <div className="card border p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>5 Process Groups</h3>
          <div className="flex flex-col gap-3">
            {PROCESS_GROUPS.map(pg => (
              <div key={pg.code} className="flex items-center justify-between p-3 rounded-2xl"
                style={{ background: 'var(--bg-muted)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: pg.color }} />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pg.nameVi}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{pg.name}</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: `${pg.color}20`, color: pg.color }}>
                  {pg.processes} proc.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <div className="card border p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Mẹo ôn thi PMP</h3>
          <div className="flex flex-col gap-3">
            {STUDY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <FaCircleCheck size={14} className="mt-0.5 shrink-0" style={{ color: '#2b6cb0' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
              </div>
            ))}
          </div>
          <Link href="/pmp/knowledge-areas"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white w-full justify-center transition-all hover:opacity-90"
            style={{ background: '#2b6cb0' }}>
            <FaBookOpen size={13} /> Bắt đầu học
          </Link>
        </div>
      </section>
    </main>
  );
}
