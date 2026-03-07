'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaArrowRight, FaLayerGroup, FaPencil } from 'react-icons/fa6';

const GROUP_COLORS: Record<string, string> = {
  initiating: '#6C5CE7',
  planning:   '#0984E3',
  executing:  '#00B894',
  monitoring: '#E17055',
  closing:    '#FDCB6E',
};
const GROUP_NAMES_VI: Record<string, string> = {
  initiating: 'Khởi động',
  planning:   'Lập kế hoạch',
  executing:  'Thực thi',
  monitoring: 'Giám sát & Kiểm soát',
  closing:    'Kết thúc',
};

type KADetail = {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  description: string | null;
  processes: {
    id: string;
    name: string;
    nameVi: string;
    description: string | null;
    keyPoints: string | null;
    processGroup: { code: string; name: string; nameVi: string };
    inputs: unknown;
    tools: unknown;
    outputs: unknown;
  }[];
};

const KA_COLORS: Record<string, string> = {
  integration:    '#6C5CE7',
  scope:          '#0984E3',
  schedule:       '#00B894',
  cost:           '#F6AD55',
  quality:        '#E17055',
  resource:       '#A29BFE',
  communications: '#74B9FF',
  risk:           '#FF7675',
  procurement:    '#55EFC4',
  stakeholder:    '#FD79A8',
};

const KA_ICONS: Record<string, string> = {
  integration: '🔗', scope: '📋', schedule: '📅', cost: '💰', quality: '⭐',
  resource: '👥', communications: '📢', risk: '⚠️', procurement: '🛒', stakeholder: '🤝',
};

const ALL_KA_CODES = ['integration','scope','schedule','cost','quality','resource','communications','risk','procurement','stakeholder'];

export default function KnowledgeAreaDetailPage() {
  const params = useParams();
  const code = params?.code as string;
  const [ka, setKa] = useState<KADetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProc, setExpandedProc] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/pmp/knowledge-areas/${code}`)
      .then(r => r.json())
      .then(d => setKa(d))
      .catch(() => setKa(null))
      .finally(() => setLoading(false));
  }, [code]);

  const color = KA_COLORS[code] ?? '#6C5CE7';
  const icon = KA_ICONS[code] ?? '📁';
  const currentIdx = ALL_KA_CODES.indexOf(code);
  const prevCode = currentIdx > 0 ? ALL_KA_CODES[currentIdx - 1] : null;
  const nextCode = currentIdx < ALL_KA_CODES.length - 1 ? ALL_KA_CODES[currentIdx + 1] : null;

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded-xl w-1/2" style={{ background: 'var(--bg-muted)' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-3xl" style={{ background: 'var(--bg-muted)' }} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!ka) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">😕</div>
          <p style={{ color: 'var(--text-muted)' }}>Knowledge Area không tồn tại.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Chạy seeder: <code>npx tsx prisma/seed-pmp.ts</code></p>
          <Link href="/pmp/knowledge-areas" className="mt-4 inline-block text-sm font-semibold" style={{ color }}>← Quay lại danh sách</Link>
        </div>
      </main>
    );
  }

  // Group processes by process group
  const groupedProcs: Record<string, typeof ka.processes> = {};
  for (const p of ka.processes) {
    const pgCode = p.processGroup.code;
    if (!groupedProcs[pgCode]) groupedProcs[pgCode] = [];
    groupedProcs[pgCode].push(p);
  }
  const pgOrder = ['initiating', 'planning', 'executing', 'monitoring', 'closing'];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/pmp/knowledge-areas" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> Knowledge Areas
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ka.nameVi}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{icon}</span>
              <div>
                <h1 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{ka.nameVi}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{ka.name}</p>
                {ka.description && <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--text-secondary)' }}>{ka.description}</p>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="text-xs px-3 py-1.5 rounded-xl font-bold" style={{ background: `${color}18`, color }}>
                {ka.processes.length} processes
              </span>
              <Link href="/pmp/exam"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: '#2b6cb0' }}>
                <FaPencil size={11} /> Luyện thi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Processes by group */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {pgOrder.filter(pg => groupedProcs[pg]?.length > 0).map(pg => (
          <div key={pg}>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full" style={{ background: GROUP_COLORS[pg] }} />
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                {GROUP_NAMES_VI[pg]}
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ({groupedProcs[pg].length} process{groupedProcs[pg].length > 1 ? 'es' : ''})
              </span>
            </div>

            <div className="space-y-3">
              {groupedProcs[pg].map(proc => {
                const isOpen = expandedProc === proc.id;
                const inputs = Array.isArray(proc.inputs) ? proc.inputs as string[] : [];
                const tools = Array.isArray(proc.tools) ? proc.tools as string[] : [];
                const outputs = Array.isArray(proc.outputs) ? proc.outputs as string[] : [];
                return (
                  <div key={proc.id}
                    className="card border rounded-2xl overflow-hidden"
                    style={{ borderColor: isOpen ? color : 'var(--border)' }}>
                    <button
                      onClick={() => setExpandedProc(isOpen ? null : proc.id)}
                      className="w-full flex items-start justify-between px-5 py-4 text-left gap-4">
                      <div>
                        <div className="font-bold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{proc.nameVi}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{proc.name}</div>
                      </div>
                      <span className="text-sm mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
                        {proc.description && (
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{proc.description}</p>
                        )}

                        {proc.keyPoints && (
                          <div className="rounded-2xl p-4" style={{ background: `${color}10` }}>
                            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color }}>Điểm mấu chốt</div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{proc.keyPoints}</p>
                          </div>
                        )}

                        {(inputs.length > 0 || tools.length > 0 || outputs.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { label: 'Inputs', items: inputs, bg: '#EBF8FF', c: '#2B6CB0' },
                              { label: 'Tools & Techniques', items: tools, bg: '#F0FFF4', c: '#276749' },
                              { label: 'Outputs', items: outputs, bg: '#FFF5F5', c: '#9B2C2C' },
                            ].map(col => col.items.length > 0 && (
                              <div key={col.label} className="rounded-xl p-3" style={{ background: col.bg }}>
                                <div className="text-xs font-bold mb-2" style={{ color: col.c }}>{col.label}</div>
                                <ul className="space-y-1">
                                  {col.items.map((item: string, i: number) => (
                                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                      <span style={{ color: col.c }}>▸</span> {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation between KAs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 flex items-center justify-between gap-4">
        {prevCode ? (
          <Link href={`/pmp/knowledge-areas/${prevCode}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <FaArrowLeft size={12} />
            <span>{KA_ICONS[prevCode]} {prevCode}</span>
          </Link>
        ) : <div />}
        {nextCode ? (
          <Link href={`/pmp/knowledge-areas/${nextCode}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span>{KA_ICONS[nextCode]} {nextCode}</span>
            <FaArrowRight size={12} />
          </Link>
        ) : <div />}
      </div>
    </main>
  );
}
