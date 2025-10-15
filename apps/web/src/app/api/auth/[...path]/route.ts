import { API_URL } from "@/lib/config";

// Proxy any /api/auth/* request from the Next.js app to the backend API
// Adds robust fallbacks across common localhost ports to avoid dev flakiness.
async function proxy(req: Request, ctx: { params: { path?: string[] } }) {
  const segments = Array.isArray(ctx.params?.path) ? ctx.params!.path : [];
  const urlIn = new URL(req.url);
  // Prevent accidental self-proxy loop for the specific login route
  if (segments.length === 1 && segments[0] === 'login') {
    // Delegate to the dedicated /api/auth/login handler
    const res = await fetch(`${urlIn.origin}/api/auth/login${urlIn.search || ''}`, {
      method: req.method,
      headers: req.headers,
      body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : await req.arrayBuffer(),
      redirect: 'manual'
    });
    return new Response(res.body, { status: res.status, headers: res.headers });
  }
  const search = urlIn.search ? urlIn.search : "";

  const configured = (API_URL || "").replace(/\/$/, "");
  const isProd = process.env.NODE_ENV === "production";
  const bases: string[] = [];
  if (configured) bases.push(configured);
  if (!isProd) {
    // Helpful localhost fallbacks for dev
    [5001, 5002, 5003, 4000].forEach(p => bases.push(`http://localhost:${p}`));
    [5001, 5002].forEach(p => bases.push(`http://127.0.0.1:${p}`));
  }
  // De-duplicate while preserving order
  const seen = new Set<string>();
  const targets = bases.filter(b => { const k = b.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

  // Prepare request init with reusable body
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  const bodyBuffer = (req.method === "GET" || req.method === "HEAD") ? undefined : await req.arrayBuffer();

  // Small timeout helper
  const withTimeout = async (input: RequestInfo | URL, init: RequestInit, ms = 5000) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    try { return await fetch(input, { ...init, signal: c.signal, cache: "no-store", redirect: "manual" }); }
    finally { clearTimeout(t); }
  };

  let lastErr: any = null;
  for (const base of targets) {
    const baseClean = base.replace(/\/$/, "");
    const targetUrl = `${baseClean}/auth/${segments.map(encodeURIComponent).join('/')}${search}`;
    try {
      const resp = await withTimeout(targetUrl, { method: req.method, headers, body: bodyBuffer });
      // Return first response even if it's an error status (propagate backend error)
      const respHeaders = new Headers(resp.headers);
      return new Response(resp.body, { status: resp.status, headers: respHeaders });
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  const message = lastErr?.message || "All proxy targets failed";
  return new Response(JSON.stringify({ error: message, tried: targets }), {
    status: 502,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(req: Request, ctx: any) { return proxy(req, ctx); }
export async function POST(req: Request, ctx: any) { return proxy(req, ctx); }
export async function PUT(req: Request, ctx: any) { return proxy(req, ctx); }
export async function PATCH(req: Request, ctx: any) { return proxy(req, ctx); }
export async function DELETE(req: Request, ctx: any) { return proxy(req, ctx); }
export async function OPTIONS(req: Request, ctx: any) { return proxy(req, ctx); }
