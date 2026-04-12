
import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { AdminModal, AdminFormField, AdminButton } from '@/components/admin/ui';

// Định nghĩa lại type Modal cho đúng với page.tsx
type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;

interface LessonModalProps {
  modal: Modal;
  setModal: React.Dispatch<React.SetStateAction<Modal>>;
  modalErr?: string;
  lesForm: {
    title: string;
    description: string;
    type: string;
    order: number;
    requiredTier: string;
    audioFile?: File;
    audioUrl?: string;
  };
  setLesForm: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    type: string;
    order: number;
    requiredTier: string;
    audioFile?: File;
    audioUrl?: string;
  }>>;
  LESSON_TYPES: string[];
  saving: boolean;
  saveLes: () => void;
}

export function LessonModal({ modal, setModal, modalErr, lesForm, setLesForm, LESSON_TYPES, saving, saveLes }: LessonModalProps) {
  if (modal !== 'les-create' && modal !== 'les-edit') return null;
  return (
    <AdminModal
      open
      onClose={() => setModal(null)}
      title={modal === 'les-create' ? 'Thêm bài học mới' : 'Sửa bài học'}
      size="md"
      footer={
        <div className="flex gap-3">
          <AdminButton variant="secondary" className="flex-1" onClick={() => setModal(null)}>Hủy</AdminButton>
          <AdminButton variant="primary" className="flex-1" onClick={saveLes} disabled={saving} loading={saving} icon={<FaCheck size={12} />}>
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
          <div className="grid grid-cols-3 gap-3">
            <AdminFormField label="Tên bài học" required>
              <input className="input w-full" placeholder="VD: Bài 1 - Gia đình" value={lesForm.title} onChange={e => setLesForm(f => ({ ...f, title: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label="Loại">
              <select className="input w-full text-sm" value={lesForm.type} onChange={e => setLesForm(f => ({ ...f, type: e.target.value }))}>
                {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Gói yêu cầu">
              <select className="input w-full text-sm" value={lesForm.requiredTier} onChange={e => setLesForm(f => ({ ...f, requiredTier: e.target.value }))}>
                <option value="free">Miễn phí</option>
                <option value="basic">Cơ bản</option>
                <option value="premium">Nâng cao</option>
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Mô tả">
            <input className="input w-full" placeholder="Mô tả ngắn về bài học..." value={lesForm.description} onChange={e => setLesForm(f => ({ ...f, description: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="File audio (mp3, wav, ogg) hoặc URL">
            <div className="flex gap-2">
              <input
                type="file"
                accept="audio/*"
                className="input w-full"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLesForm(f => ({ ...f, audioFile: file, audioUrl: '' }));
                  }
                }}
              />
            </div>
            <div className="mt-2">
              <input
                className="input w-full"
                placeholder="Hoặc dán URL file audio (https://...)"
                value={lesForm.audioUrl || ''}
                onChange={e => setLesForm(f => ({ ...f, audioUrl: e.target.value, audioFile: undefined }))}
              />
            </div>
            {lesForm.audioUrl && (
              <audio src={lesForm.audioUrl} controls className="mt-2 w-full" />
            )}
            {lesForm.audioFile && (
              <audio src={URL.createObjectURL(lesForm.audioFile)} controls className="mt-2 w-full" />
            )}
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <input type="number" className="input w-24" min={0} value={lesForm.order} onChange={e => setLesForm(f => ({ ...f, order: Number(e.target.value) }))} />
          </AdminFormField>
        </div>
    </AdminModal>
  );
}
