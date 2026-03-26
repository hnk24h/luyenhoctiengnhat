import React from "react";
import { FaLock } from "react-icons/fa";

export default function LockedContentPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border border-gray-200 my-6">
      <FaLock className="text-gray-400 mb-2" size={32} />
      <div className="text-gray-500 text-base font-semibold mb-1">Nội dung bị khóa</div>
      <div className="text-gray-400 text-sm">Nâng cấp để xem toàn bộ từ vựng, bài học và tính năng nâng cao.</div>
    </div>
  );
}
