'use client';
import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaTriangleExclamation, FaGoogle } from 'react-icons/fa6';
import { FaFacebook } from 'react-icons/fa';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'OAuthAccountNotLinked') {
      setError('Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email/mật khẩu.');
    } else if (err === 'OAuthCallbackError') {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.ok) { router.push('/'); router.refresh(); }
    else { setError('Email hoặc mật khẩu không đúng.'); }
    setLoading(false);
  }

  async function handleSSOLogin(provider: 'google' | 'facebook') {
    setSsoLoading(provider);
    setError('');
    await signIn(provider, { callbackUrl: '/' });
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white text-2xl font-bold mb-4 shadow-lg"
            style={{ background: 'var(--primary)', boxShadow: '0 4px 20px rgba(61,58,140,.3)' }}>日</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Đăng nhập</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Chào mừng bạn trở lại!</p>
        </div>

        <div className="card">
          {/* SSO Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSSOLogin('google')}
              disabled={!!ssoLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <FaGoogle className="text-red-500" size={18} />
              {ssoLoading === 'google' ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
            </button>
            <button
              type="button"
              onClick={() => handleSSOLogin('facebook')}
              disabled={!!ssoLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <FaFacebook className="text-blue-600" size={18} />
              {ssoLoading === 'facebook' ? 'Đang chuyển hướng...' : 'Đăng nhập với Facebook'}
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
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <FaTriangleExclamation size={14} className="shrink-0"/> {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
