"use client";
import { useEffect, useState } from "react";

type Role = 'admin'|'manager'|'yard'|'customer'|'cmo'|'crew'|'supervisor';

function decodeRole(t?: string | null): Role | undefined {
  if (!t) return undefined;
  try {
    const payload = JSON.parse(atob(String(t).split('.')[1] || ''));
    const r = String(payload?.role || '').toLowerCase();
    return (r as Role) || undefined;
  } catch { return undefined; }
}

export default function Guard({ allow, children }: { allow: Array<Role>; children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean>(false);
  useEffect(() => {
    try {
      // Check common token locations and role-specific tokens to allow multiple roles in parallel tabs
      const keys = [
        'token',
        'authToken',
        'token:admin', 'token:manager', 'token:yard', 'token:customer', 'token:cmo', 'token:crew', 'token:supervisor'
      ];
      const tokens = keys.map(k => localStorage.getItem(k)).filter(Boolean) as string[];
      // Also scan localStorage for any token:* keys (future-proof)
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.startsWith('token:')) {
            const v = localStorage.getItem(k);
            if (v) tokens.push(v);
          }
        }
      } catch {}
      const roles = tokens.map(decodeRole).filter(Boolean) as Role[];
      const allowed = roles.some(r => r === 'admin' || allow.includes(r));
      setOk(allowed);
    } catch {
      setOk(false);
    }
  }, [allow]);
  if (!ok) return <div className="p-6">Access denied. Please sign in with proper role.</div>;
  return <>{children}</>;
}
