"use client";
import Guard from "@/components/Guard";
import { useEffect, useMemo, useState } from "react";

type Template = { id: string; name: string; cargo: string; quantityTons: number; destination: string; priority: 'Normal'|'Urgent'; notes?: string };
const STORAGE_KEY = 'customer:templates:v1';

export default function SavedTemplates() {
  const [items, setItems] = useState<Template[]>([]);
  const [form, setForm] = useState<Omit<Template, 'id'>>({ name: '', cargo: 'SAIL TMT BARS', quantityTons: 100, destination: '', priority: 'Normal', notes: '' });
  const [q, setQ] = useState('');

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }, [items]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase(); if (!t) return items;
    return items.filter(i => [i.name,i.cargo,i.destination,i.priority].some(v => String(v).toLowerCase().includes(t)));
  }, [items,q]);

  const add = () => {
    if (!form.name.trim()) return;
    const id = Math.random().toString(36).slice(2,8).toUpperCase();
    setItems(prev => [{ id, ...form }, ...prev]);
    setForm({ name: '', cargo: form.cargo, quantityTons: 100, destination: '', priority: 'Normal', notes: '' });
  };
  const remove = (id: string) => setItems(prev => prev.filter(x => x.id !== id));
  const useTemplate = (t: Template) => {
    // Persist a transient handoff for the new order page to pick up
    try { localStorage.setItem('customer:newOrder:prefill', JSON.stringify({ cargo: t.cargo, quantityTons: t.quantityTons, destination: t.destination, priority: t.priority, notes: t.notes||'' })); } catch {}
    location.href = '/customer/orders/new';
  };

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Saved Templates</h1>
        <section className="rounded border border-white/10 p-4 space-y-3">
          <h2 className="font-medium">Create Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm">Template Name</label>
              <input value={form.name} onChange={(e)=> setForm({...form, name: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2" placeholder="e.g., 100t TMT to Durgapur" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Cargo</label>
              <select value={form.cargo} onChange={(e)=> setForm({...form, cargo: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2">
                {['SAIL TMT BARS','SAIL SeQR TMT Bars','Wire Rods','Plates','Stainless Steel Products','Pipes','Cold Rolled Products','Hot Rolled Products','Galvanised Products','Structurals','Semis','Pig Iron','Railway Products','Electrical Steels','Wheels and Axles'].sort((a,b)=> a.localeCompare(b)).map(m => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Quantity (t)</label>
              <input type="number" min={10} step={10} value={form.quantityTons} onChange={(e)=> setForm({...form, quantityTons: Math.max(0, Number(e.target.value||0))})} className="bg-black/30 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Destination</label>
              <input value={form.destination} onChange={(e)=> setForm({...form, destination: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2" placeholder="City, State - PIN" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Priority</label>
              <select value={form.priority} onChange={(e)=> setForm({...form, priority: e.target.value as any})} className="bg-black/30 border border-white/10 rounded px-3 py-2">
                <option>Normal</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="grid gap-1 md:col-span-2">
              <label className="text-sm">Notes</label>
              <textarea value={form.notes} onChange={(e)=> setForm({...form, notes: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 min-h-[60px]" placeholder="Special instructions" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={add} className="rounded bg-brand-green text-black px-3 py-2">Save Template</button>
            <button type="button" onClick={()=> setForm({ name: '', cargo: 'SAIL TMT BARS', quantityTons: 100, destination: '', priority: 'Normal', notes: '' })} className="rounded border border-white/20 px-3 py-2">Reset</button>
          </div>
        </section>

        <section className="rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Your Templates</h2>
            <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/10 rounded px-3 py-1 text-sm" />
          </div>
          {filtered.length === 0 ? (
            <div className="text-sm text-white/60">No templates yet.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(t => (
                <div key={t.id} className="rounded border border-white/10 p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-white/60 text-sm">{t.cargo} × {t.quantityTons}t → {t.destination} · {t.priority}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=> useTemplate(t)} className="rounded bg-brand-green text-black px-3 py-1 text-sm">Use</button>
                    <button onClick={()=> remove(t.id)} className="rounded border border-white/20 px-3 py-1 text-sm">Delete</button>
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
