"use client";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { useMemo, useState, useCallback, useEffect } from "react";
import { withBase } from "@/lib/config";

// Material display metadata derived from seeded dataset; safe fallbacks included
const materialMeta: Record<string, { title: string; blurb: string; emoji: string }> = {
  'SAIL TMT BARS': { title: 'SAIL TMT Bars', blurb: 'High-strength rebars for construction', emoji: '🏗️' },
  'SAIL SeQR TMT Bars': { title: 'SAIL SeQR TMT Bars', blurb: 'Seismic-resistant TMT series', emoji: '🧱' },
  'Wire Rods': { title: 'Wire Rods', blurb: 'Multi-use rods for fasteners and meshes', emoji: '🧵' },
  'Plates': { title: 'Plates', blurb: 'Structural plates for fabrication', emoji: '📐' },
  'Stainless Steel Products': { title: 'Stainless Steel', blurb: 'Corrosion-resistant grades', emoji: '✨' },
  'Pipes': { title: 'Pipes', blurb: 'ERW/Seamless pipes for utilities', emoji: '🧪' },
  'Wheels and Axles': { title: 'Wheels & Axles', blurb: 'Precision-forged railway components', emoji: '🚆' },
  'Cold Rolled Products': { title: 'Cold Rolled', blurb: 'CR coils/sheets for fine finishes', emoji: '❄️' },
  'Hot Rolled Products': { title: 'Hot Rolled', blurb: 'HR coils and sheets', emoji: '🔥' },
  'Galvanised Products': { title: 'Galvanised', blurb: 'Zinc-coated corrosion resistance', emoji: '🛡️' },
  'Electrical Steels': { title: 'Electrical Steels', blurb: 'Silicon steels for transformers', emoji: '⚡' },
  'Structurals': { title: 'Structurals', blurb: 'Angles, channels, beams', emoji: '🏗️' },
  'Semis': { title: 'Semis', blurb: 'Semi-finished for re-rolling', emoji: '🧱' },
  'Pig Iron': { title: 'Pig Iron', blurb: 'Hot metal for foundries', emoji: '🔩' },
  'Railway Products': { title: 'Railway Products', blurb: 'Rails and accessories', emoji: '🛤️' },
};

// Fallback meta for any material not in map
const getMeta = (material: string) => materialMeta[material] || { title: material, blurb: 'Steel product', emoji: '🔩' };

// Complete fallback list derived from prisma seed.js (distinct materials)
const FALLBACK_MATERIALS: string[] = [
  'Electrical Steels',
  'SAIL TMT BARS',
  'Structurals',
  'Stainless Steel Products',
  'Plates',
  'Wire Rods',
  'Hot Rolled Products',
  'Pipes',
  'Galvanised Products',
  'Wheels and Axles',
  'SAIL SeQR TMT Bars',
  'Cold Rolled Products',
  'Pig Iron',
  'Railway Products',
  'Semis',
];

const URGENT_SURCHARGE_RATE = 0.05; // 5% est. surcharge for urgent

