import { redirect } from 'next/navigation';

export default function LocaleRootPage({ params }: { params: { locale: string } }) {
  // Mặc định điều hướng về [locale]/ja
  redirect(`/${params.locale}/ja`);
  return null;
}
