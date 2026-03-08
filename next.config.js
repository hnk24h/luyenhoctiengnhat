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
    ];
  },

  // ── Internal rewrites: new ISO paths → legacy page files (browser URL unchanged) ──
  async rewrites() {
    return [
      // /zh/* → serve from legacy /chinese/* pages (until unified)
      { source: '/zh',                destination: '/chinese' },
      { source: '/zh/vocab',          destination: '/chinese/vocab' },
      { source: '/zh/vocab/:path*',   destination: '/chinese/vocab/:path*' },
      { source: '/zh/grammar',        destination: '/chinese/grammar' },
      { source: '/zh/grammar/:path*', destination: '/chinese/grammar/:path*' },
      { source: '/zh/listening',      destination: '/chinese/listening' },
      { source: '/zh/listening/:p*',  destination: '/chinese/listening/:p*' },
      { source: '/zh/practice',       destination: '/chinese/flashcards' },
      { source: '/zh/practice/:p*',   destination: '/chinese/flashcards/:p*' },
      // /en/pmp/* → serve from /pmp/* pages
      { source: '/en/pmp',            destination: '/pmp' },
      { source: '/en/pmp/:path*',     destination: '/pmp/:path*' },
    ];
  },
};

module.exports = nextConfig;
