'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [loadingLearn, setLoadingLearn] = useState(false);
  const [msgLearn, setMsgLearn] = useState('');
  const [loadingListening, setLoadingListening] = useState(false);
  const [msgListening, setMsgListening] = useState('');
  const [loadingMinna, setLoadingMinna] = useState(false);
  const [msgMinna, setMsgMinna] = useState('');
  const [loadingMimikara, setLoadingMimikara] = useState(false);
  const [msgMimikara, setMsgMimikara] = useState('');

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

  async function handleSeedListening() {
    setLoadingListening(true); setMsgListening('');
    const res = await fetch('/api/admin/seed-listening', { method: 'POST' });
    const data = await res.json();
    setMsgListening(data.message);
    setLoadingListening(false);
  }

  async function handleSeedMinna() {
    setLoadingMinna(true); setMsgMinna('');
    const res = await fetch('/api/admin/seed-minna', { method: 'POST' });
    const data = await res.json();
    setMsgMinna(data.message);
    setLoadingMinna(false);
  }

  async function handleSeedMimikara() {
    setLoadingMimikara(true); setMsgMimikara('');
    const res = await fetch('/api/admin/seed-mimikara', { method: 'POST' });
    const data = await res.json();
    setMsgMimikara(data.message);
    setLoadingMimikara(false);
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

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">� Minna no Nihongo (N5 + N4)</h2>
        <p className="text-gray-600 mb-4">
          Seed 25 bài học của Minna no Nihongo I (N5, Bài 1~25) và II (N4, Bài 26~50).
          Mỗi bài có từ vựng + ngữ pháp riêng, hiển thị ở tab <strong>Từ vựng / Ngữ pháp</strong> trong trang học.
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>N5: 25 bài × (5 từ vựng + 2 ngữ pháp) = 175 mục</li>
          <li>N4: 25 bài × (5 từ vựng + 2 ngữ pháp) = 175 mục</li>
          <li>Tổng: 100 bài học, 350 mục từ vựng/ngữ pháp</li>
        </ul>
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 mb-3">⚠️ Cần có level N5 và N4 trước (seed bộ đề trước).</p>
        {msgMinna && <p className={`text-sm mb-3 p-2 rounded ${msgMinna.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgMinna}</p>}
        <button onClick={handleSeedMinna} disabled={loadingMinna} className="btn-primary">
          {loadingMinna ? 'Đang seed...' : '🌸 Seed Minna no Nihongo N5 + N4'}
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">📗 Mimikara Oboeru + SKM (N3・N2・N1)</h2>
        <p className="text-gray-600 mb-4">
          Seed từ vựng theo <strong>Mimikara Oboeru N3/N2/N1 Goi</strong> và ngữ pháp theo <strong>Shin Kanzen Master N3/N2/N1</strong>.
          Mỗi cấp có 8 chương chủ đề, mỗi chương gồm 7 từ vựng + 3 ngữ pháp.
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>N3: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
          <li>N2: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
          <li>N1: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
          <li>Tổng: 48 bài học, 240 mục từ vựng/ngữ pháp</li>
        </ul>
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 mb-3">⚠️ Cần có level N3, N2, N1 trước (seed bộ đề trước).</p>
        {msgMimikara && <p className={`text-sm mb-3 p-2 rounded ${msgMimikara.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgMimikara}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSeedMimikara} disabled={loadingMimikara} className="btn-primary">
            {loadingMimikara ? 'Đang seed...' : '📗 Seed N3 + N2 + N1'}
          </button>
          <button onClick={() => { setLoadingMimikara(true); setMsgMimikara(''); fetch('/api/admin/seed-mimikara?level=N3', { method: 'POST' }).then(r => r.json()).then(d => { setMsgMimikara(d.message); setLoadingMimikara(false); }); }} disabled={loadingMimikara} className="btn-secondary text-sm">
            Chỉ N3
          </button>
          <button onClick={() => { setLoadingMimikara(true); setMsgMimikara(''); fetch('/api/admin/seed-mimikara?level=N2', { method: 'POST' }).then(r => r.json()).then(d => { setMsgMimikara(d.message); setLoadingMimikara(false); }); }} disabled={loadingMimikara} className="btn-secondary text-sm">
            Chỉ N2
          </button>
          <button onClick={() => { setLoadingMimikara(true); setMsgMimikara(''); fetch('/api/admin/seed-mimikara?level=N1', { method: 'POST' }).then(r => r.json()).then(d => { setMsgMimikara(d.message); setLoadingMimikara(false); }); }} disabled={loadingMimikara} className="btn-secondary text-sm">
            Chỉ N1
          </button>
        </div>
      </div>

      <div className="card">
        <p className="text-gray-600 mb-4">
          Dùng đúng bộ dữ liệu mẫu hiện có trên page nghe để tạo ngân hàng bài nghe N5~N1 trong database.
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>Seed đủ 5 level từ N5 đến N1</li>
          <li>Giữ nguyên mondai, transcript, đáp án và giải thích</li>
          <li>Nếu audioUrl trống thì page nghe vẫn dùng Web Speech làm mặc định</li>
        </ul>
        <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 mb-3">⚠️ Cần có các level N5~N1 trước khi seed listening.</p>
        {msgListening && <p className={`text-sm mb-3 p-2 rounded ${msgListening.includes('Đã seed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgListening}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSeedListening} disabled={loadingListening} className="btn-primary">
            {loadingListening ? 'Đang seed...' : '🎧 Seed bài nghe mẫu'}
          </button>
          <a href="/samples/jlpt-listening-sample.json" download className="btn-secondary">
            Tải JSON mẫu
          </a>
        </div>
      </div>
    </div>
  );
}
