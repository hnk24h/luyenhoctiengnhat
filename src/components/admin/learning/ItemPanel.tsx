import React from 'react';
import { FaCirclePlus, FaFileArrowUp, FaPlus, FaPencil, FaTrash } from 'react-icons/fa6';

export default function ItemPanel({
  items,
  activeLesId,
  lessons,
  openItemCreate,
  openItemEdit,
  deleteItem,
  openImport,
}) {
  return (
    <div className="card flex flex-col gap-3" style={{ minHeight: 500 }}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>
          <FaCirclePlus className="inline mr-2" size={13} style={{ color: 'var(--primary)' }} />
          Mục từ vựng / ngữ pháp ({items.length})
          {activeLesId && (
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              — {lessons.find(l => l.id === activeLesId)?.title}
            </span>
          )}
        </h2>
        {activeLesId && (
          <div className="flex gap-1">
            <button onClick={openImport}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <FaFileArrowUp size={10} /> Import
            </button>
            <button onClick={openItemCreate}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold btn-primary">
              <FaPlus size={10} /> Thêm
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: 500 }}>
        {!activeLesId ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            ← Chọn bài học để xem các mục
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            Chưa có mục nào
          </div>
        ) : items.map(item => (
          <div key={item.id} className="group rounded-xl px-3 py-2.5 border transition-all hover:border-primary"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold" style={{ fontFamily: '"Noto Sans JP", serif', color: 'var(--primary)' }}>
                    {item.term}
                  </span>
                  {item.pronunciation && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                      ({item.pronunciation})
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {item.type}
                  </span>
                </div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-base)' }}>{item.meanings?.[0]?.meaning ?? ''}</div>
                {item.examples?.[0] && (
                  <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)', fontFamily: '"Noto Sans JP", serif' }}>
                    {item.examples[0].exampleText}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openItemEdit(item)} className="p-1 rounded hover:bg-black/10">
                  <FaPencil size={10} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-red-100">
                  <FaTrash size={10} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
