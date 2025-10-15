"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";

export default function CustomerAuth() {
  const [tab, setTab] = useState<'signup'|'login'>('signup');
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4 md:px-6">
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white,transparent)] opacity-40">
        <div className="absolute -top-32 -left-32 h-80 w-80 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marketing panel */}
        <div className="hidden lg:flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src="/brand/logo.svg" alt="QSTEEL" className="h-10 w-10" />
              <h1 className="text-2xl font-semibold tracking-tight">QSTEEL Customer Portal</h1>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight">
              Put logistics on <span className="text-brand-green">autopilot</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-slate-300 max-w-md">
              Create an account to place orders, track deliveries, and receive real-time updates. Built for speed and clarity.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-200/90">
              <li className="flex items-start gap-2"><span className="mt-0.5 h-2 w-2 rounded-full bg-brand-green" /> Live order & delivery status</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 h-2 w-2 rounded-full bg-brand-green" /> Smart notifications and OTP sign-in</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 h-2 w-2 rounded-full bg-brand-green" /> Secure, enterprise-ready platform</li>
            </ul>
          </div>
          <div className="text-xs text-slate-400">
            By continuing, you agree to our <button type="button" className="underline hover:text-slate-200">Terms</button> & <button type="button" className="underline hover:text-slate-200">Privacy</button>.
          </div>
        </div>
        {/* Auth card */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8 text-slate-100 ring-1 ring-white/10">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">{tab==='signup'?'Create your account':'Welcome back'}</h2>
                <p className="mt-1 text-xs text-slate-300">Access orders, invoices, and live shipment updates</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1 text-sm">
                <button
                  className={`rounded-lg px-3 py-2 transition ${tab==='signup' ? 'bg-brand-green text-black font-semibold shadow' : 'hover:bg-white/5 text-slate-200'}`}
                  onClick={()=>setTab('signup')}
                >
                  Sign up
                </button>
                <button
                  className={`rounded-lg px-3 py-2 transition ${tab==='login' ? 'bg-brand-green text-black font-semibold shadow' : 'hover:bg-white/5 text-slate-200'}`}
                  onClick={()=>setTab('login')}
                >
                  Sign in
                </button>
              </div>
              <div className="mt-6">
                {tab==='signup' ? <SignupForm /> : <LoginForm />}
              </div>
            </div>
            <p className="mt-6 text-center text-[10px] text-slate-500">Secure by design • OTP Ready • 99.9% Uptime SLA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupForm() {
  const Toast = useToast();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "", password: "" });
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const err = (k: string) => errors?.[k];

  const onSubmit = async (e: any) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try {
      const r = await fetch(withBase('/auth/customer/signup'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors||{}); Toast.push({ text: 'Please fix the highlighted fields.', tone: 'error' }); return; }
      if (!r.ok) throw new Error(j.error||'Signup failed');
      setOtpStage(true);
      Toast.push({ text: 'OTP sent. Check your email.', tone: 'success' });
    } catch (e:any) { Toast.push({ text: e.message||'Failed', tone: 'error' }); }
    finally { setLoading(false); }
  };

  const onVerify = async () => {
    setLoading(true); setErrors({});
    try {
      const r = await fetch(withBase('/auth/customer/verify-signup'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, otp }) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors||{}); Toast.push({ text: 'Please check your OTP/email.', tone: 'error' }); return; }
      if (r.status === 401 || r.status === 410) { setErrors({ otp: j.error || 'Invalid or expired OTP' }); Toast.push({ text: j.error||'Invalid or expired OTP', tone: 'error' }); return; }
      if (!r.ok) throw new Error(j.error||'Verification failed');
  localStorage.setItem('token', j.token);
  Toast.push({ text: 'Welcome aboard!', tone: 'success' });
  location.href = '/customer/dashboard';
    } catch (e:any) { Toast.push({ text: e.message||'Failed', tone: 'error' }); }
    finally { setLoading(false); }
  };
  const onResend = async () => {
    setLoading(true); setErrors({});
    try {
      const r = await fetch(withBase('/auth/customer/request-otp'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors||{}); Toast.push({ text: 'Please correct your email.', tone: 'error' }); return; }
      if (!r.ok) throw new Error(j.error||'Failed to resend OTP');
      Toast.push({ text: 'OTP resent. Check your email.', tone: 'success' });
    } catch (e:any) { Toast.push({ text: e.message||'Failed', tone: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {!otpStage ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {['name','company','email','phone','gstin','password'].map((k)=> (
            <div key={k} className="grid gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-300">{k}</label>
              <input
                type={k==='password'?'password': k==='email'?'email':'text'}
                required={k!=='gstin'}
                className={`rounded-xl border px-4 py-2.5 text-sm bg-white/5 border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 ${err(k)?'!border-red-500/60 ring-2 ring-red-500/30':''}`}
                value={(form as any)[k]}
                onChange={e=>setForm({...form, [k]: e.target.value})}
                aria-invalid={!!err(k)}
              />
              {err(k) && <p className="text-xs text-red-400">{err(k)}</p>}
            </div>
          ))}
          <button disabled={loading} className="w-full rounded-xl bg-brand-green text-black px-4 py-3 font-semibold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 disabled:opacity-60 disabled:cursor-not-allowed transition">{loading?'Please wait…':'Sign up'}</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-300">Enter 6-digit OTP sent to {form.email}</label>
            <div className="mt-1 flex items-center gap-3">
              <input className={`rounded-xl border px-4 py-2.5 w-40 text-sm bg-white/5 border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 ${err('otp')?'!border-red-500/60 ring-2 ring-red-500/30':''}`} maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))} />
              <button type="button" disabled={loading} onClick={onResend} className="text-xs underline opacity-80 hover:opacity-100">Resend OTP</button>
            </div>
            {err('otp') && <p className="text-xs text-red-400 mt-1">{err('otp')}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button disabled={loading} onClick={onVerify} className="rounded-xl bg-brand-green text-black px-4 py-2.5 font-semibold shadow hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition">{loading?'Verifying…':'Verify & Continue'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const Toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const err = (k: string) => errors?.[k];

  const sendOtp = async () => {
    setLoading(true); setErrors({});
    try {
      const r = await fetch(withBase('/auth/customer/request-otp'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors||{}); Toast.push({ text: 'Fix email and try again.', tone: 'error' }); return; }
      if (!r.ok) throw new Error(j.error||'Failed to send OTP');
      Toast.push({ text: 'OTP sent. Check email.', tone: 'success' });
    } catch (e:any) { Toast.push({ text: e.message||'Failed', tone: 'error' }); }
    finally { setLoading(false); }
  };

  const onLogin = async (e:any) => {
    e.preventDefault(); setLoading(true); setErrors({});
    try {
      const body:any = { email }; if (otp) body.otp = otp; else if (password) body.password = password;
      const r = await fetch(withBase('/auth/customer/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors||{}); Toast.push({ text: j.errors?.form || 'Please fix errors.', tone: 'error' }); return; }
      if (!r.ok) throw new Error(j.error||'Login failed');
  localStorage.setItem('token', j.token);
  Toast.push({ text: 'Signed in', tone: 'success' });
  location.href = '/customer/dashboard';
    } catch (e:any) { Toast.push({ text: e.message||'Failed', tone: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onLogin} className="space-y-4">
      <div className="grid gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-300">Email</label>
        <input type="email" className={`rounded-xl border px-4 py-2.5 text-sm bg-white/5 border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 ${err('email')?'!border-red-500/60 ring-2 ring-red-500/30':''}`} value={email} onChange={e=>setEmail(e.target.value)} required />
        {err('email') && <p className="text-xs text-red-400">{err('email')}</p>}
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-300">Password</label>
        <input type="password" className={`rounded-xl border px-4 py-2.5 text-sm bg-white/5 border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 ${err('password')?'!border-red-500/60 ring-2 ring-red-500/30':''}`} value={password} onChange={e=>setPassword(e.target.value)} />
        {err('password') && <p className="text-xs text-red-400">{err('password')}</p>}
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-300">Or OTP</label>
        <div className="flex items-center gap-2">
          <input maxLength={6} className={`rounded-xl border px-4 py-2.5 w-28 text-sm bg-white/5 border-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 ${err('otp')?'!border-red-500/60 ring-2 ring-red-500/30':''}`} value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))} />
          <button type="button" disabled={loading||!email} onClick={sendOtp} className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed">Send OTP</button>
        </div>
        {err('otp') && <p className="text-xs text-red-400">{err('otp')}</p>}
        {err('form') && <p className="text-xs text-red-400">{err('form')}</p>}
      </div>
      <button disabled={loading} className="w-full rounded-xl bg-brand-green text-black px-4 py-3 font-semibold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 disabled:opacity-60 disabled:cursor-not-allowed transition">{loading?'Signing in…':'Sign in'}</button>
    </form>
  );
}
