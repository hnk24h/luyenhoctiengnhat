import { redirect } from 'next/navigation';

export default async function LocaleRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Mặc định điều hướng về [locale]/ja
  redirect(`/${locale}/ja`);
  return null;
}
