import React from 'react';
import { FaFileArrowUp, FaDownload, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';
import { AdminModal, AdminFormField, AdminButton } from '@/components/admin/ui';

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
    <AdminModal
      open
      onClose={() => setImportOpen(false)}
      title="Import từ vựng / ngữ pháp"
      description={`Bài học: ${lessons.find(l => l.id === activeLesId)?.title ?? ''}`}
      icon={<FaFileArrowUp size={15} />}
      size="lg"
      footer={
        <div className="flex gap-3">
          <AdminButton variant="secondary" className="flex-1" onClick={() => setImportOpen(false)}>
            {importResult ? 'Đóng' : 'Hủy'}
          </AdminButton>
          {!importResult && (
            <AdminButton variant="primary" className="flex-1" onClick={runImport} disabled={importing} loading={importing} icon={<FaFileArrowUp size={12} />}>
              Import {importFmt.toUpperCase()}
            </AdminButton>
          )}
        </div>
      }
    >
        {/* Format tabs */}
        <div className="flex gap-2 mb-3 shrink-0">
          {(['csv', 'json'] as const).map(f => (
            <AdminButton key={f} variant={importFmt === f ? 'primary' : 'secondary'} size="sm"
              onClick={() => { setImportFmt(f); setImportText(''); }}>
              {f.toUpperCase()}
            </AdminButton>
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
          <AdminButton variant="ghost" size="sm" icon={<FaDownload size={10} />}
            onClick={() => {
            const content = importFmt === 'csv'
              ? 'term,pronunciation,meaning,type,example,exampleReading,exampleMeaning\n食べる,たべる,ăn,vocab,毎日食べます,まいにちたべます,Tôi ăn mỗi ngày\n家族,かぞく,gia đình,vocab,,,'
              : JSON.stringify([{ term: '食べる', pronunciation: 'たべる', meaning: 'ăn', type: 'vocab', example: '毎日食べます', exampleReading: 'まいにちたべます', exampleMeaning: 'Tôi ăn mỗi ngày' }], null, 2);
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `template.${importFmt}`; a.click();
          }}>
            Tải template {importFmt.toUpperCase()}
          </AdminButton>
        </div>
        {/* Textarea */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AdminFormField label={`Dán dữ liệu ${importFmt.toUpperCase()} vào đây`} required>
          <textarea className="input flex-1 resize-none font-mono text-xs w-full min-h-[160px]" placeholder={importFmt === 'csv' ? 'term,pronunciation,meaning,type,...\n食べる,たべる,ăn,vocab,...' : '[{"term":"食べる","pronunciation":"たべる","meaning":"ăn","type":"vocab"}]'} value={importText} onChange={e => setImportText(e.target.value)} />
          </AdminFormField>
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
    </AdminModal>
  );
}
