import React from 'react';
import { FaXmark, FaCheck } from 'react-icons/fa6';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setModal(null)}>
      <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-base)' }}>
            {modal === 'item-create' ? 'Thêm mục mới' : 'Sửa mục'}
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
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                Term *<span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（単語 / 漢字 / nội dung）</span>
              </label>
              <input className="input w-full" placeholder="食べる" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.term} onChange={e => setItemForm(f => ({ ...f, term: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
                Phát âm<span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（よみかた / pīnyīn）</span>
              </label>
              <input className="input w-full" placeholder="たべる" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.pronunciation} onChange={e => setItemForm(f => ({ ...f, pronunciation: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Nghĩa *</label>
              <input className="input w-full" placeholder="ăn (động từ nhóm 2)" value={itemForm.meaning} onChange={e => setItemForm(f => ({ ...f, meaning: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Loại</label>
              <select className="input w-full text-sm" value={itemForm.type} onChange={e => setItemForm(f => ({ ...f, type: e.target.value }))}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>
              Câu ví dụ<span className="ml-1 font-normal opacity-60" style={{ fontFamily: '"Noto Sans JP"' }}>（例文）</span>
            </label>
            <input className="input w-full" placeholder="毎日ご飯を食べます。" style={{ fontFamily: '"Noto Sans JP"' }} value={itemForm.example} onChange={e => setItemForm(f => ({ ...f, example: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Nghĩa ví dụ</label>
            <input className="input w-full text-sm" placeholder="Tôi ăn cơm mỗi ngày." value={itemForm.exampleMeaning} onChange={e => setItemForm(f => ({ ...f, exampleMeaning: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-base)' }}>Thứ tự</label>
            <input type="number" className="input w-24" min={0} value={itemForm.order} onChange={e => setItemForm(f => ({ ...f, order: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
          <button onClick={saveItem} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FaCheck size={12} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
