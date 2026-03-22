export default function Header({ subject }: { subject: string }) {
  return (
    <header className="w-full">
      <div className="relative w-full rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-800 shadow-lg px-6 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Breadcrumb and title */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <a
              href="/admin"
              className="inline-block text-xs font-semibold rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white/80 hover:bg-white/20 transition"
            >
              Admin
            </a>
            <span className="mx-2 text-white/60 text-xs">/</span>
            <span className="inline-block text-xs font-semibold rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white/80">
              Quản lý bài học
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Bài học <span className="uppercase tracking-wide">{subject}</span>
          </h1>
          <div className="mt-2 text-sm text-white/80 flex items-center gap-2">
            {subject === 'JLPT' && <span>🇯🇵 Tiếng Nhật</span>}
            {subject === 'HSK' && <span>🇨🇳 Tiếng Trung</span>}
            {subject === 'PMP' && <span>📋 Quản lý dự án</span>}
            <span className="hidden md:inline">— Chủ đề → Bài học → Từ vựng / Ngữ pháp</span>
          </div>
        </div>
        {/* Right: Subject switcher */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {['JLPT', 'HSK', 'PMP'].map(s => (
            <a
              key={s}
              href={`?subject=${s}`}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm border transition-all shadow-sm
                ${subject === s
                  ? 'bg-white text-blue-700 border-white/80 scale-105'
                  : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}
              `}
              style={{ minWidth: 80, justifyContent: 'center' }}
            >
              {s === 'JLPT' ? '🇯🇵 JLPT' : s === 'HSK' ? '🇨🇳 HSK' : '📋 PMP'}
            </a>
          ))}
        </div>
        {/* Decorative circle */}
        <div className="absolute right-4 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none select-none hidden md:block" />
      </div>
    </header>
  );
}
