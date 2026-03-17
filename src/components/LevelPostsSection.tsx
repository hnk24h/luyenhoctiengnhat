'use client';

import { useState, useTransition } from 'react';
import { FaPen, FaXmark, FaPaperPlane, FaUsers } from 'react-icons/fa6';

export interface LevelPostData {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
}

interface Props {
  levelCode: string;
  initialPosts: LevelPostData[];
  userId?: string;
  userName?: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

// Gradient pairs for modern avatars
const AVATAR_GRADS = [
  ['#059669', '#0891B2'],
  ['#2563EB', '#7C3AED'],
  ['#D97706', '#EA580C'],
  ['#7C3AED', '#EC4899'],
  ['#DC2626', '#C2410C'],
  ['#0891B2', '#2563EB'],
  ['#065F46', '#059669'],
  ['#B45309', '#D97706'],
];

// Accent colors for left border of post cards
const POST_ACCENTS = [
  '#059669', '#2563EB', '#D97706', '#7C3AED',
  '#DC2626', '#0891B2', '#C2410C', '#EC4899',
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xfffff;
  return h;
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const idx = nameHash(name) % AVATAR_GRADS.length;
  const [c1, c2] = AVATAR_GRADS[idx];
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: `0 2px 8px ${c1}44`,
        fontSize: size * 0.38,
      }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}


export default function LevelPostsSection({ levelCode, initialPosts, userId, userName }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState('');
  // Always show the form if userId exists
  const showForm = !!userId;
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!draft.trim()) return;
    if (draft.length > 500) { setError('Tối đa 500 ký tự'); return; }
    setError('');
    startTransition(async () => {
      const res = await fetch(`/api/level-posts/${levelCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts(prev => [post, ...prev]);
        setDraft('');
        // No setShowForm(false) since form is always visible
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Có lỗi xảy ra');
      }
    });
  }

  return (
    <section>
      {/* ── Modern header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 12px #6366f140' }}>
            <FaUsers size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
              Cộng đồng học viên
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {posts.length > 0 ? `${posts.length} chia sẻ · cấp độ ${levelCode}` : `0 chia sẻ · cấp độ ${levelCode}`}
            </p>
          </div>
        </div>
        {!userId && (
          <a href="/auth/login"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
            Đăng nhập để chia sẻ
          </a>
        )}
      </div>

      {/* ── Write form (glass card) ── */}
      {showForm && userId && (
        <div className="mb-6 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(99,102,241,.25)',
            boxShadow: '0 4px 24px rgba(99,102,241,.1)',
          }}>
          {/* Purple accent strip */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }} />
          <div className="p-4">
            <div className="flex gap-3">
              {userName && <Avatar name={userName} />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>✏️ {userName}</p>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Chia sẻ kinh nghiệm, tip học, cảm nhận tại cấp độ này..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
                  style={{
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
                />
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[10px] font-medium"
                    style={{ color: error ? '#EF4444' : draft.length > 440 ? '#F59E0B' : 'var(--text-muted)' }}>
                    {error || `${draft.length}/500 · Ctrl+Enter gửi`}
                  </span>
                  <button
                    onClick={submit}
                    disabled={isPending || !draft.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 12px #6366f140' }}
                  >
                    <FaPaperPlane size={9} /> {isPending ? 'Đang gửi…' : 'Gửi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Posts list ── */}
      {posts.length === 0 ? (
        <div className="py-14 text-center rounded-2xl flex flex-col items-center gap-3"
          style={{ background: 'var(--bg-muted)', border: '2px dashed var(--border)' }}>
          <div className="text-4xl">🌱</div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Chưa có chia sẻ nào</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Chinh phục cấp độ này và chia sẻ hành trình của bạn!
            </p>
          </div>
          {/* If userId, form is always visible, so no CTA button needed */}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const hi = nameHash(post.userName);
            const accent = POST_ACCENTS[hi % POST_ACCENTS.length];
            const [gc1, gc2] = AVATAR_GRADS[hi % AVATAR_GRADS.length];
            return (
            <div
              key={post.id}
              className="rounded-2xl border overflow-hidden transition-all hover:shadow-md hover:-translate-y-px"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                borderLeft: `3px solid ${accent}`,
              }}
            >
              {/* Subtle gradient shimmer at top of card */}
              <div className="h-px" style={{ background: `linear-gradient(90deg, ${gc1}22, ${gc2}22, transparent)` }} />
              <div className="p-4 flex gap-3">
                <Avatar name={post.userName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {post.userName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${accent}18`, color: accent }}>
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </section>
  );
}
