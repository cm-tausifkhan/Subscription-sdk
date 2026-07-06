import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import type { Plan, Feature, Pricing, Customer, Tab } from "./types";
import { API } from "./constants";
import { PlanSidebar, PlanModals, PlanOverview } from "./PlanSection";
import FeaturesSection from "./FeatureSection";
import PricingSection from "./PricingSection";
import CustomersSection from "./CustomersSection";

/* ─── Axios auth interceptor ─────────────────────────────────────────────── */
axios.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  /* ── Core state ── */
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tab, setTab] = useState<Tab>("features");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Modal visibility ── */
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  /* ── Fetchers ── */
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
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPricing = useCallback(async (planId: string) => {
    try {
      const res = await axios.get(`${API}/pricing/plan/${planId}`);
      setPricing(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchTotalCustomers = useCallback(async () => {
  try {
    const res = await axios.get(`${API}/customers/count`);
    setTotalCustomers(res.data.count);
  } catch (e) {
    console.error(e);
  }
}, []);

  const fetchCustomers = useCallback(async (planId: string) => {
    try {
      const res = await axios.get(
        `${API}/subscriptions/plan/${planId}/customers`,
      );
      setCustomers(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    fetchPlans();
    fetchTotalCustomers();
  }, [fetchPlans ,  fetchTotalCustomers]);

  useEffect(() => {
    if (selectedPlanId) {
      fetchFeatures(selectedPlanId);
      fetchPricing(selectedPlanId);
      fetchCustomers(selectedPlanId);
      setTab("features");
    } else {
      setFeatures([]);
      setPricing([]);
      setCustomers([]);
    }
  }, [selectedPlanId, fetchFeatures, fetchPricing, fetchCustomers]);

  /* ── Derived ── */
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const planCustomers = customers;
  const countForPlan = (id: string) =>
    id === selectedPlanId ? customers.length : 0;

  /* ── Plan delete ── */
  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this plan permanently?")) return;
    try {
      await axios.delete(`${API}/plans/${id}`);
      if (selectedPlanId === id) setSelectedPlanId(null);
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans fixed inset-0">
      {/* ━━━━━━━━━━━━━━━━━━ SIDEBAR ━━━━━━━━━━━━━━━━━━ */}
      <PlanSidebar
        plans={plans}
        loading={loading}
        selectedPlanId={selectedPlanId}
        sidebarOpen={sidebarOpen}
        countForPlan={countForPlan}
        onSelectPlan={setSelectedPlanId}
        onDeletePlan={handleDeletePlan}
        onOpenCreateModal={() => setShowPlanModal(true)}
      />

      {/* ━━━━━━━━━━━━━━━━━━ MAIN ━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ── Topbar ── */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition text-xs"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Dashboard</span>
              {selectedPlan && (
                <>
                  <span className="text-slate-700">/</span>
                  <span className="text-slate-200 font-medium">
                    {selectedPlan.name}
                  </span>
                </>
              )}
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-indigo-400 px-3 py-1 rounded-full">
            Role: Admin
          </span>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* ── OVERVIEW (no plan selected) ── */}
          {!selectedPlanId && (
            <PlanOverview
              plans={plans}
              
              totalCustomers={totalCustomers}
              loading={loading}
              countForPlan={countForPlan}
              onSelectPlan={setSelectedPlanId}
              onOpenCreateModal={() => setShowPlanModal(true)}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {/* ── PLAN DETAIL ── */}
          {selectedPlanId && selectedPlan && (
            <div className="p-6">
              {/* Plan header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-100">
                      {selectedPlan.name}
                    </h1>
                    {!selectedPlan.is_active && (
                      <span className="text-xs bg-slate-700 text-slate-400 border border-slate-600 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    ID: {selectedPlanId}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
                    👥 {planCustomers.length} customers
                  </span>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    {(["features", "pricing", "customers"] as Tab[]).map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                            tab === t
                              ? "bg-slate-800 text-slate-100 shadow-sm"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs text-slate-400 hover:text-slate-100 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                  >
                    ✏️ Edit Plan
                  </button>
                  <button
                    onClick={() => setSelectedPlanId(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* ── FEATURES TAB ── */}
              {tab === "features" && (
                <FeaturesSection
                  planId={selectedPlanId}
                  features={features}
                  onFeaturesChanged={() => fetchFeatures(selectedPlanId)}
                />
              )}

              {/* ── PRICING TAB ── */}
              {tab === "pricing" && (
                <PricingSection
                  planId={selectedPlanId}
                  pricing={pricing}
                  onPricingChanged={() => fetchPricing(selectedPlanId)}
                />
              )}

              {/* ── CUSTOMERS TAB ── */}
              {tab === "customers" && (
                <CustomersSection
                  planId={selectedPlanId}
                  planName={selectedPlan.name}
                  customers={planCustomers}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━ PLAN MODALS ━━━━━━━━━━━━━━━━━━ */}
      <PlanModals
        selectedPlan={selectedPlan}
        showCreateModal={showPlanModal}
        showEditModal={showEditModal}
        onCloseCreate={() => setShowPlanModal(false)}
        onCloseEdit={() => setShowEditModal(false)}
        onPlanCreated={fetchPlans}
        onPlanUpdated={fetchPlans}
      />
    </div>
  );
}
