import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { AdminModal, AdminFormField, AdminButton } from '@/components/admin/ui';

type Modal = 'cat-create' | 'cat-edit' | 'les-create' | 'les-edit' | 'item-create' | 'item-edit' | null;
interface ItemForm {
  type: string;
  term: string;
  pronunciation: string;
  language: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  order: number;
}
interface ItemModalProps {
  modal: Modal;
  setModal: React.Dispatch<React.SetStateAction<Modal>>;
  modalErr: string;
  itemForm: ItemForm;
  setItemForm: React.Dispatch<React.SetStateAction<ItemForm>>;
  ITEM_TYPES: string[];
  saving: boolean;
  saveItem: () => void;
}

export function ItemModal({ modal, setModal, modalErr, itemForm, setItemForm, ITEM_TYPES, saving, saveItem }: ItemModalProps) {
  if (modal !== 'item-create' && modal !== 'item-edit') return null;
  return (
    <AdminModal
      open
      onClose={() => setModal(null)}
      title={modal === 'item-create' ? 'Thêm mục mới' : 'Sửa mục'}
      size="md"
      footer={
        <div className="flex gap-3">
          <AdminButton variant="secondary" className="flex-1" onClick={() => setModal(null)}>Hủy</AdminButton>
          <AdminButton variant="primary" className="flex-1" onClick={saveItem} disabled={saving} loading={saving} icon={<FaCheck size={12} />}>
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
            <AdminFormField label='Term' required>
              <span className="ml-1 text-xs font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（単語 / 漢字 / nội dung）</span>
              <input className="input w-full" placeholder="食べる" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.term} onChange={e => setItemForm(f => ({ ...f, term: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label='Phát âm'>
              <span className="ml-1 text-xs font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（よみかた / pīnyīn）</span>
              <input className="input w-full" placeholder="たべる" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.pronunciation} onChange={e => setItemForm(f => ({ ...f, pronunciation: e.target.value }))} />
            </AdminFormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Nghĩa" required>
              <input className="input w-full" placeholder="ăn (động từ nhóm 2)" value={itemForm.meaning} onChange={e => setItemForm(f => ({ ...f, meaning: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label="Loại">
              <select className="input w-full text-sm" value={itemForm.type} onChange={e => setItemForm(f => ({ ...f, type: e.target.value }))}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label='Câu ví dụ'>
            <span className="ml-1 text-xs font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（例文）</span>
            <input className="input w-full" placeholder="毎日ご飯を食べます。" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.example} onChange={e => setItemForm(f => ({ ...f, example: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="Nghĩa ví dụ">
            <input className="input w-full text-sm" placeholder="Tôi ăn cơm mỗi ngày." value={itemForm.exampleMeaning} onChange={e => setItemForm(f => ({ ...f, exampleMeaning: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <input type="number" className="input w-24" min={0} value={itemForm.order} onChange={e => setItemForm(f => ({ ...f, order: Number(e.target.value) }))} />
          </AdminFormField>
        </div>
    </AdminModal>
  );
}
