import React from 'react';
import { FaXmark, FaCheck } from 'react-icons/fa6';

export function LessonModal({ modal, setModal, modalErr, lesForm, setLesForm, LESSON_TYPES, saving, saveLes }) {
  if (modal !== 'les-create' && modal !== 'les-edit') return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setModal(null)}>
      <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
            {modal === 'les-create' ? 'Thêm bài học mới' : 'Sửa bài học'}
          </h2>
          <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
        </div>
        {modalErr && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            {modalErr}
          </div>
        )}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên bài học *</label>
              <input className="input w-full" placeholder="VD: Bài 1 - Gia đình" value={lesForm.title} onChange={e => setLesForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Loại</label>
              <select className="input w-full text-sm" value={lesForm.type} onChange={e => setLesForm(f => ({ ...f, type: e.target.value }))}>
                {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Gói yêu cầu</label>
              <select className="input w-full text-sm" value={lesForm.requiredTier} onChange={e => setLesForm(f => ({ ...f, requiredTier: e.target.value }))}>
                <option value="free">Miễn phí</option>
                <option value="basic">Cơ bản</option>
                <option value="premium">Nâng cao</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Mô tả</label>
            <input className="input w-full" placeholder="Mô tả ngắn về bài học..." value={lesForm.description} onChange={e => setLesForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
            <input type="number" className="input w-24" min={0} value={lesForm.order} onChange={e => setLesForm(f => ({ ...f, order: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
          <button onClick={saveLes} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
