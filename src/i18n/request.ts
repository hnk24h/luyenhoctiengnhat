import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['vi', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale comes from the [locale] URL segment via next-intl plugin.
  // For pages outside [locale] (root, admin, auth) it may be undefined —
  // fall back to 'vi' instead of calling notFound().
  const raw = await requestLocale;
  const locale: Locale =
    raw && SUPPORTED_LOCALES.includes(raw as Locale) ? (raw as Locale) : 'vi';

  let messages: Record<string, string> = {};
  try {
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch {
    // message file missing – return empty messages so the app still renders
  }

  return { locale, messages };
});
