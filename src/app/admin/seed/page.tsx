'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [loadingLearn, setLoadingLearn] = useState(false);
  const [msgLearn, setMsgLearn] = useState('');

  async function handleSeed() {
    setLoading(true); setMsg('');
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    const data = await res.json();
    setMsg(data.message);
    setLoading(false);
  }

  async function handleSeedLearning() {
    setLoadingLearn(true); setMsgLearn('');
    const res = await fetch('/api/admin/seed-learning', { method: 'POST' });
    const data = await res.json();
    setMsgLearn(data.message);
    setLoadingLearn(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← Admin</Link>
      <h1 className="text-2xl font-bold text-gray-900">Seed dữ liệu mẫu</h1>

      {/* Exam seed */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">🎓 Bộ đề luyện thi</h2>
        <p className="text-gray-600 mb-4">
          Tạo các cấp độ N5~N1 và một số bộ đề mẫu cho N5 (Nghe, Đọc, Viết).
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>5 cấp độ: N5, N4, N3, N2, N1</li>
          <li>Bộ đề Nghe N5 - 3 câu trắc nghiệm</li>
          <li>Bộ đề Đọc N5 - 2 câu trắc nghiệm + 1 điền từ</li>
          <li>Bộ đề Viết/Kanji N5 - 2 câu trắc nghiệm + 1 điền từ</li>
        </ul>
        {msg && <p className={`text-sm mb-3 p-2 rounded ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</p>}
        <button onClick={handleSeed} disabled={loading} className="btn-primary">
          {loading ? 'Đang seed...' : '🌱 Tạo bộ đề mẫu'}
        </button>
      </div>

      {/* Learning seed */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">📚 Nội dung học N5</h2>
        <p className="text-gray-600 mb-4">
          Tạo dữ liệu module học N5 đầy đủ với 4 kỹ năng: Nghe, Nói, Đọc, Viết.
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>Nghe: Hội thoại hàng ngày, Số/Ngày/Giờ (5 bài, 26 mục)</li>
          <li>Nói: Giới thiệu bản thân, Mẫu câu giao tiếp (4 bài, 22 mục)</li>
          <li>Đọc: Từ vựng chủ đề, Ngữ pháp N5 (5 bài, 28 mục)</li>
          <li>Viết: Hiragana, Kanji N5, Katakana (7 bài, 36 mục)</li>
        </ul>
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 mb-3">⚠️ Cần seed bộ đề trước để có cấp độ N5.</p>
        {msgLearn && <p className={`text-sm mb-3 p-2 rounded ${msgLearn.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgLearn}</p>}
        <button onClick={handleSeedLearning} disabled={loadingLearn} className="btn-primary">
          {loadingLearn ? 'Đang seed...' : '📖 Tạo nội dung học N5'}
        </button>
      </div>
    </div>
  );
}
