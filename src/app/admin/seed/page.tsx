'use client';
import { useState } from 'react';
import { FaSeedling, FaHouse, FaChevronRight } from 'react-icons/fa6';

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
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Seed dữ liệu</span>
      </nav>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Exam seed */}
        <div className="admin-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Bộ đề luyện thi</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Tạo các cấp độ N5~N1 và bộ đề mẫu (Nghe, Đọc, Viết) cho N5.
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <li>5 cấp độ: N5, N4, N3, N2, N1</li>
            <li>Bộ đề Nghe N5 – 3 câu trắc nghiệm</li>
            <li>Bộ đề Đọc N5 – 2 câu trắc nghiệm + 1 điền từ</li>
            <li>Bộ đề Viết/Kanji N5 – 2 câu trắc nghiệm + 1 điền từ</li>
          </ul>
          {msg && <p className={`text-xs p-2 rounded ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</p>}
          <button onClick={handleSeed} disabled={loading}
            className="admin-btn admin-btn--primary text-sm px-4 py-2 self-start">
            {loading ? 'Đang seed...' : '🌱 Tạo bộ đề mẫu'}
          </button>
        </div>

        {/* Learning seed */}
        <div className="admin-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Nội dung học N5</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Tạo module học N5 đầy đủ với 4 kỹ năng: Nghe, Nói, Đọc, Viết.
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <li>Nghe: Hội thoại hàng ngày, Số/Ngày/Giờ (5 bài, 26 mục)</li>
            <li>Nói: Giới thiệu bản thân, Mẫu câu giao tiếp (4 bài, 22 mục)</li>
            <li>Đọc: Từ vựng chủ đề, Ngữ pháp N5 (5 bài, 28 mục)</li>
            <li>Viết: Hiragana, Kanji N5, Katakana (7 bài, 36 mục)</li>
          </ul>
          <p className="text-xs text-amber-600 bg-amber-50 rounded p-1.5">⚠️ Cần seed bộ đề trước để có cấp độ N5.</p>
          {msgLearn && <p className={`text-xs p-2 rounded ${msgLearn.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgLearn}</p>}
          <button onClick={handleSeedLearning} disabled={loadingLearn}
            className="admin-btn admin-btn--primary text-sm px-4 py-2 self-start">
            {loadingLearn ? 'Đang seed...' : '📖 Tạo nội dung học N5'}
          </button>
        </div>

        {/* Minna */}
        <div className="admin-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Minna no Nihongo (N5 + N4)</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Seed 25 bài học Minna no Nihongo I (N5) và II (N4). Mỗi bài có từ vựng + ngữ pháp.
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <li>N5: 25 bài × (5 từ vựng + 2 ngữ pháp) = 175 mục</li>
            <li>N4: 25 bài × (5 từ vựng + 2 ngữ pháp) = 175 mục</li>
            <li>Tổng: 100 bài học, 350 mục</li>
          </ul>
          <p className="text-xs text-amber-600 bg-amber-50 rounded p-1.5">⚠️ Cần có level N5 và N4 trước.</p>
          {msgMinna && <p className={`text-xs p-2 rounded ${msgMinna.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgMinna}</p>}
          <button onClick={handleSeedMinna} disabled={loadingMinna}
            className="admin-btn admin-btn--primary text-sm px-4 py-2 self-start">
            {loadingMinna ? 'Đang seed...' : '🌸 Seed Minna N5 + N4'}
          </button>
        </div>

        {/* Mimikara */}
        <div className="admin-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📗</span>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Mimikara Oboeru + SKM (N3・N2・N1)</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Seed từ vựng Mimikara N3/N2/N1 và ngữ pháp Shin Kanzen Master. Mỗi cấp có 8 chương chủ đề.
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <li>N3: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
            <li>N2: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
            <li>N1: 8 chương × (7 từ + 3 ngữ pháp) = 80 mục</li>
          </ul>
          <p className="text-xs text-amber-600 bg-amber-50 rounded p-1.5">⚠️ Cần có level N3, N2, N1 trước.</p>
          {msgMimikara && <p className={`text-xs p-2 rounded ${msgMimikara.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgMimikara}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSeedMimikara} disabled={loadingMimikara}
              className="admin-btn admin-btn--primary text-sm px-4 py-2">
              {loadingMimikara ? 'Đang seed...' : '📗 Seed N3 + N2 + N1'}
            </button>
            {(['N3', 'N2', 'N1'] as const).map(lvl => (
              <button key={lvl}
                onClick={() => { setLoadingMimikara(true); setMsgMimikara(''); fetch(`/api/admin/seed-mimikara?level=${lvl}`, { method: 'POST' }).then(r => r.json()).then(d => { setMsgMimikara(d.message); setLoadingMimikara(false); }); }}
                disabled={loadingMimikara}
                className="admin-btn admin-btn--secondary text-sm px-3 py-1.5">
                Chỉ {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Listening */}
        <div className="admin-card p-4 flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Bài nghe N5~N1</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Tạo ngân hàng bài nghe N5~N1 từ bộ dữ liệu mẫu. Giữ nguyên mondai, transcript, đáp án và giải thích.
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5" style={{ color: 'var(--text-muted)' }}>
            <li>Seed đủ 5 level từ N5 đến N1</li>
            <li>Giữ nguyên transcript, đáp án và giải thích</li>
            <li>Nếu audioUrl trống, page nghe dùng Web Speech làm mặc định</li>
          </ul>
          <p className="text-xs text-amber-600 bg-amber-50 rounded p-1.5">⚠️ Cần có các level N5~N1 trước khi seed listening.</p>
          {msgListening && <p className={`text-xs p-2 rounded ${msgListening.includes('Đã seed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgListening}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSeedListening} disabled={loadingListening}
              className="admin-btn admin-btn--primary text-sm px-4 py-2">
              {loadingListening ? 'Đang seed...' : '🎧 Seed bài nghe mẫu'}
            </button>
            <a href="/samples/jlpt-listening-sample.json" download
              className="admin-btn admin-btn--secondary text-sm px-3 py-1.5">
              Tải JSON mẫu
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

