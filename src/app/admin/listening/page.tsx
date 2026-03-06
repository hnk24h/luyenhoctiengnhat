import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminListeningClient from './AdminListeningClient';

export const dynamic = 'force-dynamic';

export default async function AdminListeningPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/');

  return <AdminListeningClient />;
}