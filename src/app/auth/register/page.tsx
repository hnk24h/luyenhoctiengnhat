'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTriangleExclamation, FaGoogle } from 'react-icons/fa6';
import { FaFacebook } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

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
    if (res.ok) { router.push('/auth/login?registered=1'); }
    else { setError(data.message || 'Đăng ký thất bại.'); }
    setLoading(false);
  }

  async function handleSSORegister(provider: 'google' | 'facebook') {
    setSsoLoading(provider);
    setError('');
    // SSO register = same as SSO login (auto-creates user if not exists)
    await signIn(provider, { callbackUrl: '/' });
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
          {/* SSO Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSSORegister('google')}
              disabled={!!ssoLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <FaGoogle className="text-red-500" size={18} />
              {ssoLoading === 'google' ? 'Đang chuyển hướng...' : 'Đăng ký với Google'}
            </button>
            <button
              type="button"
              onClick={() => handleSSORegister('facebook')}
              disabled={!!ssoLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <FaFacebook className="text-blue-600" size={18} />
              {ssoLoading === 'facebook' ? 'Đang chuyển hướng...' : 'Đăng ký với Facebook'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2" style={{ background: 'var(--bg-card, #fff)', color: 'var(--text-muted)' }}>hoặc</span>
            </div>
          </div>

          {/* Email/Password Form */}
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
          <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
