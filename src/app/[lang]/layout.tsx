import { notFound } from 'next/navigation';

/**
 * Supported ISO 639-1 language codes for the platform.
 * Next.js will match any string for [lang]; this layout validates it.
 */
const VALID_LANGS = new Set(['ja', 'zh', 'ko', 'vi', 'en']);

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!VALID_LANGS.has(params.lang)) notFound();
  return <>{children}</>;
}
