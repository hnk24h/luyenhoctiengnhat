import React from 'react';
import { FaXmark, FaFileArrowUp, FaDownload, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';

interface Lesson {
  id: string;
  title: string;
}

interface ImportModalProps {
  importOpen: boolean;
  setImportOpen: React.Dispatch<React.SetStateAction<boolean>>;
  importFmt: 'csv' | 'json';
  setImportFmt: React.Dispatch<React.SetStateAction<'csv' | 'json'>>;
  importText: string;
  setImportText: React.Dispatch<React.SetStateAction<string>>;
  importResult: { imported: number; skipped: number; errors: string[] } | null;
  importErr: string;
  importing: boolean;
  runImport: () => void;
  lessons: Lesson[];
  activeLesId: string | null;
}

export function ImportModal({ importOpen, setImportOpen, importFmt, setImportFmt, importText, setImportText, importResult, importErr, importing, runImport, lessons, activeLesId }: ImportModalProps) {
  if (!importOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setImportOpen(false)}>
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#dcfce7', color: '#15803d' }}>
              <FaFileArrowUp size={15} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>Import từ vựng / ngữ pháp</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Bài học: <strong>{lessons.find(l => l.id === activeLesId)?.title}</strong>
              </p>
            </div>
          </div>
          <button onClick={() => setImportOpen(false)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
        </div>
        {/* Format tabs */}
        <div className="flex gap-2 mb-3 shrink-0">
          {(['csv', 'json'] as const).map(f => (
            <button key={f} onClick={() => { setImportFmt(f); setImportText(''); }} className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all" style={importFmt === f ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Format hint */}
        <div className="mb-3 px-3 py-2.5 rounded-xl text-xs shrink-0" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {importFmt === 'csv' ? (
            <>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-base)', fontFamily: 'inherit' }}>📋 Định dạng CSV (cột phân cách bằng dấu phẩy):</div>
              <div>term,pronunciation,meaning,type,example,exampleReading,exampleMeaning</div>
              <div className="mt-1">食べる,たべる,ăn,vocab,毎日食べます,まいにちたべます,Tôi ăn mỗi ngày</div>
              <div>家族,かぞく,gia đình,vocab,,,</div>
              <div className="mt-1" style={{ color: '#059669' }}>• type: vocab | character | grammar | example | phrase | tone | idiom</div>
              <div style={{ color: '#059669' }}>• pronunciation/example/... có thể để trống</div>
            </>
          ) : (
            <>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-base)', fontFamily: 'inherit' }}>📋 Định dạng JSON (mảng object):</div>
              <div>{'['}{'{'}&quot;term&quot;:&quot;食べる&quot;,&quot;pronunciation&quot;:&quot;たべる&quot;,&quot;meaning&quot;:&quot;ăn&quot;,&quot;type&quot;:&quot;vocab&quot;{'}'},{'{'}...{'}'}]</div>
              <div className="mt-1" style={{ color: '#059669' }}>• Các field: term*, meaning*, pronunciation, type, example, exampleReading, exampleMeaning</div>
              <div style={{ color: '#059669' }}>• (*) bắt buộc</div>
            </>
          )}
        </div>
        {/* Template download */}
        <div className="mb-3 shrink-0">
          <button onClick={() => {
            const content = importFmt === 'csv'
              ? 'term,pronunciation,meaning,type,example,exampleReading,exampleMeaning\n食べる,たべる,ăn,vocab,毎日食べます,まいにちたべます,Tôi ăn mỗi ngày\n家族,かぞく,gia đình,vocab,,,'
              : JSON.stringify([{ term: '食べる', pronunciation: 'たべる', meaning: 'ăn', type: 'vocab', example: '毎日食べます', exampleReading: 'まいにちたべます', exampleMeaning: 'Tôi ăn mỗi ngày' }], null, 2);
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `template.${importFmt}`; a.click();
          }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <FaDownload size={10} /> Tải template {importFmt.toUpperCase()}
          </button>
        </div>
        {/* Textarea */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <label className="block text-xs font-semibold mb-1 shrink-0" style={{ color: 'var(--text-base)' }}>
            Dán dữ liệu {importFmt.toUpperCase()} vào đây *
          </label>
          <textarea className="input flex-1 resize-none font-mono text-xs w-full min-h-[160px]" placeholder={importFmt === 'csv' ? 'term,pronunciation,meaning,type,...\n食べる,たべる,ăn,vocab,...' : '[{"term":"食べる","pronunciation":"たべる","meaning":"ăn","type":"vocab"}]'} value={importText} onChange={e => setImportText(e.target.value)} />
        </div>
        {/* Error */}
        {importErr && (
          <div className="mt-3 px-3 py-2 rounded-lg text-sm flex items-start gap-2 shrink-0" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <FaTriangleExclamation size={13} className="mt-0.5 shrink-0" />
            <span>{importErr}</span>
          </div>
        )}
        {/* Result */}
        {importResult && (
          <div className="mt-3 rounded-xl px-3 py-2.5 shrink-0" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#15803d' }}>
              <FaCircleCheck size={14} />
              {/* importResultSummary logic should be handled in parent */}
              Import thành công
            </div>
            {/* importResultErrors logic should be handled in parent */}
          </div>
        )}
        {/* Actions */}
        <div className="flex gap-3 mt-4 shrink-0">
          <button onClick={() => setImportOpen(false)} className="btn-secondary flex-1">
            {importResult ? 'Đóng' : 'Hủy'}
          </button>
          {!importResult && (
            <button onClick={runImport} disabled={importing} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {importing ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaFileArrowUp size={12} />}
              Import {importFmt.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
