import React, { useState } from "react";
import axios from "axios";
import Field from "./field";
import {
  API,
  inputCls,
  selectCls,
  fmtCurrency,
  INTERVAL_LABEL,
  INTERVAL_COLOR,
} from "./constants";
import type { Pricing } from "./types";

interface PricingSectionProps {
  planId: string;
  pricing: Pricing[];
  onPricingChanged: () => void;
}

export default function PricingSection({
  planId,
  pricing,
  onPricingChanged,
}: PricingSectionProps) {
  /* ── Create form state ── */
  const [priceAmount, setPriceAmount] = useState<string>("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [priceInterval, setPriceInterval] = useState<
    "monthly" | "yearly" | "one-time"
  >("monthly");

  /* ── Inline edit state ── */
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editInterval, setEditInterval] = useState<string>("monthly");
  // Add these two after priceInterval and editInterval states
  const [priceIntervalCount, setPriceIntervalCount] = useState<number>(1);
  const [editIntervalCount, setEditIntervalCount] = useState<number>(1);
  /* ── Create ── */
  const handleCreatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priceAmount === "") return;
    try {
      await axios.post(`${API}/pricing`, {
        planId,
        amount: parseInt(priceAmount, 10),
        currency: priceCurrency,
        interval: priceInterval,
        intervalCount: priceIntervalCount,
      });
      setPriceAmount("");
      onPricingChanged();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Start inline edit ── */
  const startEditPrice = (p: Pricing) => {
    setEditingPriceId(p.id);
    setEditAmount(String(p.amount));
    setEditCurrency(p.currency);
    setEditInterval(p.interval);
    setEditIntervalCount(p.interval_count ?? 1); // add this line
  };

  /* ── Update ── */
  const handleUpdatePricing = async (id: string) => {
    try {
      await axios.put(`${API}/pricing/${id}`, {
        amount: parseInt(editAmount, 10),
        currency: editCurrency,
        interval: editInterval,
        intervalCount: editIntervalCount,
      });
      setEditingPriceId(null);
      onPricingChanged();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Delete ── */
  const handleDeletePricing = async (id: string) => {
    if (!confirm("Remove this price tier?")) return;
    try {
      await axios.delete(`${API}/pricing/${id}`);
      onPricingChanged();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
      {/* ── Add Price Form ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-sm font-semibold">Add Price Tier</h2>
        </div>
        <form onSubmit={handleCreatePricing} className="p-5 space-y-4">
          <Field label="Amount (in cents)">
            <input
              className={inputCls}
              type="number"
              placeholder="999 = $9.99"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Currency">
            <select
              className={selectCls}
              value={priceCurrency}
              onChange={(e) => setPriceCurrency(e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </Field>
          <Field label="Billing Interval">
            <div className="flex gap-2">
              <select
                className={selectCls}
                value={priceInterval}
                onChange={(e) => {
                  setPriceInterval(e.target.value as any);
                  setPriceIntervalCount(1);
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-Time</option>
              </select>
              {priceInterval !== "one-time" && (
                <select
                  className={`${selectCls} w-36`}
                  value={priceIntervalCount}
                  onChange={(e) =>
                    setPriceIntervalCount(Number(e.target.value))
                  }
                >
                  {priceInterval === "monthly"
                    ? Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "month" : "months"}
                        </option>
                      ))
                    : Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "year" : "years"}
                        </option>
                      ))}
                </select>
              )}
            </div>
          </Field>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition mt-1"
          >
            Add Price Tier
          </button>
        </form>
      </div>

      {/* ── Pricing Cards ── */}
      <div>
        {pricing.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
            <span className="text-4xl opacity-30">💰</span>
            <p className="text-sm text-slate-500">No price tiers yet</p>
            <p className="text-xs">Add a billing tier using the form.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pricing.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

                {editingPriceId === p.id ? (
                  /* ── Inline Edit ── */
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Edit Price
                    </p>
                    <Field label="Amount (cents)">
                      <input
                        className={inputCls}
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </Field>
                    <Field label="Currency">
                      <select
                        className={selectCls}
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </Field>
                    <Field label="Interval">
                      <div className="flex gap-2">
                        <select
                          className={selectCls}
                          value={editInterval}
                          onChange={(e) => {
                            setEditInterval(e.target.value);
                            setEditIntervalCount(1);
                          }}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="one-time">One-Time</option>
                        </select>
                        {editInterval !== "one-time" && (
                          <select
                            className={`${selectCls} w-36`}
                            value={editIntervalCount}
                            onChange={(e) =>
                              setEditIntervalCount(Number(e.target.value))
                            }
                          >
                            {editInterval === "monthly"
                              ? Array.from({ length: 12 }, (_, i) => i + 1).map(
                                  (n) => (
                                    <option key={n} value={n}>
                                      {n} {n === 1 ? "month" : "months"}
                                    </option>
                                  ),
                                )
                              : Array.from({ length: 5 }, (_, i) => i + 1).map(
                                  (n) => (
                                    <option key={n} value={n}>
                                      {n} {n === 1 ? "year" : "years"}
                                    </option>
                                  ),
                                )}
                          </select>
                        )}
                      </div>
                    </Field>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleUpdatePricing(p.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-1.5 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View Mode ── */
                  <div className="p-5">
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono text-slate-100">
                          {fmtCurrency(p.amount, p.currency)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {INTERVAL_LABEL[p.interval]}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${INTERVAL_COLOR[p.interval]}`}
                        >
                          {p.interval}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono mt-2">
                        {p.currency} · {p.id.slice(0, 8)}…
                      </p>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => startEditPrice(p)}
                        className="flex-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg transition font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeletePricing(p.id)}
                        className="flex-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-1.5 rounded-lg transition font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
