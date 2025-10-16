import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type UiUser = { id: number; name: string; email: string; createdAt: string };

export default function Users() {
  const [users, setUsers] = useState<UiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.list();
      setUsers(res.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h1>
        <button onClick={load} className="px-3 py-2 rounded bg-black text-white dark:bg-white dark:text-black">Refresh</button>
      </div>

      {loading && <div className="text-gray-600 dark:text-gray-300">Loading...</div>}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

      {!loading && !error && (
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-600 dark:text-gray-300">
            <tr>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-white">
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">{u.id}</td>
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4">
                  <button onClick={() => handleDelete(u.id)} className="px-2 py-1 rounded bg-red-600 text-white">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="py-4 pr-4" colSpan={5}>No users.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
