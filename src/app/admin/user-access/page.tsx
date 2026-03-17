"use client";
import { useState, useEffect } from 'react';

export default function AdminUserLessonAccess() {
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [note, setNote] = useState('');

  // Load users
  useEffect(() => {
    fetch('/api/admin/users/all').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setUsers(data);
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

  const revokeAccess = async (lessonId) => {
    await fetch(`/api/learning/user-access?userId=${selectedUser}&lessonId=${lessonId}`, { method: 'DELETE' });
    fetch(`/api/learning/user-access?userId=${selectedUser}`).then(r => r.json()).then(setAccesses);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Quản lý quyền truy cập bài học theo user</h2>
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
          <li key={a.lesson.id} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
            <span>{a.lesson.title} <span className="text-xs text-gray-500">({a.note || 'Không ghi chú'})</span></span>
            <button className="btn-secondary" onClick={() => revokeAccess(a.lesson.id)}>Thu hồi</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
