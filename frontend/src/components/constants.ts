// components/constants.ts  — RUNTIME VALUES ONLY

export const API = "http://localhost:3000/api";

export const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition";

export const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition cursor-pointer";

export const fmtCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

export const INTERVAL_LABEL: Record<string, string> = {
  monthly: "/mo",
  yearly: "/yr",
  "one-time": " one-time",
};

export const INTERVAL_COLOR: Record<string, string> = {
  monthly: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  yearly: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  "one-time": "bg-amber-500/10 text-amber-300 border border-amber-500/20",
};