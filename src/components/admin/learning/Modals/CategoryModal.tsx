import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { AdminModal, AdminFormField, AdminButton } from '@/components/admin/ui';

interface Level { id: string; code: string; name: string }
interface Skill { value: string; label: string }
interface CatForm { levelId: string; skill: string; name: string; description: string; icon: string; order: number }
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
    <AdminModal
      open
      onClose={() => setModal(null)}
      title={modal === 'cat-create' ? 'Thêm chủ đề mới' : 'Sửa chủ đề'}
      size="sm"
      footer={
        <div className="flex gap-3">
          <AdminButton variant="secondary" className="flex-1" onClick={() => setModal(null)}>Hủy</AdminButton>
          <AdminButton variant="primary" className="flex-1" onClick={saveCat} disabled={saving} loading={saving} icon={<FaCheck size={12} />}>
            Lưu
          </AdminButton>
        </div>
      }
    >
        {modalErr && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            {modalErr}
          </div>
        )}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Cấp độ" required>
              <select className="input w-full text-sm" value={catForm.levelId} onChange={e => setCatForm(f => ({ ...f, levelId: e.target.value }))}>
                <option value="">Chọn cấp độ</option>
                {levels.map(lv => <option key={lv.id} value={lv.id}>{lv.code}{lv.name && lv.name !== lv.code ? ` — ${lv.name}` : ''}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Kỹ năng" required>
              <select className="input w-full text-sm" value={catForm.skill} onChange={e => setCatForm(f => ({ ...f, skill: e.target.value }))}>
                {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Tên chủ đề" required>
            <input className="input w-full" placeholder="VD: Từ vựng chủ đề Gia đình" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          </AdminFormField>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Icon (emoji)">
              <input className="input w-full" placeholder="👨‍👩‍👧" value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label="Thứ tự">
              <input type="number" className="input w-full" min={0} value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </AdminFormField>
          </div>
          <AdminFormField label="Mô tả">
            <textarea className="input w-full resize-none" rows={2} placeholder="Mô tả ngắn về chủ đề..." value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
          </AdminFormField>
        </div>
    </AdminModal>
  );
}

// TODO: Add LessonModal, ItemModal, ImportModal, etc. following the same pattern.
