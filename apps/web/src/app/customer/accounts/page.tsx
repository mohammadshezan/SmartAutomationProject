"use client";
import Guard from "@/components/Guard";
import { useEffect, useMemo, useState } from "react";

type SubUser = { id: string; name: string; email: string; role: 'Viewer'|'Order Manager'|'Finance' };
const STORAGE_KEY = 'customer:subusers:v1';

export default function CustomerAccounts() {
  const [users, setUsers] = useState<SubUser[]>([]);
  const [form, setForm] = useState<Omit<SubUser,'id'>>({ name: '', email: '', role: 'Viewer' });
  const [q, setQ] = useState('');

  useEffect(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setUsers(JSON.parse(raw)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); } catch {} }, [users]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase(); if (!t) return users;
    return users.filter(u => [u.name,u.email,u.role].some(v => String(v).toLowerCase().includes(t)));
  }, [users,q]);

  const add = () => {
    if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return;
    const id = Math.random().toString(36).slice(2,8).toUpperCase();
    setUsers(prev => [{ id, ...form }, ...prev]);
    setForm({ name: '', email: '', role: 'Viewer' });
  };
  const remove = (id: string) => setUsers(prev => prev.filter(x => x.id !== id));

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Multi-User Accounts</h1>
        <section className="rounded border border-white/10 p-4 space-y-3">
          <h2 className="font-medium">Add Sub-user</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-1">
              <label className="text-sm">Name</label>
              <input value={form.name} onChange={(e)=> setForm({...form, name: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Email</label>
              <input value={form.email} onChange={(e)=> setForm({...form, email: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Role</label>
              <select value={form.role} onChange={(e)=> setForm({...form, role: e.target.value as any})} className="bg-black/30 border border-white/10 rounded px-3 py-2">
                <option>Viewer</option>
                <option>Order Manager</option>
                <option>Finance</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={add} className="rounded bg-brand-green text-black px-3 py-2">Invite</button>
            <button type="button" onClick={()=> setForm({ name: '', email: '', role: 'Viewer' })} className="rounded border border-white/20 px-3 py-2">Reset</button>
          </div>
        </section>
        <section className="rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Team Members</h2>
            <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/10 rounded px-3 py-1 text-sm" />
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-white/60">No members yet.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => (
                <div key={u.id} className="rounded border border-white/10 p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.name} <span className="text-xs text-white/50">({u.role})</span></div>
                    <div className="text-white/60 text-sm">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=> remove(u.id)} className="rounded border border-white/20 px-3 py-1 text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Guard>
  );
}
