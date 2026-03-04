'use client';

import { useEffect, useState } from 'react';

interface Passage {
  id: string; title: string; titleVi: string | null; content: string;
  summary: string | null; level: string; type: string;
  source: string | null; tags: string | null; createdAt: string;
}

const TYPE_LABEL: Record<string, string> = { short: 'Đoạn ngắn', long: 'Bài dài', news: 'Tin tức' };

export default function PrintPage({ params }: { params: { id: string } }) {
  const [passage, setPassage] = useState<Passage | null>(null);

  useEffect(() => {
    fetch(`/api/reading/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setPassage);
  }, [params.id]);

  if (!passage) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #3D3A8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const tags: string[] = passage.tags ? JSON.parse(passage.tags) : [];
  const paragraphs = passage.content.split(/\n+/).filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans JP', 'Noto Sans', sans-serif; color: #1a1a2e; background: white; }

        .page { max-width: 720px; margin: 0 auto; padding: 40px 36px; }
        .header { border-bottom: 2px solid #3D3A8C; padding-bottom: 16px; margin-bottom: 24px; }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; border: 1px solid; }
        .badge-N5 { background:#dcfce7; color:#15803d; border-color:#86efac; }
        .badge-N4 { background:#dbeafe; color:#1d4ed8; border-color:#93c5fd; }
        .badge-N3 { background:#fef9c3; color:#92400e; border-color:#fde047; }
        .badge-N2 { background:#ffedd5; color:#c2410c; border-color:#fdba74; }
        .badge-N1 { background:#ffe4e6; color:#be123c; border-color:#fda4af; }
        .badge-type { background:#f5f3ff; color:#7c3aed; border-color:#c4b5fd; }
        .badge-tag  { background:#f1f5f9; color:#475569; border-color:#cbd5e1; }
        .title-jp { font-size: 22px; font-weight: 700; line-height: 1.5; margin-bottom: 4px; }
        .title-vi { font-size: 14px; color: #3D3A8C; font-weight: 600; }
        .summary  { font-size: 13px; color: #555; margin-top: 10px; padding: 10px 14px; background:#f0effd; border-radius: 6px; line-height: 1.7; }
        .meta     { font-size: 11px; color: #888; margin-top: 8px; }
        .content  { margin-top: 28px; font-size: 18px; line-height: 2.2; }
        .content p { margin-bottom: 1em; }
        .vocab-section { margin-top: 32px; border-top: 1px dashed #ccc; padding-top: 20px; }
        .vocab-title   { font-size: 13px; font-weight: 700; color: #3D3A8C; margin-bottom: 10px; letter-spacing: .05em; }
        .vocab-grid    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .vocab-item    { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
        .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page { padding: 0; max-width: 100%; }
          @page { margin: 15mm; }
        }
        @media screen {
          body { background: #f0eff9; }
          .page { box-shadow: 0 4px 32px rgba(0,0,0,.12); min-height: 100vh; }
          .toolbar {
            position: fixed; top: 16px; right: 16px; z-index: 100;
            display: flex; gap: 8px;
          }
          .btn-print {
            background: #3D3A8C; color: white; border: none;
            padding: 10px 20px; border-radius: 8px; font-size: 14px;
            font-weight: 600; cursor: pointer;
            box-shadow: 0 4px 12px rgba(61,58,140,.4);
          }
          .btn-print:hover { background: #2F2C70; }
          .btn-close {
            background: white; color: #555; border: 1px solid #ddd;
            padding: 10px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;
          }
          .btn-close:hover { background: #f9f9f9; }
        }
      `}</style>

      {/* Controls — hidden when printing */}
      <div className="no-print toolbar">
        <button className="btn-close" onClick={() => window.close()}>✕ Đóng</button>
        <button className="btn-print" onClick={() => window.print()}>🖨 In bài đọc</button>
      </div>

      <div className="page">
        <div className="header">
          <div className="badges">
            <span className={`badge badge-${passage.level}`}>{passage.level}</span>
            <span className="badge badge-type">{TYPE_LABEL[passage.type] ?? passage.type}</span>
            {tags.map(t => <span key={t} className="badge badge-tag">#{t}</span>)}
          </div>
          <div className="title-jp">{passage.title}</div>
          {passage.titleVi && <div className="title-vi">{passage.titleVi}</div>}
          {passage.summary && <div className="summary">{passage.summary}</div>}
          <div className="meta">
            {passage.source && <span>📰 {passage.source}　</span>}
            {new Date(passage.createdAt).toLocaleDateString('ja-JP')}
          </div>
        </div>

        <div className="content">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
        </div>

        <div className="vocab-section">
          <div className="vocab-title">📝 LUYỆN TỪ VỰNG — ghi nghĩa của từ</div>
          <div className="vocab-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="vocab-item">
                <div style={{ fontSize: 15, fontWeight: 700 }}>＿＿＿＿＿＿＿</div>
                <div style={{ fontSize: 11, color: '#888' }}>（　　　　）</div>
                <div style={{ width: 28, height: 1, background: '#cbd5e1', margin: '6px 0' }} />
                <div style={{ height: 14 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          <span>luyenthitiengnhat.com</span>
          <span>{passage.level} · {TYPE_LABEL[passage.type] ?? passage.type} · {passage.content.length} ký tự</span>
        </div>
      </div>
    </>
  );
}

