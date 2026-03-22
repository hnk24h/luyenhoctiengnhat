import React from 'react';
import { FaXmark, FaCheck, FaPlus, FaFileArrowUp, FaDownload, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';

interface Level { code: string; name?: string }
interface Skill { value: string; label: string }
interface CatForm { levelCode: string; skill: string; name: string; description: string; icon: string; order: number }
type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;
interface CategoryModalProps {
  modal: Modal;
  setModal: React.Dispatch<React.SetStateAction<Modal>>;
  modalErr: string | null;
  catForm: CatForm;
  setCatForm: React.Dispatch<React.SetStateAction<CatForm>>;
  levels: Level[];
  SKILLS: Skill[];
  saving: boolean;
  saveCat: () => void;
}

export function CategoryModal({ modal, setModal, modalErr, catForm, setCatForm, levels, SKILLS, saving, saveCat }: CategoryModalProps) {
  if (modal !== 'cat-create' && modal !== 'cat-edit') return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setModal(null)}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
            {modal === 'cat-create' ? 'Thêm chủ đề mới' : 'Sửa chủ đề'}
          </h2>
          <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><FaXmark size={14} /></button>
        </div>
        {modalErr && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            {modalErr}
          </div>
        )}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Cấp độ *</label>
              <select className="input w-full text-sm" value={catForm.levelCode} onChange={e => setCatForm(f => ({ ...f, levelCode: e.target.value }))}>
                {levels.map(lv => <option key={lv.code} value={lv.code}>{lv.code}{lv.name && lv.name !== lv.code ? ` — ${lv.name}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Kỹ năng *</label>
              <select className="input w-full text-sm" value={catForm.skill} onChange={e => setCatForm(f => ({ ...f, skill: e.target.value }))}>
                {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Tên chủ đề *</label>
            <input className="input w-full" placeholder="VD: Từ vựng chủ đề Gia đình" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Icon (emoji)</label>
              <input className="input w-full" placeholder="👨‍👩‍👧" value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
              <input type="number" className="input w-full" min={0} value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Mô tả</label>
            <textarea className="input w-full resize-none" rows={2} placeholder="Mô tả ngắn về chủ đề..." value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
          <button onClick={saveCat} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// TODO: Add LessonModal, ItemModal, ImportModal, etc. following the same pattern.
