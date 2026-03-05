import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaBullseye, FaBook, FaCircleQuestion, FaUser, FaSeedling, FaUpload, FaBookOpen, FaNewspaper, FaUsers } from 'react-icons/fa6';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/');

  const [levelCount, examSetCount, questionCount, userCount] = await Promise.all([
    prisma.level.count(),
    prisma.examSet.count(),
    prisma.question.count(),
    prisma.user.count(),
  ]);

  const stats: { label: string; value: number; icon: ReactNode; href: string; color: string }[] = [
    { label: 'Cấp độ',    value: levelCount,    icon: <FaBullseye size={20}/>, href: '/admin/levels',    color: 'bg-blue-50 border-blue-200' },
    { label: 'Bộ đề',     value: examSetCount,  icon: <FaBook size={20}/>,         href: '/admin/examsets',  color: 'bg-green-50 border-green-200' },
    { label: 'Câu hỏi',   value: questionCount, icon: <FaCircleQuestion size={20}/>, href: '/admin/examsets',  color: 'bg-yellow-50 border-yellow-200' },
    { label: 'Người dùng', value: userCount,     icon: <FaUser size={20}/>,         href: '/admin/users',     color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Quản lý nội dung hệ thống luyện thi tiếng Nhật</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className={`card border ${s.color} hover:shadow-md transition`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(0,0,0,0.06)' }}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/levels" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><FaBullseye size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Quản lý cấp độ</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa/xóa cấp độ N5~N1</p>
        </Link>
        <Link href="/admin/examsets" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#dcfce7', color: '#15803d' }}><FaBook size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Quản lý bộ đề</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa/xóa bộ đề, câu hỏi theo kỹ năng</p>
        </Link>
        <Link href="/admin/seed" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#fef9c3', color: '#92400e' }}><FaSeedling size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Seed dữ liệu mẫu</h3>
          <p className="text-sm text-gray-500 mt-1">Tạo dữ liệu mẫu để test hệ thống</p>
        </Link>
        <Link href="/admin/import" className="card hover:shadow-md transition group border-2 border-dashed border-indigo-200 bg-indigo-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#e0e7ff', color: '#4338ca' }}><FaUpload size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">Import câu hỏi</h3>
          <p className="text-sm text-gray-500 mt-1">Nhập hàng loạt câu hỏi từ file JSON</p>
        </Link>
        <Link href="/admin/learning" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#dbeafe', color: '#1d4ed8' }}><FaBookOpen size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Quản lý bài học</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa bài học từ vựng, ngữ pháp</p>
        </Link>
        <Link href="/admin/reading" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#fff7ed', color: '#ea580c' }}><FaNewspaper size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">Quản lý bài đọc</h3>
          <p className="text-sm text-gray-500 mt-1">Thêm/sửa bài đọc tiếng Nhật cho học viên</p>
        </Link>
        <Link href="/admin/users" className="card hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: '#ede9fe', color: '#7c3aed' }}><FaUsers size={20}/></div>
          <h3 className="font-semibold text-gray-900 group-hover:text-violet-600">Quản lý người dùng</h3>
          <p className="text-sm text-gray-500 mt-1">Xem, phân quyền và xóa tài khoản học viên</p>
        </Link>
      </div>
    </div>
  );
}
