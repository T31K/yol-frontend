'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STORAGE_KEY = 'yol_admin_secret';

type Request = {
  id: number;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSecret(stored);
      fetchRequests(stored);
    }
  }, []);

  async function fetchRequests(token: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/yol/admin/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setError('Invalid secret.');
        localStorage.removeItem(STORAGE_KEY);
        setAuthed(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRequests(data);
      setAuthed(true);
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      setError('Could not reach server.');
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/yol/admin/requests/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch {
      setError('Failed to update.');
    }
    setUpdating(null);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setSecret('');
    setRequests([]);
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const done = requests.filter((r) => r.status === 'done');
  const dismissed = requests.filter((r) => r.status === 'dismissed');

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="border-2 border-white bg-black p-8 w-full max-w-sm">
          <h1 className="text-white font-black text-2xl mb-6">YOL Admin</h1>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRequests(secret)}
            className="w-full border-2 border-white bg-black text-white px-3 py-2 font-mono text-sm mb-4 outline-none"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            onClick={() => fetchRequests(secret)}
            disabled={loading || !secret}
            className="w-full bg-white text-black font-black py-2 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </div>
      </div>
    );
  }

  function RequestCard({ req }: { req: Request }) {
    return (
      <div className="border-2 border-white p-4 mb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-xs text-gray-400 font-mono">#{req.id}</span>
            <p className="text-white mt-1">{req.message}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {req.status !== 'done' && (
              <button
                onClick={() => updateStatus(req.id, 'done')}
                disabled={updating === req.id}
                className="bg-green-500 text-black font-black text-xs px-3 py-1 disabled:opacity-50"
              >
                Done
              </button>
            )}
            {req.status !== 'dismissed' && (
              <button
                onClick={() => updateStatus(req.id, 'dismissed')}
                disabled={updating === req.id}
                className="bg-red-500 text-black font-black text-xs px-3 py-1 disabled:opacity-50"
              >
                Dismiss
              </button>
            )}
            {req.status !== 'pending' && (
              <button
                onClick={() => updateStatus(req.id, 'pending')}
                disabled={updating === req.id}
                className="border border-white text-white font-black text-xs px-3 py-1 disabled:opacity-50"
              >
                Pending
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-2xl">YOL Admin</h1>
        <div className="flex gap-3 items-center">
          <button onClick={() => fetchRequests(secret)} className="text-sm text-gray-400 hover:text-white">
            Refresh
          </button>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <section className="mb-8">
        <h2 className="font-black text-lg mb-3 flex items-center gap-2">
          Pending <span className="bg-yellow-400 text-black text-xs px-2 py-0.5">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending requests.</p>
        ) : (
          pending.map((r) => <RequestCard key={r.id} req={r} />)
        )}
      </section>

      {done.length > 0 && (
        <section className="mb-8">
          <h2 className="font-black text-lg mb-3 text-gray-400">Done ({done.length})</h2>
          {done.map((r) => <RequestCard key={r.id} req={r} />)}
        </section>
      )}

      {dismissed.length > 0 && (
        <section>
          <h2 className="font-black text-lg mb-3 text-gray-400">Dismissed ({dismissed.length})</h2>
          {dismissed.map((r) => <RequestCard key={r.id} req={r} />)}
        </section>
      )}
    </div>
  );
}
