import React from "react";

export default function ProgressBarDetail({ percent, learned, total }: { percent: number, learned: number, total: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500">Tiến trình</span>
        <span className="text-xs font-bold text-blue-600">{percent}% - {learned}/{total} từ đã học</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
