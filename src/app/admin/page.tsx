import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FaBullseye, FaBook, FaCircleQuestion, FaSeedling, FaUpload,
  FaBookOpen, FaNewspaper, FaUsers, FaPalette, FaHeadphones, FaLayerGroup,
} from 'react-icons/fa6';
import AdminDashboardClient, { type LangData, type GlobalStats } from './_components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') redirect('/');

  const [
    userCount,
    jlptLevels, hskLevels, pmpLevels,
    jlptExamSets, hskExamSets, pmpExamSets,
    jlptQuestions, hskQuestions, pmpQuestions,
    jlptCategories, hskCategories, pmpCategories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.level.count({ where: { subject: 'JLPT' } }),
    prisma.level.count({ where: { subject: 'HSK' } }),
    prisma.level.count({ where: { subject: 'PMP' } }),
    prisma.examSet.count({ where: { level: { subject: 'JLPT' } } }),
    prisma.examSet.count({ where: { level: { subject: 'HSK' } } }),
    prisma.examSet.count({ where: { level: { subject: 'PMP' } } }),
    prisma.question.count({ where: { examSet: { level: { subject: 'JLPT' } } } }),
    prisma.question.count({ where: { examSet: { level: { subject: 'HSK' } } } }),
    prisma.question.count({ where: { examSet: { level: { subject: 'PMP' } } } }),
    prisma.learningCategory.count({ where: { level: { subject: 'JLPT' } } }),
    prisma.learningCategory.count({ where: { level: { subject: 'HSK' } } }),
    prisma.learningCategory.count({ where: { level: { subject: 'PMP' } } }),
  ]);

  const global: GlobalStats = {
    users: userCount,
    levels: jlptLevels + hskLevels + pmpLevels,
    questions: jlptQuestions + hskQuestions + pmpQuestions,
    lessons: jlptCategories + hskCategories + pmpCategories,
  };

  const languages: LangData[] = [
    {
      key: 'JLPT',
      flag: '🇯🇵',
      label: 'Tiếng Nhật — JLPT',
      shortLabel: 'JLPT',
      desc: 'N5 → N1',
      accent: 'red',
      tabBg: 'bg-red-50',
      tabText: 'text-red-600',
      sectionBg: 'bg-red-50',
      badgeClass: 'bg-red-100 text-red-700',
      stats: [
        { label: 'Cấp độ', value: jlptLevels, href: '/admin/levels?subject=JLPT' },
        { label: 'Bộ đề', value: jlptExamSets, href: '/admin/examsets?subject=JLPT' },
        { label: 'Câu hỏi', value: jlptQuestions, href: '/admin/examsets?subject=JLPT' },
        { label: 'Bài học', value: jlptCategories, href: '/admin/learning?subject=JLPT' },
      ],
      links: [
        { href: '/admin/levels?subject=JLPT', icon: <FaBullseye size={18}/>, label: 'Cấp độ', desc: 'N5 → N1', bg: 'rgba(220,38,38,0.12)', color: '#dc2626' },
        { href: '/admin/examsets?subject=JLPT', icon: <FaBook size={18}/>, label: 'Bộ đề', desc: 'Đề thi theo kỹ năng', bg: 'rgba(22,163,74,0.12)', color: '#15803d' },
        { href: '/admin/learning?subject=JLPT', icon: <FaBookOpen size={18}/>, label: 'Bài học', desc: 'Từ vựng & ngữ pháp', bg: 'rgba(29,78,216,0.12)', color: '#1d4ed8' },
        { href: '/admin/reading?subject=JLPT', icon: <FaNewspaper size={18}/>, label: 'Bài đọc', desc: 'Reading passages', bg: 'rgba(234,88,12,0.12)', color: '#ea580c' },
        { href: '/admin/listening?subject=JLPT', icon: <FaHeadphones size={18}/>, label: 'Bài nghe', desc: 'Audio transcript', bg: 'rgba(37,99,235,0.12)', color: '#2563eb' },
        { href: '/admin/import?subject=JLPT', icon: <FaUpload size={18}/>, label: 'Import JSON', desc: 'Nhập hàng loạt', bg: 'rgba(67,56,202,0.12)', color: '#4338ca' },
      ],
    },
    {
      key: 'HSK',
      flag: '🇨🇳',
      label: 'Tiếng Trung — HSK',
      shortLabel: 'HSK',
      desc: 'HSK 1 → 6',
      accent: 'yellow',
      tabBg: 'bg-yellow-50',
      tabText: 'text-yellow-700',
      sectionBg: 'bg-yellow-50',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      stats: [
        { label: 'Cấp độ', value: hskLevels, href: '/admin/levels?subject=HSK' },
        { label: 'Bộ đề', value: hskExamSets, href: '/admin/examsets?subject=HSK' },
        { label: 'Câu hỏi', value: hskQuestions, href: '/admin/examsets?subject=HSK' },
        { label: 'Bài học', value: hskCategories, href: '/admin/learning?subject=HSK' },
      ],
      links: [
        { href: '/admin/levels?subject=HSK', icon: <FaBullseye size={18}/>, label: 'Cấp độ', desc: 'HSK 1 → 6', bg: 'rgba(161,98,7,0.12)', color: '#a16207' },
        { href: '/admin/examsets?subject=HSK', icon: <FaBook size={18}/>, label: 'Bộ đề', desc: 'Đề thi HSK', bg: 'rgba(22,163,74,0.12)', color: '#15803d' },
        { href: '/admin/learning?subject=HSK', icon: <FaBookOpen size={18}/>, label: 'Bài học', desc: 'Từ vựng & ngữ pháp', bg: 'rgba(29,78,216,0.12)', color: '#1d4ed8' },
        { href: '/admin/reading?subject=HSK', icon: <FaNewspaper size={18}/>, label: 'Bài đọc', desc: 'Reading passages', bg: 'rgba(234,88,12,0.12)', color: '#ea580c' },
        { href: '/admin/import?subject=HSK', icon: <FaUpload size={18}/>, label: 'Import JSON', desc: 'Nhập hàng loạt', bg: 'rgba(67,56,202,0.12)', color: '#4338ca' },
      ],
    },
    {
      key: 'PMP',
      flag: '📋',
      label: 'Quản lý dự án — PMP',
      shortLabel: 'PMP',
      desc: 'PMBOK 6',
      accent: 'blue',
      tabBg: 'bg-blue-50',
      tabText: 'text-blue-700',
      sectionBg: 'bg-blue-50',
      badgeClass: 'bg-blue-100 text-blue-800',
      stats: [
        { label: 'Cấp độ', value: pmpLevels, href: '/admin/levels?subject=PMP' },
        { label: 'Bộ đề', value: pmpExamSets, href: '/admin/examsets?subject=PMP' },
        { label: 'Câu hỏi', value: pmpQuestions, href: '/admin/examsets?subject=PMP' },
        { label: 'Bài học', value: pmpCategories, href: '/admin/learning?subject=PMP' },
      ],
      links: [
        { href: '/admin/levels?subject=PMP', icon: <FaBullseye size={18}/>, label: 'Cấp độ', desc: 'PMP level config', bg: 'rgba(29,78,216,0.12)', color: '#1d4ed8' },
        { href: '/admin/examsets?subject=PMP', icon: <FaBook size={18}/>, label: 'Bộ đề', desc: 'Mock exam PMP', bg: 'rgba(22,163,74,0.12)', color: '#15803d' },
        { href: '/admin/learning?subject=PMP', icon: <FaBookOpen size={18}/>, label: 'Bài học', desc: 'PMBOK theory, ITTOs', bg: 'rgba(124,58,237,0.12)', color: '#7c3aed' },
        { href: '/admin/import?subject=PMP', icon: <FaUpload size={18}/>, label: 'Import JSON', desc: 'Nhập hàng loạt', bg: 'rgba(67,56,202,0.12)', color: '#4338ca' },
      ],
    },
  ];

  return <AdminDashboardClient global={global} languages={languages} />;
}
