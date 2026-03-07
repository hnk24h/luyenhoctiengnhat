'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTriangleExclamation } from 'react-icons/fa6';

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) { router.push('/login?registered=1'); }
    else { setError(data.message || 'Đăng ký thất bại.'); }
    setLoading(false);
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white text-2xl font-bold mb-4 shadow-lg"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 20px rgba(61,58,140,.3)' }}>日</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Đăng ký tài khoản</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tham gia luyện thi tiếng Nhật ngay!</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Họ tên</label>
              <input className="input" type="text" value={name}
                onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" minLength={6} required />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <FaTriangleExclamation size={14} className="shrink-0"/> {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký miễn phí'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