function formatINR(n?: number) {
  if (typeof n !== 'number' || isNaN(n)) return '-';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function NewOrder() {
  const Toast = useToast();
  // Dynamic materials fetched from API; maintain quantities per material string
  const [materials, setMaterials] = useState<string[]>([]);
  type ItemQuantities = Record<string, number>;
  type FormState = { items: ItemQuantities; destination: string; priority: 'Normal'|'Urgent'; notes: string };
  const [form, setForm] = useState<FormState>({ items: {}, destination: '', priority: 'Normal', notes: '' });
  const [estimates, setEstimates] = useState<Record<string, any>>({} as any);
  const [loading, setLoading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  // Fetch distinct materials from seeded stockyards
  useEffect(() => {
    (async () => {
      setLoadingMaterials(true);
      try {
        const token = localStorage.getItem('token')||'';
        const res = await fetch(withBase('/stockyards'), { headers: { Authorization: `Bearer ${token}` } });
  const data: any = await res.json();
  let mats = Array.from(new Set<string>((Array.isArray(data) ? data : []).flatMap((s: any) => Array.isArray(s?.materials) ? (s.materials as string[]) : [])));
        if (!mats.length) {
          // If API returns no materials, fall back to seed-defined list
          mats = [...FALLBACK_MATERIALS];
        }
        mats.sort((a,b)=> a.localeCompare(b));
        setMaterials(mats as string[]);
        // Initialize first material with 100t for quick demo UX
        if (mats[0]) setForm(prev => ({ ...prev, items: { ...prev.items, [String(mats[0])]: 100 } }));
      } catch (e) {
        // graceful fallback: use the complete seed list if API not reachable
        const fallback = [...FALLBACK_MATERIALS].sort((a,b)=> a.localeCompare(b));
        setMaterials(fallback);
        setForm(prev => ({ ...prev, items: { ...prev.items, [fallback[0]]: 100 } }));
      } finally { setLoadingMaterials(false); }
    })();
  }, []);

  // Apply prefill from templates if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem('customer:newOrder:prefill');
      if (!raw) return;
      const pf = JSON.parse(raw);
      // Expect shape: { cargo, quantityTons, destination, priority, notes }
      setForm(f => ({
        ...f,
        destination: typeof pf.destination === 'string' ? pf.destination : f.destination,
        priority: pf.priority === 'Urgent' ? 'Urgent' : 'Normal',
        notes: typeof pf.notes === 'string' ? pf.notes : f.notes,
        items: typeof pf.cargo === 'string' && typeof pf.quantityTons === 'number' ? { ...f.items, [pf.cargo]: pf.quantityTons } : f.items
      }));
      // one-shot handoff
      localStorage.removeItem('customer:newOrder:prefill');
    } catch {}
  }, []);

  const selectedMaterials = useMemo(() => materials.filter(m => (form.items[m] || 0) > 0), [materials, form.items]);
  // Removed duplicate declaration
  const materialSubtotal = 0; // Material pricing removed; subtotal is not part of the calculation now
  const logistics = useMemo(() => selectedMaterials.reduce((sum, m) => sum + (estimates[m]?.cost || 0), 0), [selectedMaterials, estimates]);
  const prioritySurcharge = useMemo(() => form.priority === 'Urgent' ? Math.round((materialSubtotal + logistics) * URGENT_SURCHARGE_RATE) : 0, [form.priority, materialSubtotal, logistics]);
  const gst = useMemo(() => Math.round((materialSubtotal + logistics + prioritySurcharge) * 0.18), [materialSubtotal, logistics, prioritySurcharge]); // 18% GST (indicative)
  const totalEstimate = materialSubtotal + logistics + prioritySurcharge + gst;

  // Stepper control
  const QuantityStepper = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
    const increment = useCallback(() => onChange((value || 0) + 10), [value, onChange]);
    const decrement = useCallback(() => onChange(Math.max(0, (value || 0) - 10)), [value, onChange]);
    return (
      <div className="flex items-center gap-2 w-full">
        <button type="button" onClick={decrement} disabled={(value||0) === 0} className="px-3 py-1 text-lg font-bold bg-gray-700 text-brand-green/90 rounded-lg hover:bg-gray-600 disabled:opacity-50">-</button>
        <input type="number" min={0} value={value||0} onChange={e=> onChange(Math.max(0, Number(e.target.value||0)))} className="w-24 text-center py-1 bg-black/40 text-white rounded-lg border border-white/10 focus:border-brand-green focus:outline-none" />
        <button type="button" onClick={increment} className="px-3 py-1 text-lg font-bold bg-gray-700 text-brand-green/90 rounded-lg hover:bg-gray-600">+</button>
      </div>
    );
  };

  const getEstimate = async () => {
    if (!form.destination.trim()) { Toast.push({ text: 'Please enter destination', tone: 'error' }); return; }
    const items = selectedMaterials;
    if (!items.length) { Toast.push({ text: 'Add at least one product quantity', tone: 'error' }); return; }
    // Freight entry removed from UI; backend will use its default internal rate.
    setLoading(true);
    try {
      const token = localStorage.getItem('token')||'';
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } as any;
      const results = await Promise.all(items.map(async (m) => {
        const body = { cargo: m, quantityTons: form.items[m], sourcePlant: 'BKSC', destination: form.destination, priority: form.priority, estimateOnly: true };
        const res = await fetch(withBase('/customer/orders'), { method: 'POST', headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error||'Estimate failed');
        return { key: m as string, estimate: data.estimate };
      }));
      const map: Record<string, any> = {} as any;
      results.forEach(r => { map[r.key] = r.estimate; });
      setEstimates(map);
    } catch (e: any) { Toast.push({ text: e.message||'Failed to estimate', tone: 'error' }); }
    finally { setLoading(false); }
  };

  const placeOrder = async () => {
    if (!form.destination.trim()) { Toast.push({ text: 'Please enter destination', tone: 'error' }); return; }
    const items = selectedMaterials;
    if (!items.length) { Toast.push({ text: 'Add at least one product quantity', tone: 'error' }); return; }
    // Freight entry removed from UI; backend will use its default internal rate.
    setLoading(true);
    try {
      const token = localStorage.getItem('token')||'';
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } as any;
      const results = await Promise.all(items.map(async (m) => {
        const body = { cargo: m, quantityTons: form.items[m], sourcePlant: 'BKSC', destination: form.destination, priority: form.priority, notes: form.notes };
        const res = await fetch(withBase('/customer/orders'), { method: 'POST', headers, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error||'Order failed');
        return data.order;
      }));
      Toast.push({ text: `Created ${results.length} order(s)`, tone: 'success' });
      location.href = `/customer/orders`;
    } catch (e: any) { Toast.push({ text: e.message||'Failed to create orders', tone: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-6xl mx-auto p-6">
        <nav aria-label="Breadcrumb" className="text-sm text-white/70 mb-2">
          <ol className="flex items-center gap-2">
            <li><a href="/customer" className="hover:text-white">Customer</a></li>
            <li className="opacity-50">/</li>
            <li><a href="/customer/orders" className="hover:text-white">Orders</a></li>
            <li className="opacity-50">/</li>
            <li className="text-white">New</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-green">Place Your Order</h1>
        <p className="text-white/70 mt-1">Choose materials from the live catalog. We estimate logistics and plan optimal rakes automatically.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Materials (from API) */}
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Select Materials & Tonnage (Tons)</h2>
              {loadingMaterials ? (
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({length:4}).map((_,i)=> (
                    <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/30 animate-pulse h-20"/>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {materials.map(m => {
                    const qty = form.items[m] || 0;
                    const meta = getMeta(m);
                    return (
                      <div key={m} className={`p-4 rounded-xl transition-all border ${qty>0 ? 'border-brand-green shadow-2xl shadow-emerald-900/30 bg-gradient-to-r from-black/60 to-emerald-950/20' : 'border-white/10 bg-black/30 hover:border-brand-green/60 hover:shadow-xl hover:shadow-black/30'}`}>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="text-2xl" aria-hidden>{meta.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{meta.title}</div>
                            <div className="text-xs text-white/60">{meta.blurb}</div>
                          </div>
                          {/* Freight input removed */}
                          
                          <div className="w-44">
                            <QuantityStepper
                              value={qty}
                              onChange={(v)=> setForm({ ...form, items: { ...form.items, [m]: v } })}
                            />
                          </div>
                        </div>
                        {estimates[m] && (
                          <div className="mt-2 text-xs space-y-1">
                            <div className="text-white/70">Logistics est.: ₹{formatINR(estimates[m].cost)} · ETA: {new Date(estimates[m].eta).toLocaleString()}</div>
                            {estimates[m].tentativeStockyard ? (
                              <div className="text-white/60">
                                Tentative source: <span className="text-white">{estimates[m].tentativeStockyard.name}</span> <span className="text-white/50">({estimates[m].tentativeStockyard.location})</span>
                                {typeof estimates[m]?.availability?.availableTons === 'number' && (
                                  <>
                                    {` · Available: ${formatINR(estimates[m].availability.availableTons)}t`}
                                  </>
                                )}
                              </div>
                            ) : null}
                            {estimates[m]?.availability && estimates[m].availability.ok === false && (
                              <div className="text-red-300">Not enough inventory across yards for requested tonnage</div>
                            )}
                          </div>
                        )}
                        {qty>0 && (
                          <div className="mt-2 flex gap-2 text-xs">
                            {[0,50,100,200,300].map(n => (
                              <button key={n} type="button" className={`px-2 py-1 rounded border ${qty===n?'bg-brand-green text-black border-brand-green':'border-white/10 hover:border-brand-green/60'}`} onClick={()=> setForm({...form, items: { ...form.items, [m]: n }})}>{n}t</button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Quick actions */}
              {!loadingMaterials && (
                <div className="flex gap-2 mt-2">
                  <button type="button" className="text-xs px-2 py-1 rounded border border-white/10 hover:border-brand-green/60" onClick={()=> setForm(f=> ({...f, items: {}}))}>Clear all</button>
                  <button type="button" className="text-xs px-2 py-1 rounded border border-white/10 hover:border-brand-green/60" onClick={()=> materials[0] && setForm(f=> ({...f, items: { ...f.items, [materials[0]]: (f.items[materials[0]]||0)+50 }}))}>+50t first item</button>
                </div>
              )}
            </section>

            {/* Shipment Details Card: Destination + Priority + Special Notes */}
            <section>
              <div className="p-4 rounded-xl border border-white/10 bg-black/30">
                <h2 className="text-lg font-semibold mb-3">2. Shipment Details</h2>
                {/* Destination (CMO stockyard mention removed) */}
                <div className="grid gap-1 mb-3">
                  <label htmlFor="destination" className="text-sm">Destination</label>
                  <div className="relative">
                    <input list="destinations" id="destination" placeholder="e.g., Durgapur, WB - 713203" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 pr-9" value={form.destination} onChange={e=>setForm({...form, destination: e.target.value})} />
                    <datalist id="destinations">
                      {['Delhi','Kolkata','Patna','Mumbai','Vijayawada','Kanpur','Prayagraj','Ghaziabad','Faridabad','Jamshedpur','Rourkela','Durgapur','Bokaro','Chennai','Visakhapatnam','Salem'].map(c => (<option key={c} value={c} />))}
                    </datalist>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">📍</span>
                  </div>
                  <p className="text-xs text-white/50">Tip: Type a city name to see suggestions. We’ll compute rail-friendly routes automatically.</p>
                </div>
                {/* Priority */}
                <div className="grid gap-1 mb-3">
                  <label className="text-sm">Order Priority</label>
                  <div className="flex gap-2 bg-black/30 p-1 rounded-lg border border-white/10">
                    {(['Normal','Urgent'] as const).map(p => (
                      <button key={p} type="button" onClick={()=>setForm({...form, priority: p})}
                        className={`flex-1 px-3 py-2 rounded ${form.priority===p? 'bg-brand-green text-black shadow':'hover:bg-white/5'}`}>{p === 'Urgent' ? '🚨 Urgent (+5%)' : 'Normal'}</button>
                    ))}
                  </div>
                </div>
                {/* Notes */}
                <div className="grid gap-1">
                  <label className="text-sm">Special notes</label>
                  <textarea placeholder="Unloading constraints, preferred delivery window, etc." className="bg-black/30 border border-white/10 rounded px-3 py-2 min-h-[72px]" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button type="button" disabled={loading} onClick={getEstimate} className="rounded border border-white/20 px-4 py-2 hover:bg-white/5">Get Estimate</button>
              <button type="button" disabled={loading} onClick={placeOrder} className="rounded bg-brand-green text-black px-4 py-2">Confirm Order</button>
            </div>
            <p className="text-xs text-white/50">Prices are indicative wholesale rates. Final invoice may vary with grade/spec and market movement.</p>
          </div>

          {/* Right: Summary */}
          <aside className="lg:sticky lg:top-6 h-fit rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="text-lg font-semibold mb-3">3. Order Summary</h3>
            <div className="space-y-2 text-sm">
              {selectedMaterials.length === 0 ? (
                <div className="text-white/60">No items added yet</div>
              ) : (
                <div className="space-y-1">
                  {selectedMaterials.map(m => (
                    <div key={m} className="flex justify-between">
                      <span>{getMeta(m).title} × {form.items[m]}t</span>
                    </div>
                  ))}
                </div>
              )}
              <hr className="border-white/10 my-2" />
              {/* Material subtotal removed */}
              {/* Material subtotal removed as pricing is not shown */}
              <div className="flex justify-between"><span>Logistics (est.)</span><span>{logistics ? `₹${formatINR(logistics)}` : '—'}</span></div>
              <div className="flex justify-between text-orange-300"><span>Priority surcharge {form.priority==='Urgent' ? '(5%)' : '(0%)'}</span><span>₹{formatINR(prioritySurcharge)}</span></div>
              <div className="flex justify-between"><span>GST (18% est.)</span><span>₹{formatINR(gst)}</span></div>
              {selectedMaterials.some(m => estimates[m]) && (
                <div className="space-y-1">
                  {selectedMaterials.map(m => estimates[m] ? (
                    <div key={m} className="flex justify-between text-xs text-white/70">
                      <span>{getMeta(m).title} ETA</span><span>{new Date(estimates[m].eta).toLocaleString()}</span>
                    </div>
                  ) : null)}
                </div>
              )}
              <hr className="border-white/10 my-2" />
              <div className="flex justify-between text-base font-semibold"><span>Estimated total</span><span>₹{formatINR(totalEstimate)}</span></div>
              {/* ecoHint is per-estimate; omit or adapt if needed */}
            </div>
          </aside>
        </div>
      </div>
    </Guard>
  );
}
