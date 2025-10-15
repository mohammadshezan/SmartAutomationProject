"use client";
import Guard from "@/components/Guard";
import { useEffect, useState } from "react";

type Ticket = { id: string; subject: string; message: string; status: 'OPEN'|'IN_PROGRESS'|'RESOLVED'; createdAt: string };

const STORAGE_KEY = 'customer:tickets:v1';

export default function CustomerSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<'ALL'|'OPEN'|'IN_PROGRESS'|'RESOLVED'>('ALL');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTickets(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next: Ticket[]) => {
    setTickets(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const createTicket = (e: any) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const t: Ticket = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      subject: subject.trim(),
      message: message.trim(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    save([t, ...tickets]);
    setSubject(""); setMessage("");
  };

  const updateStatus = (id: string, status: Ticket['status']) => {
    const next = tickets.map(t => t.id===id? { ...t, status } : t);
    save(next);
  };

  const items = tickets.filter(t => filter==='ALL' || t.status===filter);

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Support / Helpdesk</h1>
          <p className="text-sm text-gray-400">Raise tickets or chat with support</p>
        </header>

        <section className="rounded border border-white/10 p-4">
          <h2 className="font-medium mb-3">Create a Ticket</h2>
          <form onSubmit={createTicket} className="space-y-3">
            <div className="grid gap-1">
              <label className="text-sm">Subject</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="bg-black/30 border border-white/10 rounded px-3 py-2" placeholder="e.g., Invoice discrepancy" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Message</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className="bg-black/30 border border-white/10 rounded px-3 py-2" placeholder="Describe your issue..." />
            </div>
            <button className="rounded bg-brand-green text-black px-4 py-2">Submit</button>
          </form>
        </section>

        <section className="rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Your Tickets</h2>
            <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="text-sm bg-black/30 border border-white/10 rounded px-2 py-1">
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          {items.length===0 ? (
            <div className="text-sm text-gray-400">No tickets yet.</div>
          ) : (
            <ul className="space-y-3">
              {items.map(t => (
                <li key={t.id} className="rounded border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm opacity-90 mt-1 whitespace-pre-wrap">{t.message}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className={
                      t.status==='RESOLVED' ? 'text-green-300' : t.status==='IN_PROGRESS' ? 'text-yellow-300' : 'text-blue-300'
                    }>{t.status.replace('_',' ')}</span>
                    <span className="opacity-60">·</span>
                    <button onClick={()=>updateStatus(t.id,'OPEN')} className="underline opacity-80 hover:opacity-100">Open</button>
                    <button onClick={()=>updateStatus(t.id,'IN_PROGRESS')} className="underline opacity-80 hover:opacity-100">In Progress</button>
                    <button onClick={()=>updateStatus(t.id,'RESOLVED')} className="underline opacity-80 hover:opacity-100">Resolved</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Guard>
  );
}
