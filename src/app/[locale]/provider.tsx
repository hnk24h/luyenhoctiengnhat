import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

export default async function LocaleProvider({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages: Record<string, string> = {};
  try {
    messages = (await import(`../../../public/locales/${locale}/common.json`)).default;
  } catch {
    // Locale message file not found – render without translations rather than 404
  }
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
