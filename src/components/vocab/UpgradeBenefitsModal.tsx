"use client";
import React from "react";
import { FaCrown, FaCheckCircle } from "react-icons/fa";

export default function UpgradeBenefitsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">×</button>
        <div className="flex flex-col items-center">
          <FaCrown className="text-yellow-400 mb-2" size={40} />
          <h2 className="text-xl font-bold mb-2 text-gray-800">Lợi ích khi nâng cấp</h2>
          <ul className="text-gray-700 text-left mb-4 space-y-2">
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Truy cập không giới hạn tất cả bài học</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Học SRS, Flashcard, luyện đề nâng cao</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Theo dõi tiến trình, thành tích cá nhân</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Ưu tiên hỗ trợ, cập nhật tính năng mới</li>
          </ul>
          <button className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition mb-2">Nâng cấp ngay</button>
          <button onClick={onClose} className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Để sau</button>
        </div>
      </div>
    </div>
  );
}
