/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── URL migration: old paths → ISO lang-prefixed paths ──────────────────
  async redirects() {
    return [
      // JLPT / Japanese (old flat paths → /ja/*)
      { source: '/learn',             destination: '/ja/learn',     permanent: true },
      { source: '/learn/:path*',      destination: '/ja/learn/:path*',  permanent: true },
      { source: '/exam/:path*',       destination: '/ja/exam/:path*',   permanent: true },
      { source: '/flashcards',        destination: '/ja/practice',  permanent: true },
      { source: '/flashcards/:p*',    destination: '/ja/practice/:p*',  permanent: true },
      { source: '/reading',           destination: '/ja/reading',   permanent: true },
      { source: '/reading/:path*',    destination: '/ja/reading/:path*',permanent: true },
      { source: '/listening',         destination: '/ja/listening', permanent: true },
      { source: '/listening/:path*',  destination: '/ja/listening/:path*', permanent: true },
      { source: '/vocab',             destination: '/ja/vocab',     permanent: true },
      { source: '/levels',            destination: '/ja/levels',    permanent: true },
      { source: '/levels/:path*',     destination: '/ja/levels/:path*', permanent: true },
      // Chinese (old /chinese/* → /zh/*)
      { source: '/chinese',           destination: '/zh',           permanent: true },
      { source: '/chinese/:path*',    destination: '/zh/:path*',    permanent: true },
      // PMP / English (old /pmp/* → /en/pmp/*)
      { source: '/pmp',               destination: '/en/pmp',       permanent: true },
      { source: '/pmp/:path*',        destination: '/en/pmp/:path*',permanent: true },
      // Auth pages moved to /auth/*
      { source: '/login',             destination: '/auth/login',   permanent: true },
      { source: '/register',          destination: '/auth/register',permanent: true },
    ];
  },

  // ── Internal rewrites: new ISO paths → legacy page files (browser URL unchanged) ──
  async rewrites() {
    return [
      // /en/pmp/* → serve from /pmp/* pages
      { source: '/en/pmp',            destination: '/pmp' },
      { source: '/en/pmp/:path*',     destination: '/pmp/:path*' },
    ];
  },
};

module.exports = nextConfig;
