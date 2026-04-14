'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FaFolderOpen, FaClipboardList, FaUpload, FaCircleCheck, FaCircleXmark,
  FaFile, FaKey, FaBullseye, FaBoxArchive, FaFileExport, FaFileImport, FaDownload,
  FaBookOpen, FaHeadphones, FaPencil, FaMicrophone, FaHouse, FaChevronRight,
} from 'react-icons/fa6';

const SAMPLE = {
  examSet: {
    levelCode: 'N5',
    skill: 'doc',
    title: 'N5 Đọc hiểu - Từ vựng Bộ 1',
    description: 'Câu hỏi từ vựng N5 cơ bản',
    timeLimit: 1800,
  },
  questions: [
    {
      type: 'tracnghiem',
      content: '＿＿の　ことばの　よみかたを　えらんでください。\n\n東京に　すんでいます。',
      options: ['とうきょう', 'ひがしきょう', 'とうけい', 'ひがしけい'],
      answer: 'とうきょう',
      explain: '東京（とうきょう）= Tokyo — thủ đô Nhật Bản',
      order: 1,
    },
    {
      type: 'tracnghiem',
      content: '（　）に　なにを　いれますか。\n\nすみません、えきは　どこ（　）ですか。',
      options: ['が', 'を', 'に', 'で'],
      answer: 'に',
      explain: '場所の助詞「に」を使います。「どこにありますか」の短縮形。',
      order: 2,
    },
  ],
};

export default function AdminImportPage() {
  const [json, setJson] = useState('');
  const [examSetId, setExamSetId] = useState('');
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; examSetId?: string; imported?: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJson(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  function loadSample() {
    setJson(JSON.stringify(SAMPLE, null, 2));
  }

  async function handleImport() {
    setLoading(true);
    setResult(null);
    let body: any;
    try {
      body = JSON.parse(json);
    } catch {
      setResult({ error: 'JSON không hợp lệ. Kiểm tra lại cú pháp.' });
      setLoading(false);
      return;
    }

    if (examSetId.trim()) body.examSetId = examSetId.trim();
    body.clearExisting = clearExisting;

    try {
      const res = await fetch('/api/admin/import-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Lỗi kết nối server' });
    }
    setLoading(false);
  }

  async function handleExportList() {
    const res = await fetch('/api/admin/export-questions');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'examsets-list.json'; a.click();
  }

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Import câu hỏi</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">

        {/* ── Left: toàn bộ workflow trong 1 card ─────────── */}
        <div className="lg:col-span-2 admin-card p-4 flex flex-col gap-3">

          {/* Toolbar: source buttons + inline options */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                <FaFolderOpen size={13}/> Upload .json
              </button>
              <button onClick={loadSample} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5"
                style={{ color: 'var(--primary)' }}>
                <FaClipboardList size={13}/> Dùng mẫu N5
              </button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={loadFile} />
            </div>

            {/* ExamSet ID inline */}
            <div className="flex-1 min-w-[200px]">
              <input className="input w-full text-xs"
                placeholder="ExamSet ID — để trống = tạo bộ đề mới"
                value={examSetId} onChange={e => setExamSetId(e.target.value)} />
            </div>

            {/* Checkbox inline */}
            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={clearExisting}
                onChange={e => setClearExisting(e.target.checked)} className="rounded" />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Xóa câu hỏi cũ</span>
            </label>
          </div>

          <p className="text-xs -mt-1" style={{ color: 'var(--text-muted)' }}>
            ExamSet ID lấy tại <Link href="/admin/examsets" style={{ color: 'var(--primary)' }}>Admin → Bộ đề</Link>
          </p>

          {/* Textarea */}
          <textarea
            className="input w-full font-mono text-xs"
            rows={14}
            placeholder={'{\n  "examSet": { "levelCode": "N5", "skill": "doc", "title": "..." },\n  "questions": [ ... ]\n}'}
            value={json}
            onChange={e => setJson(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'monospace' }}
          />

          {/* Submit */}
          <button onClick={handleImport} disabled={loading || !json.trim()}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
            {loading ? 'Đang import...' : <><FaUpload size={13}/> Import câu hỏi</>}
          </button>

          {/* Result */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'border'}`}
              style={!result.success ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #f8c4bb' } : {}}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <FaCircleCheck size={15} className="mt-0.5 shrink-0"/>
                  <div>
                    {result.message}
                    {result.examSetId && (
                      <div className="mt-1">
                        <Link href={`/admin/examsets/${result.examSetId}/questions`} className="underline font-bold">
                          → Xem bộ đề ({result.imported} câu)
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span className="flex items-center gap-2"><FaCircleXmark size={15}/> {result.error}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: tất cả tài liệu trong 1 card ────────── */}
        <div className="admin-card p-4 flex flex-col gap-0 text-sm">

          {/* File mẫu — CTA nổi bật trên cùng */}
          <div className="flex flex-col gap-2 pb-3" style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1.5px solid var(--primary)' }}>
            <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
              <FaBoxArchive size={12}/> File mẫu N5 (50 câu)
            </span>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>50 câu từ vựng & ngữ pháp — sẵn sàng import ngay.</p>
            <a href="/samples/n5-doc-tu-vung-ngu-phap.json" download
              className="btn-primary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5">
              <FaDownload size={11}/> Tải file mẫu N5
            </a>
          </div>

          {/* Format JSON */}
          <div className="flex flex-col gap-2 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <FaFile size={12}/> Format JSON
            </span>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed rounded-lg p-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'var(--bg-muted)' }}>
{`{
  "examSet": {
    "levelCode": "N5",
    "skill": "doc",
    "title": "...",
    "timeLimit": 1800
  },
  "questions": [{
    "type": "tracnghiem",
    "content": "Câu hỏi...",
    "options": ["A","B","C","D"],
    "answer": "A",
    "order": 1
  }]
}`}
            </pre>
          </div>

          {/* Loại câu hỏi + Kỹ năng — cạnh nhau */}
          <div className="grid grid-cols-2 gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-xs flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <FaKey size={11}/> type
              </span>
              {[
                ['tracnghiem', 'Trắc nghiệm'],
                ['dien_tu', 'Điền từ'],
                ['nghe_audio', 'Nghe audio'],
              ].map(([k, v]) => (
                <div key={k} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <code className="font-mono px-1 rounded" style={{ background: 'var(--bg-muted)' }}>{k}</code>
                  <span className="ml-1">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-xs flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <FaBullseye size={11}/> skill
              </span>
              {[
                ['doc', <FaBookOpen key="doc-icon" size={10}/>, 'Đọc'],
                ['nghe', <FaHeadphones key="nghe-icon" size={10}/>, 'Nghe'],
                ['viet', <FaPencil key="viet-icon" size={10}/>, 'Viết'],
                ['noi', <FaMicrophone key="noi-icon" size={10}/>, 'Nói'],
              ].map(([k, icon, label]) => (
                <div key={k as string} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <code className="font-mono px-1 rounded" style={{ background: 'var(--bg-muted)' }}>{k}</code>
                  {icon}<span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-col gap-2 pt-3">
            <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <FaFileExport size={12}/> Export bộ đề có sẵn
            </span>
            <button onClick={handleExportList}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5">
              <FaFileImport size={11}/> Xem danh sách bộ đề
            </button>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Hoặc <code className="font-mono" style={{ background: 'var(--bg-muted)' }}>GET /api/admin/export-questions?examSetId=ID</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
