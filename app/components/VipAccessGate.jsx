'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Lock, ShieldCheck, X } from 'lucide-react';

const VIP_STORAGE_KEY = 'livewire:amg_vip:v1';

export function useVipAccess() {
  const [vipState, setVipState] = useState({ unlocked: false, tier: null, perks: [] });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIP_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.unlocked) setVipState(parsed);
    } catch {
      // Ignore unavailable storage
    }
  }, []);

  const unlockVip = useCallback((payload) => {
    const next = {
      unlocked: true,
      tier: payload?.tier || 'AMG_VIP',
      perks: Array.isArray(payload?.perks) ? payload.perks : ['multi_view', 'custom_themes', 'fast_pass'],
      verifiedAt: payload?.verifiedAt || new Date().toISOString(),
    };
    setVipState(next);
    try {
      window.localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const lockVip = useCallback(() => {
    setVipState({ unlocked: false, tier: null, perks: [] });
    try {
      window.localStorage.removeItem(VIP_STORAGE_KEY);
    } catch {}
  }, []);

  return { ...vipState, unlockVip, lockVip };
}

export default function VipAccessGate({ open, onClose, unlocked, onUnlocked, onLock }) {
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Enter your AMG VIP access token.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/vip/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Verification failed.');
      } else {
        onUnlocked?.(data);
        setToken('');
        onClose?.();
      }
    } catch {
      setError('Unable to reach VIP verification endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AMG VIP Access Gate"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0e1017] border border-amber-500/30 p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">AMG VIP Access Gate</h2>
              <p className="text-xs text-gray-400">Multi-View · Custom Themes · Fast Pass · +EV Alerts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close VIP modal"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {unlocked ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
              <ShieldCheck className="w-4 h-4" /> AMG VIP Active
            </div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 2-Screen Multi-View unlocked</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom Obsidian/Neon themes unlocked</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Studio Webtoon Fast Pass unlocked</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                onLock?.();
                onClose?.();
              }}
              className="w-full min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200"
            >
              Lock VIP Session
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Access Token
              </span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter AMG VIP token…"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white outline-none focus:border-amber-400"
              />
            </label>
            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              {submitting ? 'Verifying…' : 'Unlock AMG VIP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
