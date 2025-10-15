import { NextRequest } from 'next/server';
import { API_URL } from '@/lib/config';

// Dedicated handler for /api/auth/login that forwards directly to the backend
// to avoid any chance of self-proxy loops.
export async function POST(request: NextRequest) {
  const configured = (API_URL || '').replace(/\/$/, '');
  const isProd = process.env.NODE_ENV === 'production';
  const bases: string[] = [];
  if (configured) bases.push(configured);
  if (!isProd) {
    [5001, 5002, 5003, 4000].forEach(p => bases.push(`http://localhost:${p}`));
    [5001, 5002].forEach(p => bases.push(`http://127.0.0.1:${p}`));
  }
  const seen = new Set<string>();
  const targets = bases.filter(b => { const k = b.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

  const body = await request.arrayBuffer();
  const headers = new Headers(request.headers);
  headers.delete('host'); headers.delete('content-length'); headers.delete('connection');

  const withTimeout = async (u: string, ms = 5000) => {
    const c = new AbortController(); const t = setTimeout(()=>c.abort(), ms);
    try { return await fetch(u, { method: 'POST', headers, body, signal: c.signal, redirect: 'manual', cache: 'no-store' }); }
    finally { clearTimeout(t); }
  };

  let lastErr: any = null;
  for (const base of targets) {
    const url = `${base.replace(/\/$/,'')}/auth/login`;
    try {
      const resp = await withTimeout(url);
      return new Response(resp.body, { status: resp.status, headers: resp.headers });
    } catch (e) { lastErr = e; }
  }
  return new Response(JSON.stringify({ error: lastErr?.message || 'auth_login_forward_failed', tried: targets }), { status: 502, headers: { 'content-type':'application/json' } });
}