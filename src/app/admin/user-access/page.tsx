"use client";
import { useState, useEffect } from 'react';
import { FaKey, FaHouse, FaChevronRight } from 'react-icons/fa6';

type User = {
  id: string;
  name: string;
  email: string;
};

type Lesson = {
  id: string;
  title: string;
};

type Access = {
  lesson: Lesson;
  note?: string;
};

export default function AdminUserLessonAccess() {
  const [users, setUsers] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [note, setNote] = useState('');

  // Load users
  useEffect(() => {
    fetch('/api/admin/users/all').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setUsers(data as User[]);
      } else {
        alert('Bạn không có quyền admin để truy cập trang này!');
      }
    });
  }, []);

  // Load lessons
  useEffect(() => {
    fetch('/api/learning/lessons').then(r => r.json()).then(setLessons);
  }, []);

  // Load accesses
  useEffect(() => {
    fetch(`/api/learning/user-access?userId=${selectedUser}`).then(r => r.json()).then(setAccesses);
  }, [selectedUser]);

  const grantAccess = async () => {
    if (!selectedUser || !selectedLesson) return alert('Chọn user và bài học');
    await fetch('/api/learning/user-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser, lessonId: selectedLesson, note }),
    });
    setNote('');
    setSelectedLesson('');
    fetch(`/api/learning/user-access?userId=${selectedUser}`).then(r => r.json()).then(setAccesses);
  };

  const revokeAccess = async (lessonId: string) => {
    await fetch(`/api/learning/user-access?userId=${selectedUser}&lessonId=${lessonId}`, { method: 'DELETE' });
    fetch(`/api/learning/user-access?userId=${selectedUser}`).then(r => r.json()).then(setAccesses);
  };

  return (
    <div className="flex flex-col gap-3" style={{ background: 'var(--bg-muted)', minHeight: '100%' }}>
      <nav className="flex items-center gap-1.5 text-xs px-1" style={{ color: 'var(--text-muted)' }}>
        <FaHouse size={10} />
        <FaChevronRight size={8} />
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Phân quyền bài học</span>
      </nav>
      <div className="admin-card p-5 max-w-xl">
      <div className="mb-3">
        <label className="block mb-1 font-semibold">Chọn user:</label>
        <select className="input w-full" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">-- Chọn user --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-semibold">Chọn bài học:</label>
        <select className="input w-full" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}>
          <option value="">-- Chọn bài học --</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-semibold">Ghi chú (tuỳ chọn):</label>
        <input className="input w-full" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <button className="btn-primary w-full mb-4" onClick={grantAccess}>Cấp quyền truy cập</button>
      <h3 className="font-bold mb-2">Danh sách quyền đã cấp:</h3>
      <ul className="space-y-2">
        {accesses.map(a => (
          <li key={a.lesson.id} className="flex items-center justify-between rounded px-3 py-2" style={{ background: 'var(--bg-muted)' }}>
            <span>{a.lesson.title} <span className="text-xs text-gray-500">({a.note || 'Không ghi chú'})</span></span>
            <button className="btn-secondary" onClick={() => revokeAccess(a.lesson.id)}>Thu hồi</button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}


