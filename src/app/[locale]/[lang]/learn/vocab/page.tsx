'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JlptVocabRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/vocab'); }, [router]);
  return null;
}
