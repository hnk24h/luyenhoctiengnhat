'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FaFolderOpen, FaClipboardList, FaUpload, FaCircleCheck, FaCircleXmark,
  FaFile, FaKey, FaBullseye, FaBoxArchive, FaFileExport, FaFileImport, FaDownload,
  FaBookOpen, FaHeadphones, FaPencil, FaMicrophone,
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm hover:underline">← Admin</Link>
      </div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Import Ngân hàng câu hỏi</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Upload file JSON hoặc paste JSON để import hàng loạt câu hỏi vào một bộ đề.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Import form ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* File upload */}
          <div className="card">
            <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Chọn dữ liệu JSON</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => fileRef.current?.click()}
                className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                <FaFolderOpen size={14}/> Upload file .json
              </button>
              <button onClick={loadSample} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5"
                style={{ color: 'var(--primary)' }}>
                <FaClipboardList size={14}/> Dùng mẫu N5
              </button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={loadFile} />
            </div>
            <textarea
              className="input w-full font-mono text-xs"
              rows={18}
              placeholder={'{\n  "examSet": { "levelCode": "N5", "skill": "doc", "title": "..." },\n  "questions": [ ... ]\n}'}
              value={json}
              onChange={e => setJson(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          {/* Options */}
          <div className="card">
            <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. Tùy chọn</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Import vào bộ đề có sẵn (ExamSet ID)</label>
                <input className="input" placeholder="Để trống = tạo bộ đề mới từ JSON"
                  value={examSetId} onChange={e => setExamSetId(e.target.value)} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Lấy ID tại <Link href="/admin/examsets" style={{ color: 'var(--primary)' }}>Admin → Bộ đề</Link>
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={clearExisting}
                  onChange={e => setClearExisting(e.target.checked)}
                  className="rounded" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Xóa câu hỏi cũ trước khi import
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleImport} disabled={loading || !json.trim()}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? 'Đang import...' : <><FaUpload size={14}/> Import câu hỏi</>}
          </button>

          {/* Result */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'border'}`}
              style={!result.success ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #f8c4bb' } : {}}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <FaCircleCheck size={16} className="mt-0.5 shrink-0"/>
                  <div>
                    {result.message}
                    {result.examSetId && (
                      <div className="mt-1">
                        <Link href={`/admin/examsets/${result.examSetId}/questions`}
                          className="underline font-bold">
                          → Xem bộ đề ({result.imported} câu)
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span className="flex items-center gap-2"><FaCircleXmark size={16}/> {result.error}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Format guide ─────────────────────────── */}
        <div className="space-y-4">
          <div className="card text-sm" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 className="font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><FaFile size={14}/> Format JSON</h3>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
{`{
  // Tạo bộ đề mới:
  "examSet": {
    "levelCode": "N5",
    "skill": "doc",
    "title": "...",
    "timeLimit": 1800
  },

  // Hoặc dùng bộ đề có sẵn:
  // "examSetId": "cmc123...",

  "clearExisting": false,

  "questions": [
    {
      "type": "tracnghiem",
      "content": "Câu hỏi...",
      "options": ["A","B","C","D"],
      "answer": "A",
      "explain": "Giải thích",
      "order": 1
    }
  ]
}`}
            </pre>
          </div>

          <div className="card text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><FaKey size={14}/> Loại câu hỏi (type)</h3>
            <div className="space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
              <div><code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-muted)' }}>tracnghiem</code> — Trắc nghiệm 4 lựa chọn</div>
              <div><code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-muted)' }}>dien_tu</code> — Điền từ vào chỗ trống</div>
              <div><code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-muted)' }}>nghe_audio</code> — Câu hỏi nghe (kèm audioUrl)</div>
            </div>
          </div>

          <div className="card text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><FaBullseye size={14}/> Kỹ năng (skill)</h3>
            <div className="grid grid-cols-2 gap-1" style={{ color: 'var(--text-secondary)' }}>
              {[
                ['doc',  <><FaBookOpen  size={12}/> Đọc</>],
                ['nghe', <><FaHeadphones size={12}/> Nghe</>],
                ['viet', <><FaPencil    size={12}/> Viết</>],
                ['noi',  <><FaMicrophone size={12}/> Nói</>],
              ].map(([k, label]) => (
                <div key={k as string} className="flex items-center gap-1">
                  <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-muted)' }}>{k}</code>
                  <span className="flex items-center gap-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card text-sm border-2" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
            <h3 className="font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--primary)' }}><FaBoxArchive size={14}/> File mẫu N5 (50 câu)</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              50 câu từ vựng & ngữ pháp N5 theo format import thật — sẵn sàng import ngay.
            </p>
            <a
              href="/samples/n5-doc-tu-vung-ngu-phap.json"
              download
              className="btn-primary text-xs py-1.5 px-3 w-full text-center flex items-center justify-center gap-1.5"
            >
              <FaDownload size={12}/> Tải file mẫu N5
            </a>
          </div>

          <div className="card text-sm">
            <h3 className="font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><FaFileExport size={14}/> Export bộ đề có sẵn</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Download JSON của bộ đề để chỉnh sửa hoặc backup.</p>
            <button onClick={handleExportList} className="btn-secondary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5">
              <FaFileImport size={12}/> Xem danh sách bộ đề
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Hoặc: <code className="font-mono" style={{ background: 'var(--bg-muted)' }}>GET /api/admin/export-questions?examSetId=ID</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
