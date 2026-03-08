import { redirect } from 'next/navigation';

/** Default entry page per language */
const LANG_ENTRY: Record<string, string> = {
  ja: 'learn',
  zh: 'learn',   // /zh/learn → HSK catalog via [lang]/learn/page.tsx
  ko: 'learn',
  vi: 'learn',
  en: 'pmp',     // PMP served via /en/pmp rewrite → /pmp
};

export default function LangPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/${LANG_ENTRY[params.lang] ?? 'learn'}`);
}
