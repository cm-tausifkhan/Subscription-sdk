import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Plan {
  id: string;
  name: string;
  description?: string;
  created_by_email?: string;
  created_at: string;
  customer_count?: number;
}

interface Feature {
  id: string;
  plan_id: string;
  feature_text: string;
  feature_description?: string;
  limitation_type: string;
  limitation_value?: number | null;
  is_enabled: boolean;
}

interface Pricing {
  id: string;
  plan_id: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly" | "one-time";
}

interface Customer {
  id: string;
  name: string;
  email: string;
  plan_id?: string;
  created_at: string;
}

type Tab = "features" | "pricing" | "customers";

/* ─── Config ─────────────────────────────────────────────────────────────── */
const API = "http://localhost:3000/api";

axios.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);

const intervalLabel: Record<string, string> = {
  monthly: "/mo",
  yearly: "/yr",
  "one-time": " once",
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  /* ─── State ─── */
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tab, setTab] = useState<Tab>("features");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* Plan form */
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [showPlanForm, setShowPlanForm] = useState(false);

  /* Feature form */
  const [featureText, setFeatureText] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [limitationType, setLimitationType] = useState("feature_access");
  const [limitationValue, setLimitationValue] = useState<number | "">("");

  /* Pricing form */
  const [priceAmount, setPriceAmount] = useState<number | "">("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [priceInterval, setPriceInterval] = useState<"monthly" | "yearly" | "one-time">("monthly");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number | "">("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editInterval, setEditInterval] = useState<string>("monthly");

  /* ─── Data fetching ─── */
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/plans`);
      setPlans(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatures = useCallback(async (planId: string) => {
    try {
      const res = await axios.get(`${API}/features/plan/${planId}`);
      setFeatures(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchPricing = useCallback(async (planId: string) => {
    try {
      const res = await axios.get(`${API}/pricing/plan/${planId}`);
      setPricing(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/customers`);
      setCustomers(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchPlans(); fetchCustomers(); }, [fetchPlans, fetchCustomers]);

  useEffect(() => {
    if (selectedPlanId) {
      fetchFeatures(selectedPlanId);
      fetchPricing(selectedPlanId);
    } else {
      setFeatures([]); setPricing([]);
    }
  }, [selectedPlanId, fetchFeatures, fetchPricing]);

  /* ─── Derived ─── */
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const planCustomers = customers.filter((c) => c.plan_id === selectedPlanId);
  const customerCountForPlan = (planId: string) =>
    customers.filter((c) => c.plan_id === planId).length;

  /* ─── Plan handlers ─── */
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;
    try {
      await axios.post(`${API}/plans`, { name: planName, description: planDesc });
      setPlanName(""); setPlanDesc(""); setShowPlanForm(false);
      fetchPlans();
    } catch (e) { console.error(e); }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/plans/${id}`);
      if (selectedPlanId === id) setSelectedPlanId(null);
      fetchPlans();
    } catch (e) { console.error(e); }
  };

  /* ─── Feature handlers ─── */
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !featureText) return;
    try {
      await axios.post(`${API}/features`, {
        planId: selectedPlanId, featureText,
        featureDescription: featureDesc || undefined,
        limitationType,
        limitationValue: limitationValue !== "" ? Number(limitationValue) : undefined,
      });
      setFeatureText(""); setFeatureDesc(""); setLimitationValue("");
      fetchFeatures(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  const handleToggleFeature = async (featureId: string, current: boolean) => {
    try {
      await axios.patch(`${API}/features/${featureId}/toggle`, { isEnabled: !current });
      if (selectedPlanId) fetchFeatures(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  const handleDeleteFeature = async (featureId: string) => {
    try {
      await axios.delete(`${API}/features/${featureId}`);
      if (selectedPlanId) fetchFeatures(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  /* ─── Pricing handlers ─── */
  const handleCreatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || priceAmount === "") return;
    try {
      await axios.post(`${API}/pricing`, {
        planId: selectedPlanId,
        amount: Number(priceAmount),
        currency: priceCurrency,
        interval: priceInterval,
      });
      setPriceAmount(""); setPriceCurrency("USD"); setPriceInterval("monthly");
      fetchPricing(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  const handleUpdatePricing = async (id: string) => {
    try {
      await axios.put(`${API}/pricing/${id}`, {
        amount: Number(editAmount),
        currency: editCurrency,
        interval: editInterval,
      });
      setEditingPriceId(null);
      if (selectedPlanId) fetchPricing(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm("Delete this price tier?")) return;
    try {
      await axios.delete(`${API}/pricing/${id}`);
      if (selectedPlanId) fetchPricing(selectedPlanId);
    } catch (e) { console.error(e); }
  };

  const startEdit = (p: Pricing) => {
    setEditingPriceId(p.id);
    setEditAmount(p.amount);
    setEditCurrency(p.currency);
    setEditInterval(p.interval);
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0F1117;
          --surface: #1A1D27;
          --surface2: #222536;
          --border: #2D3048;
          --border-bright: #3D4168;
          --accent: #6366F1;
          --accent-dim: rgba(99,102,241,0.12);
          --accent-glow: rgba(99,102,241,0.25);
          --green: #10B981;
          --green-dim: rgba(16,185,129,0.12);
          --amber: #F59E0B;
          --amber-dim: rgba(245,158,11,0.12);
          --red: #EF4444;
          --red-dim: rgba(239,68,68,0.12);
          --text: #E2E4F0;
          --text-muted: #8B8FA8;
          --text-dim: #585C7B;
          --mono: 'DM Mono', monospace;
          --sans: 'Inter', sans-serif;
          --radius: 10px;
          --radius-sm: 6px;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }

        /* ── Layout ── */
        .shell { display: flex; height: 100vh; overflow: hidden; }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px; min-width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          transition: width 0.2s, min-width 0.2s;
          overflow: hidden;
        }
        .sidebar.collapsed { width: 0; min-width: 0; border-right: none; }

        .sidebar-header {
          padding: 20px 18px 16px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
        }
        .sidebar-logo {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), #818CF8);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .sidebar-title { font-size: 14px; font-weight: 600; white-space: nowrap; }
        .sidebar-sub { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

        .sidebar-section { padding: 12px 10px 4px; }
        .sidebar-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
          color: var(--text-dim); text-transform: uppercase;
          padding: 0 8px; margin-bottom: 4px;
        }

        .plan-item {
          padding: 9px 10px; border-radius: var(--radius-sm);
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: background 0.15s; position: relative;
          border: 1px solid transparent;
        }
        .plan-item:hover { background: var(--surface2); }
        .plan-item.active {
          background: var(--accent-dim);
          border-color: rgba(99,102,241,0.3);
        }
        .plan-item.active::before {
          content: ''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 18px; border-radius: 0 3px 3px 0;
          background: var(--accent);
        }
        .plan-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent); flex-shrink: 0;
          box-shadow: 0 0 6px var(--accent-glow);
        }
        .plan-item:not(.active) .plan-dot { background: var(--border-bright); box-shadow: none; }
        .plan-name { font-size: 13px; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .plan-badge {
          font-size: 10px; font-family: var(--mono);
          background: var(--surface2); color: var(--text-muted);
          padding: 1px 6px; border-radius: 20px;
          border: 1px solid var(--border); flex-shrink: 0;
        }
        .plan-item.active .plan-badge { background: var(--accent-dim); border-color: rgba(99,102,241,0.4); color: #a5b4fc; }

        .plan-del-btn {
          opacity: 0; width: 18px; height: 18px; border-radius: 4px;
          background: transparent; border: none; cursor: pointer;
          color: var(--red); font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .plan-item:hover .plan-del-btn { opacity: 1; }
        .plan-del-btn:hover { background: var(--red-dim); }

        .sidebar-footer { margin-top: auto; padding: 12px 10px; border-top: 1px solid var(--border); }

        .new-plan-btn {
          width: 100%; padding: 9px 12px; border-radius: var(--radius-sm);
          background: var(--accent-dim); border: 1px dashed rgba(99,102,241,0.4);
          color: #a5b4fc; font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background 0.15s, border-color 0.15s;
          font-family: var(--sans);
        }
        .new-plan-btn:hover { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.6); }

        /* ── Main ── */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .topbar {
          height: 56px; min-height: 56px;
          padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .collapse-btn {
          width: 32px; height: 32px; border-radius: var(--radius-sm);
          background: var(--surface); border: 1px solid var(--border);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: 15px;
          transition: background 0.15s, color 0.15s;
        }
        .collapse-btn:hover { background: var(--surface2); color: var(--text); }

        .breadcrumb { font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .breadcrumb-sep { color: var(--text-dim); }
        .breadcrumb-current { color: var(--text); font-weight: 500; }

        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .role-chip {
          font-size: 11px; font-family: var(--mono);
          padding: 3px 10px; border-radius: 20px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--accent);
        }

        .content { flex: 1; overflow-y: auto; padding: 24px; }
        .content::-webkit-scrollbar { width: 6px; }
        .content::-webkit-scrollbar-track { background: transparent; }
        .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        /* ── Stat cards ── */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .stat-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 16px 18px;
        }
        .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .stat-val { font-size: 26px; font-weight: 700; font-family: var(--mono); line-height: 1; }
        .stat-val.accent { color: var(--accent); }
        .stat-val.green { color: var(--green); }
        .stat-val.amber { color: var(--amber); }

        /* ── Empty state ── */
        .empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 12px; padding: 60px 24px;
          color: var(--text-muted); text-align: center;
        }
        .empty-icon { font-size: 36px; opacity: 0.4; }
        .empty-title { font-size: 15px; font-weight: 500; color: var(--text); }
        .empty-sub { font-size: 13px; }

        /* ── Loading ── */
        .spinner { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-wrap { display: flex; justify-content: center; align-items: center; padding: 60px; }

        /* ── Plan cards (overview) ── */
        .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .plan-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 16px;
          cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .plan-card:hover { border-color: var(--border-bright); box-shadow: 0 2px 16px rgba(0,0,0,0.2); }
        .plan-card.active-card { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 2px 16px var(--accent-glow); }
        .plan-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .plan-card-name { font-size: 14px; font-weight: 600; }
        .plan-card-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; min-height: 36px; }
        .plan-card-meta { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); }
        .plan-card-customers { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .plan-card-customers span { color: var(--text); font-family: var(--mono); font-size: 13px; font-weight: 500; }

        /* ── Card container ── */
        .card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .card-head {
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .card-title { font-size: 14px; font-weight: 600; }
        .card-body { padding: 20px; }

        /* ── Tabs ── */
        .tabs { display: flex; gap: 2px; background: var(--surface2); border-radius: var(--radius-sm); padding: 3px; width: fit-content; }
        .tab-btn {
          padding: 6px 16px; font-size: 13px; font-weight: 500;
          border-radius: 5px; border: none; cursor: pointer;
          background: transparent; color: var(--text-muted);
          transition: background 0.15s, color 0.15s;
          font-family: var(--sans);
        }
        .tab-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .tab-btn:hover:not(.active) { color: var(--text); }

        /* ── Plan detail header ── */
        .plan-detail-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
        }
        .plan-detail-name { font-size: 20px; font-weight: 700; }
        .plan-detail-id { font-family: var(--mono); font-size: 11px; color: var(--text-dim); margin-top: 2px; }

        /* ── Form elements ── */
        .form-row { display: flex; flex-direction: column; gap: 5px; }
        .form-label { font-size: 12px; font-weight: 500; color: var(--text-muted); }
        .input, .select, .textarea {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text);
          font-size: 13px; font-family: var(--sans);
          padding: 8px 12px; outline: none; width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus, .select:focus, .textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .select { appearance: none; cursor: pointer; }
        .textarea { resize: vertical; min-height: 72px; }
        .form-grid { display: grid; gap: 12px; }
        .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

        /* ── Buttons ── */
        .btn {
          padding: 8px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500; cursor: pointer;
          border: 1px solid transparent; font-family: var(--sans);
          transition: opacity 0.15s, background 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
          white-space: nowrap;
        }
        .btn:hover { opacity: 0.85; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-ghost { background: transparent; border-color: var(--border); color: var(--text-muted); }
        .btn-ghost:hover { color: var(--text); background: var(--surface2); opacity: 1; }
        .btn-danger { background: var(--red-dim); border-color: rgba(239,68,68,0.3); color: var(--red); }
        .btn-sm { padding: 5px 12px; font-size: 12px; }
        .btn-xs { padding: 3px 8px; font-size: 11px; border-radius: 4px; }
        .btn-icon {
          width: 28px; height: 28px; padding: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm);
        }

        /* ── Features table ── */
        .ftable { width: 100%; border-collapse: collapse; }
        .ftable th {
          text-align: left; font-size: 11px; font-weight: 600;
          color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em;
          padding: 0 12px 10px;
        }
        .ftable td { padding: 10px 12px; border-top: 1px solid var(--border); font-size: 13px; }
        .ftable tr:hover td { background: var(--surface2); }
        .ftable-name { font-weight: 500; }
        .ftable-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        /* ── Toggle ── */
        .toggle-wrap { position: relative; width: 34px; height: 20px; flex-shrink: 0; }
        .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
        .toggle-track {
          position: absolute; inset: 0; border-radius: 20px;
          background: var(--border-bright); cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-input:checked + .toggle-track { background: var(--accent); }
        .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
          pointer-events: none;
        }
        .toggle-input:checked ~ .toggle-thumb { transform: translateX(14px); }

        /* ── Badge ── */
        .badge {
          font-size: 11px; font-family: var(--mono);
          padding: 2px 8px; border-radius: 20px; font-weight: 400;
        }
        .badge-neutral { background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border); }
        .badge-green { background: var(--green-dim); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
        .badge-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }
        .badge-accent { background: var(--accent-dim); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }

        /* ── Pricing cards ── */
        .pricing-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        .price-card {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 18px;
          position: relative; overflow: hidden;
        }
        .price-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--accent), #818CF8);
        }
        .price-amount { font-size: 28px; font-weight: 700; font-family: var(--mono); color: var(--text); }
        .price-interval { font-size: 13px; color: var(--text-muted); margin-left: 3px; }
        .price-currency { font-size: 11px; color: var(--text-dim); font-family: var(--mono); margin-top: 4px; }
        .price-actions { display: flex; gap: 8px; margin-top: 14px; }
        .price-edit-form { display: grid; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }

        /* ── Customer list ── */
        .customer-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px; border-radius: var(--radius-sm);
          transition: background 0.15s;
        }
        .customer-row:hover { background: var(--surface2); }
        .customer-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: var(--accent-dim); border: 1px solid rgba(99,102,241,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: #a5b4fc;
        }
        .customer-name { font-size: 13px; font-weight: 500; }
        .customer-email { font-size: 12px; color: var(--text-muted); font-family: var(--mono); }
        .customer-since { font-size: 11px; color: var(--text-dim); margin-left: auto; }

        /* ── Modal ── */
        .modal-bg {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; backdrop-filter: blur(3px);
        }
        .modal {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 24px; width: 420px; max-width: 95vw;
        }
        .modal-title { font-size: 16px; font-weight: 600; margin-bottom: 18px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

        /* ── Section header ── */
        .sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .sec-title { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── Divider ── */
        .divider { height: 1px; background: var(--border); margin: 20px 0; }

        /* ── Scrollable plan list ── */
        .plan-list { flex: 1; overflow-y: auto; padding: 8px 10px; }
        .plan-list::-webkit-scrollbar { width: 4px; }
        .plan-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        @media (max-width: 768px) {
          .sidebar { position: fixed; z-index: 50; height: 100%; top: 0; left: 0; transform: translateX(0); }
          .sidebar.collapsed { transform: translateX(-100%); width: 260px; min-width: 260px; }
          .form-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="shell">
        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">A</div>
            <div>
              <div className="sidebar-title">Admin Panel</div>
              <div className="sidebar-sub">Subscription Manager</div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Plans</div>
          </div>

          <div className="plan-list">
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <div className="spinner" />
              </div>
            ) : plans.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-dim)", padding: "8px 8px", textAlign: "center" }}>No plans yet</p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-item ${selectedPlanId === plan.id ? "active" : ""}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="plan-dot" />
                  <span className="plan-name">{plan.name}</span>
                  <span className="plan-badge">{customerCountForPlan(plan.id)}</span>
                  <button className="plan-del-btn" onClick={(e) => handleDeletePlan(plan.id, e)} title="Delete plan">✕</button>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <button className="new-plan-btn" onClick={() => setShowPlanForm(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Plan
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "◀" : "▶"}
              </button>
              <div className="breadcrumb">
                <span>Dashboard</span>
                {selectedPlan && (
                  <>
                    <span className="breadcrumb-sep">/</span>
                    <span className="breadcrumb-current">{selectedPlan.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="topbar-right">
              <span className="role-chip">Role: Admin</span>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {!selectedPlanId ? (
              /* ── Overview ── */
              <>
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Total Plans</div>
                    <div className="stat-val accent">{plans.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Customers</div>
                    <div className="stat-val green">{customers.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">With Active Plan</div>
                    <div className="stat-val amber">{customers.filter((c) => c.plan_id).length}</div>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-wrap"><div className="spinner" /></div>
                ) : plans.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📋</div>
                    <div className="empty-title">No plans created yet</div>
                    <div className="empty-sub">Click "New Plan" in the sidebar to get started.</div>
                  </div>
                ) : (
                  <>
                    <div className="sec-header">
                      <span className="sec-title">All Plans</span>
                    </div>
                    <div className="plans-grid">
                      {plans.map((plan) => {
                        const count = customerCountForPlan(plan.id);
                        return (
                          <div
                            key={plan.id}
                            className={`plan-card ${selectedPlanId === plan.id ? "active-card" : ""}`}
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            <div className="plan-card-header">
                              <div className="plan-card-name">{plan.name}</div>
                              <button
                                className="btn btn-xs btn-ghost"
                                style={{ color: "var(--red)" }}
                                onClick={(e) => handleDeletePlan(plan.id, e)}
                              >✕</button>
                            </div>
                            <div className="plan-card-desc">{plan.description || "No description."}</div>
                            <div className="plan-card-meta">
                              <div className="plan-card-customers">👥 <span>{count}</span> customer{count !== 1 ? "s" : ""}</div>
                              <span className="badge badge-accent" style={{ fontSize: 10 }}>View →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* ── Plan detail ── */
              <>
                {/* Plan header */}
                <div className="plan-detail-bar">
                  <div>
                    <div className="plan-detail-name">{selectedPlan?.name}</div>
                    <div className="plan-detail-id">ID: {selectedPlanId}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="badge badge-green">👥 {planCustomers.length} customers</span>
                    <div className="tabs">
                      {(["features", "pricing", "customers"] as Tab[]).map((t) => (
                        <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPlanId(null)}>← Back</button>
                  </div>
                </div>

                {/* ── FEATURES TAB ── */}
                {tab === "features" && (
                  <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
                    {/* Add feature form */}
                    <div className="card">
                      <div className="card-head"><span className="card-title">Add Feature</span></div>
                      <div className="card-body">
                        <form onSubmit={handleCreateFeature}>
                          <div className="form-grid" style={{ gap: 12 }}>
                            <div className="form-row">
                              <label className="form-label">Feature Name</label>
                              <input className="input" placeholder="e.g. API Access" value={featureText} onChange={(e) => setFeatureText(e.target.value)} required />
                            </div>
                            <div className="form-row">
                              <label className="form-label">Description</label>
                              <input className="input" placeholder="Short description" value={featureDesc} onChange={(e) => setFeatureDesc(e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label className="form-label">Type</label>
                              <select className="select" value={limitationType} onChange={(e) => setLimitationType(e.target.value)}>
                                <option value="feature_access">Feature Access (On/Off)</option>
                                <option value="numeric_limit">Numeric Limit</option>
                              </select>
                            </div>
                            {limitationType === "numeric_limit" && (
                              <div className="form-row">
                                <label className="form-label">Limit Value</label>
                                <input className="input" type="number" placeholder="e.g. 500" value={limitationValue} onChange={(e) => setLimitationValue(e.target.value === "" ? "" : Number(e.target.value))} required />
                              </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>Add Feature</button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Feature list */}
                    <div className="card">
                      <div className="card-head">
                        <span className="card-title">Features ({features.length})</span>
                      </div>
                      <div style={{ padding: "0 4px" }}>
                        {features.length === 0 ? (
                          <div className="empty" style={{ padding: "40px 24px" }}>
                            <div className="empty-icon">⚙️</div>
                            <div className="empty-title">No features yet</div>
                            <div className="empty-sub">Add a feature using the form on the left.</div>
                          </div>
                        ) : (
                          <table className="ftable">
                            <thead>
                              <tr>
                                <th style={{ width: 48 }}>Active</th>
                                <th>Feature</th>
                                <th>Type</th>
                                <th style={{ textAlign: "right" }}>Remove</th>
                              </tr>
                            </thead>
                            <tbody>
                              {features.map((f) => (
                                <tr key={f.id}>
                                  <td>
                                    <div className="toggle-wrap">
                                      <input type="checkbox" className="toggle-input" checked={f.is_enabled} onChange={() => handleToggleFeature(f.id, f.is_enabled)} id={`tog-${f.id}`} />
                                      <label htmlFor={`tog-${f.id}`} className="toggle-track" />
                                      <div className="toggle-thumb" />
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ftable-name">{f.feature_text}</div>
                                    {f.feature_description && <div className="ftable-sub">{f.feature_description}</div>}
                                  </td>
                                  <td>
                                    {f.limitation_type === "numeric_limit"
                                      ? <span className="badge badge-amber">Limit: {f.limitation_value}</span>
                                      : <span className="badge badge-neutral">Access</span>}
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <button className="btn btn-xs btn-danger" onClick={() => handleDeleteFeature(f.id)}>✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PRICING TAB ── */}
                {tab === "pricing" && (
                  <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
                    {/* Add pricing form */}
                    <div className="card">
                      <div className="card-head"><span className="card-title">Add Price Tier</span></div>
                      <div className="card-body">
                        <form onSubmit={handleCreatePricing}>
                          <div className="form-grid" style={{ gap: 12 }}>
                            <div className="form-row">
                              <label className="form-label">Amount (in cents)</label>
                              <input className="input" type="number" placeholder="e.g. 999 = $9.99" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value === "" ? "" : Number(e.target.value))} required />
                            </div>
                            <div className="form-row">
                              <label className="form-label">Currency</label>
                              <select className="select" value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)}>
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                                <option value="INR">INR — Indian Rupee</option>
                                <option value="AUD">AUD — Australian Dollar</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label className="form-label">Billing Interval</label>
                              <select className="select" value={priceInterval} onChange={(e) => setPriceInterval(e.target.value as any)}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One-Time</option>
                              </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>Add Price Tier</button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Pricing cards */}
                    <div>
                      {pricing.length === 0 ? (
                        <div className="empty" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                          <div className="empty-icon">💰</div>
                          <div className="empty-title">No price tiers set</div>
                          <div className="empty-sub">Add a billing price using the form.</div>
                        </div>
                      ) : (
                        <div className="pricing-grid">
                          {pricing.map((p) => (
                            <div key={p.id} className="price-card">
                              {editingPriceId === p.id ? (
                                /* Inline edit form */
                                <div className="price-edit-form">
                                  <div className="form-row">
                                    <label className="form-label">Amount (cents)</label>
                                    <input className="input" type="number" value={editAmount} onChange={(e) => setEditAmount(Number(e.target.value))} />
                                  </div>
                                  <div className="form-row">
                                    <label className="form-label">Currency</label>
                                    <select className="select" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}>
                                      <option value="USD">USD</option>
                                      <option value="EUR">EUR</option>
                                      <option value="GBP">GBP</option>
                                      <option value="INR">INR</option>
                                      <option value="AUD">AUD</option>
                                    </select>
                                  </div>
                                  <div className="form-row">
                                    <label className="form-label">Interval</label>
                                    <select className="select" value={editInterval} onChange={(e) => setEditInterval(e.target.value)}>
                                      <option value="monthly">Monthly</option>
                                      <option value="yearly">Yearly</option>
                                      <option value="one-time">One-Time</option>
                                    </select>
                                  </div>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdatePricing(p.id)}>Save</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingPriceId(null)}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <span className="price-amount">{fmt(p.amount, p.currency)}</span>
                                    <span className="price-interval">{intervalLabel[p.interval]}</span>
                                  </div>
                                  <div style={{ marginTop: 6 }}>
                                    <span className={`badge ${p.interval === "monthly" ? "badge-accent" : p.interval === "yearly" ? "badge-green" : "badge-amber"}`}>
                                      {p.interval}
                                    </span>
                                  </div>
                                  <div className="price-currency">{p.currency} · ID: {p.id.slice(0, 8)}…</div>
                                  <div className="price-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>✏️ Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePricing(p.id)}>Delete</button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CUSTOMERS TAB ── */}
                {tab === "customers" && (
                  <div className="card">
                    <div className="card-head">
                      <span className="card-title">Customers on "{selectedPlan?.name}"</span>
                      <span className="badge badge-green">{planCustomers.length} total</span>
                    </div>
                    <div className="card-body" style={{ padding: "8px 12px" }}>
                      {planCustomers.length === 0 ? (
                        <div className="empty" style={{ padding: "40px" }}>
                          <div className="empty-icon">👥</div>
                          <div className="empty-title">No customers on this plan</div>
                          <div className="empty-sub">Customers subscribed to this plan will appear here.</div>
                        </div>
                      ) : (
                        planCustomers.map((c) => (
                          <div key={c.id} className="customer-row">
                            <div className="customer-avatar">
                              {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <div className="customer-name">{c.name}</div>
                              <div className="customer-email">{c.email}</div>
                            </div>
                            <div className="customer-since">
                              Since {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── New Plan Modal ── */}
      {showPlanForm && (
        <div className="modal-bg" onClick={() => setShowPlanForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create New Plan</div>
            <form onSubmit={handleCreatePlan}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-row">
                  <label className="form-label">Plan Name</label>
                  <input className="input" placeholder="e.g. Premium Tier" value={planName} onChange={(e) => setPlanName(e.target.value)} required autoFocus />
                </div>
                <div className="form-row">
                  <label className="form-label">Description</label>
                  <textarea className="textarea input" placeholder="What's included in this plan..." value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPlanForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}