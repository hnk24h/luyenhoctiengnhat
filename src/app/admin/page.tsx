import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

  const [levelCount, examSetCount, questionCount, userCount] = await Promise.all([
    prisma.level.count(),
    prisma.examSet.count(),
    prisma.question.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: 'Cấp độ', value: levelCount, icon: '🎯', href: '/admin/levels', color: 'bg-blue-50 border-blue-200' },
    { label: 'Bộ đề', value: examSetCount, icon: '📚', href: '/admin/examsets', color: 'bg-green-50 border-green-200' },
    { label: 'Câu hỏi', value: questionCount, icon: '❓', href: '/admin/examsets', color: 'bg-yellow-50 border-yellow-200' },
    { label: 'Người dùng', value: userCount, icon: '👤', href: '/admin/users', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Quản lý nội dung hệ thống luyện thi tiếng Nhật</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className={`card border ${s.color} hover:shadow-md transition`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/levels" className="card hover:shadow-md transition group">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Quản lý cấp độ</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa/xóa cấp độ N5~N1</p>
        </Link>
        <Link href="/admin/examsets" className="card hover:shadow-md transition group">
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Quản lý bộ đề</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa/xóa bộ đề, câu hỏi theo kỹ năng</p>
        </Link>
        <Link href="/admin/seed" className="card hover:shadow-md transition group">
          <div className="text-2xl mb-2">🌱</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Seed dữ liệu mẫu</h3>
          <p className="text-sm text-gray-500 mt-1">Tạo dữ liệu mẫu để test hệ thống</p>
        </Link>
      </div>
    </div>
  );
}
