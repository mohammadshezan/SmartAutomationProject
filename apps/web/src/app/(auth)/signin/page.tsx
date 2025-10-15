"use client";
import { withBase } from "@/lib/config";
import { API_URL } from "@/lib/config";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { push } = useToast();

  const requestOtp = async () => {
    setError("");
    if (!email) {
      const msg = 'Enter your email first';
      setError(msg); push({ text: msg, tone: 'error' });
      return;
    }
    try {
      setSending(true);
  const isDemoReq = /@sail\.test$/i.test(email);
  const otpPath = isDemoReq ? "/auth/request-otp" : "/auth/customer/request-otp";
  // Prefer same-origin proxy first to avoid CORS and port drift; then fallback to direct backend
      let r = await fetch(`/api${otpPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Fallback to direct backend if proxy failed to reach server
      if (!r.ok && (r.status === 502 || r.status === 0)) {
        r = await fetch(withBase(otpPath), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      }
      const data = await r.json().catch(() => ({} as any));
      if (!r.ok) throw new Error(data?.error || `Failed to send OTP (${r.status})`);
      // If backend indicates email delivery disabled, show a helpful hint
      const msg: string = (data?.message as string) || '';
      const isDemo = /@sail\.test$/i.test(email);
      if (msg.toLowerCase().includes('email delivery disabled')) {
  const hint = isDemo ? ' Use OTP 123456 for demo users.' : '';
  push({ text: `OTP generated. ${hint}`.trim(), tone: 'info' });
        if (isDemo) setOtp('123456');
      } else {
        push({ text: 'OTP sent to your email. Please check your inbox.', tone: 'success' });
      }
    } catch (e: any) {
      const msg = e?.message || 'Failed to send OTP';
      setError(msg); push({ text: msg, tone: 'error' });
    } finally {
      setSending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Resolve API URL (fallback to local dev if not configured)
    const isDemoLogin = /@sail\.test$/i.test(email);
    const loginPath = isDemoLogin ? "/auth/login" : "/auth/customer/login";
    try {
      setLoading(true);
      // Try same-origin proxy first
      let r = await fetch(`/api${loginPath}`, {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      // If proxy failed (bad gateway), fallback to direct backend
      if (!r.ok && (r.status === 502 || r.status === 0)) {
        r = await fetch(withBase(loginPath), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
      }
      let data: any = null;
      if (r.headers.get('content-type')?.includes('application/json')) {
        data = await r.json().catch(() => null);
      } else {
        const txt = await r.text().catch(() => '');
        data = txt ? { error: txt } : null;
      }
      if (!r.ok) {
        const errMsg = (data && (data.error || data.message)) || `Login failed (${r.status})`;
        throw new Error(r.status === 401 ? 'Invalid OTP, please try again.' : errMsg);
      }
      localStorage.setItem("token", data.token);
      try {
        if (data?.user?.role) {
          const roleKey = `token:${String(data.user.role).toLowerCase()}`;
          localStorage.setItem(roleKey, data.token);
        }
      } catch {}
      push({ text: 'Signed in', tone: 'success' });
  const role = (data?.user?.role || (isDemoLogin ? '' : 'customer')).toLowerCase();
      const redirect = role === 'admin' ? '/admin/constraints'
        : role === 'manager' ? '/reports/production-alignment'
        : role === 'cmo' ? '/cmo/dashboard'
        : role === 'yard' ? '/yard/wagon-health'
        : role === 'customer' ? '/customer-dashboard'
        : '/dashboard';
      window.location.href = redirect;
    } catch (e: any) {
      const msg = e?.message?.includes('Failed to fetch')
        ? `Network error: unable to reach authentication service`
        : e?.message || 'Login failed';
      setError(msg);
      push({ text: msg, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-black/30 backdrop-blur-sm border border-blue-400/20 p-6 rounded-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Access Platform</h2>
          <p className="text-blue-200 text-xs">Secure OTP-based sign in</p>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <p className="text-xs text-gray-400">API base: {API_URL || '(not set)'}
            {(!API_URL) && ' — set NEXT_PUBLIC_API_URL or use npm run dev-win'}
          </p>
        )}
        <div>
          <label className="text-sm text-blue-200">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@sail.test" className="mt-1 w-full rounded-md bg-slate-900/60 border border-blue-400/20 p-3 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div>
          <label className="text-sm text-blue-200">OTP</label>
          <div className="mt-1 flex gap-2">
            <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6-digit code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="flex-1 rounded-md bg-slate-900/60 border border-blue-400/20 p-3 text-white tracking-widest placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            <button type="button" onClick={requestOtp} disabled={sending} className="whitespace-nowrap rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow px-4">
              {sending ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
          <p className="text-xs text-blue-300 mt-1">Use role emails (admin@sail.test, manager@sail.test, cmo@sail.test, yard@sail.test) or customer+name@sail.test. OTP expires in 5 minutes.</p>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 font-medium shadow">
          {loading? 'Signing in…':'Continue'}
        </button>
      </form>
    </main>
  );
}
