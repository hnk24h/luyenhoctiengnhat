import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Không Tìm Thấy Trang | IkagiLearn',
  description: 'Trang bạn đang tìm không tồn tại.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Decorative Japanese character */}
      <p
        className="select-none text-[120px] font-bold leading-none opacity-10"
        aria-hidden="true"
      >
        ？
      </p>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Không tìm thấy trang
        </h2>
        <p className="max-w-sm text-gray-500 dark:text-gray-400">
          Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
          Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Về trang chủ
        </Link>
        <Link
          href="/vi/ja/learn"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Học tiếng Nhật
        </Link>
        <Link
          href="/vi/ja/vocab"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Từ vựng
        </Link>
      </div>
    </div>
  );
}
