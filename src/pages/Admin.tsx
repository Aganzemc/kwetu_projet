import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Admin() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'users'|'groups'|'chats'|'announcements'>('users');
  const isAdmin = useMemo(() => profile?.role === 'ADMIN', [profile]);

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [chatA, setChatA] = useState('');
  const [chatB, setChatB] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const [u, g, a] = await Promise.all([
          api.users.list(),
          api.listGroups(),
          api.announcements.list()
        ]);
        setUsers(u?.data || []);
        setGroups(g?.data || []);
        setAnnouncements(a?.data || []);
      } catch {}
    })();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="text-gray-500">Admin only.</p>
      </div>
    );
  }

  const toggleUserActive = async (id: number, isActive: boolean) => {
    setLoading(true);
    try {
      await api.admin.users.activate(id, !isActive);
      const u = await api.admin.users.list();
      setUsers(u?.data || []);
    } finally { setLoading(false); }
  };

  const softDeleteUser = async (id: number) => {
    setLoading(true);
    try {
      await api.admin.users.delete(id);
      const u = await api.admin.users.list();
      setUsers(u?.data || []);
    } finally { setLoading(false); }
  };

  const toggleGroupActive = async (id: number, isActive: boolean) => {
    setLoading(true);
    try {
      await api.admin.groups.activate(id, !isActive);
      const g = await api.admin.groups.list();
      setGroups(g?.data || []);
    } finally { setLoading(false); }
  };

  const softDeleteGroup = async (id: number) => {
    setLoading(true);
    try {
      await api.admin.groups.delete(id);
      const g = await api.admin.groups.list();
      setGroups(g?.data || []);
    } finally { setLoading(false); }
  };

  const deletePrivateChat = async () => {
    if (!chatA || !chatB) return;
    setLoading(true);
    try {
      await api.admin.chats.delete({ userAId: Number(chatA), userBId: Number(chatB) });
      setChatA(''); setChatB('');
    } finally { setLoading(false); }
  };

  const createAnnouncement = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await api.admin.announcements.create({ title, content });
      setTitle(''); setContent('');
      const a = await api.announcements.list();
      setAnnouncements(a?.data || []);
    } finally { setLoading(false); }
  };

  const deleteAnnouncement = async (id: number) => {
    setLoading(true);
    try {
      await api.admin.announcements.delete(id);
      const a = await api.announcements.list();
      setAnnouncements(a?.data || []);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-2">
        <button onClick={() => setTab('users')} className={`px-3 py-2 rounded ${tab==='users'?'bg-black text-white':'bg-gray-200 dark:bg-gray-700'}`}>Users</button>
        <button onClick={() => setTab('groups')} className={`px-3 py-2 rounded ${tab==='groups'?'bg-black text-white':'bg-gray-200 dark:bg-gray-700'}`}>Groups</button>
        <button onClick={() => setTab('chats')} className={`px-3 py-2 rounded ${tab==='chats'?'bg-black text-white':'bg-gray-200 dark:bg-gray-700'}`}>Chats</button>
        <button onClick={() => setTab('announcements')} className={`px-3 py-2 rounded ${tab==='announcements'?'bg-black text-white':'bg-gray-200 dark:bg-gray-700'}`}>Announcements</button>
      </div>

      {tab==='users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{u.name} ({u.email})</div>
                <div className="text-xs text-gray-500">role: {u.role || 'USER'} | active: {String(u.isActive ?? true)} | deletedAt: {u.deletedAt || '-'}</div>
              </div>
              <div className="flex gap-2">
                <button disabled={loading} onClick={() => toggleUserActive(u.id, u.isActive ?? true)} className="px-3 py-1 rounded bg-blue-600 text-white">{(u.isActive ?? true)?'Deactivate':'Activate'}</button>
                <button disabled={loading} onClick={() => softDeleteUser(u.id)} className="px-3 py-1 rounded bg-red-600 text-white">Soft delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='groups' && (
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-gray-500">active: {String(g.isActive ?? true)} | deletedAt: {g.deletedAt || '-'}</div>
              </div>
              <div className="flex gap-2">
                <button disabled={loading} onClick={() => toggleGroupActive(g.id, g.isActive ?? true)} className="px-3 py-1 rounded bg-blue-600 text-white">{(g.isActive ?? true)?'Deactivate':'Activate'}</button>
                <button disabled={loading} onClick={() => softDeleteGroup(g.id)} className="px-3 py-1 rounded bg-red-600 text-white">Soft delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='chats' && (
        <div className="space-y-3 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            <input value={chatA} onChange={(e)=>setChatA(e.target.value)} placeholder="User A ID" className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-900" />
            <input value={chatB} onChange={(e)=>setChatB(e.target.value)} placeholder="User B ID" className="border rounded px-2 py-1 bg-gray-50 dark:bg-gray-900" />
          </div>
          <button disabled={loading || !chatA || !chatB} onClick={deletePrivateChat} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">Delete private chat</button>
        </div>
      )}

      {tab==='announcements' && (
        <div className="space-y-4">
          <div className="space-y-2 max-w-xl">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full border rounded px-2 py-1 bg-gray-50 dark:bg-gray-900" />
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Content" className="w-full border rounded px-2 py-2 bg-gray-50 dark:bg-gray-900" rows={4} />
            <button disabled={loading || !title.trim() || !content.trim()} onClick={createAnnouncement} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">Publish</button>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="border rounded p-3">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{a.content}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleString()}</div>
                <button disabled={loading} onClick={() => deleteAnnouncement(a.id)} className="mt-2 px-3 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
