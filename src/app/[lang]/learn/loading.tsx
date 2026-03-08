export default function LearnLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <div className="px-4 py-12" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="h-5 w-40 rounded-full mb-5" style={{ background: 'var(--border)' }} />
          <div className="h-10 w-80 rounded-xl mb-3" style={{ background: 'var(--border)' }} />
          <div className="h-5 w-full max-w-xl rounded mb-6" style={{ background: 'var(--border)' }} />
          <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Learn lanes skeleton */}
      <div className="px-4 py-8" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl p-5 h-32" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
            ))}
          </div>

          {/* Level cards skeleton */}
          <div>
            <div className="h-6 w-36 rounded mb-4" style={{ background: 'var(--border)' }} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-3xl p-6 h-48" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
