import React, { useState } from "react";
import axios from "axios";
import Field from "./field";

import {API, inputCls} from "./constants"
import type { Plan } from "./types";

/* ─── PlanModal ──────────────────────────────────────────────────────────── */
interface PlanModalProps {
  mode: "create" | "edit";
  initialName?: string;
  initialDesc?: string;
  initialActive?: boolean;
  saving: boolean;
  onSubmit: (data: {
    name: string;
    description: string;
    is_active: boolean;
  }) => void;
  onClose: () => void;
}

function PlanModal({
  mode,
  initialName = "",
  initialDesc = "",
  initialActive = true,
  saving,
  onSubmit,
  onClose,
}: PlanModalProps) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);
  const [isActive, setIsActive] = useState(initialActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: desc.trim(), is_active: isActive });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-100">
            {mode === "create" ? "Create New Plan" : "Edit Plan"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Plan Name">
            <input
              className={inputCls}
              placeholder="e.g. Premium Tier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              className={`${inputCls} resize-none min-h-[80px]`}
              placeholder="What's included in this plan..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Field>

          {/* Active / Inactive toggle — only shown in edit mode */}
          {mode === "edit" && (
            <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Plan Status</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isActive
                    ? "Active — visible to customers"
                    : "Inactive — hidden from customers"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                  isActive ? "bg-indigo-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition"
            >
              {saving
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                  ? "Create Plan"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── PlanSidebar ────────────────────────────────────────────────────────── */
interface PlanSidebarProps {
  plans: Plan[];
  loading: boolean;
  selectedPlanId: string | null;
  sidebarOpen: boolean;
  countForPlan: (id: string) => number;
  onSelectPlan: (id: string) => void;
  onDeletePlan: (id: string, e: React.MouseEvent) => void;
  onOpenCreateModal: () => void;
}

export function PlanSidebar({
  plans,
  loading,
  selectedPlanId,
  sidebarOpen,
  countForPlan,
  onSelectPlan,
  onDeletePlan,
  onOpenCreateModal,
}: PlanSidebarProps) {
  return (
    <aside
      className={`${
        sidebarOpen ? "w-64 min-w-[256px]" : "w-0 min-w-0 overflow-hidden"
      } flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          A
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">Admin Panel</p>
          <p className="text-xs text-slate-500 truncate">Subscription Manager</p>
        </div>
      </div>

      {/* Plans list */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase px-2 mb-2">
          Plans
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6 px-2">
            No plans yet. Create one below.
          </p>
        ) : (
          plans.map((plan) => {
            const isActive = selectedPlanId === plan.id;
            const count = countForPlan(plan.id);
            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-indigo-600/15 border border-indigo-500/25"
                    : "hover:bg-slate-800 border border-transparent"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? "bg-indigo-400" : "bg-slate-600"
                  }`}
                />
                <span
                  className={`text-sm flex-1 truncate ${
                    isActive ? "text-slate-100 font-medium" : "text-slate-400"
                  }`}
                >
                  {plan.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {count}
                </span>
                <button
                  onClick={(e) => onDeletePlan(plan.id, e)}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* New Plan button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-indigo-500/40 bg-indigo-500/5 text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 hover:border-indigo-500/60 transition"
        >
          <span className="text-base leading-none">+</span>
          New Plan
        </button>
      </div>
    </aside>
  );
}

/* ─── PlanModals ─────────────────────────────────────────────────────────── */
/**
 * Renders both the Create and Edit plan modals.
 * Handles all plan create/update API calls internally.
 */
interface PlanModalsProps {
  selectedPlan: Plan | undefined;
  showCreateModal: boolean;
  showEditModal: boolean;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onPlanCreated: () => void;
  onPlanUpdated: () => void;
}

export function PlanModals({
  selectedPlan,
  showCreateModal,
  showEditModal,
  onCloseCreate,
  onCloseEdit,
  onPlanCreated,
  onPlanUpdated,
}: PlanModalsProps) {
  const [planCreating, setPlanCreating] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);

  const handleCreate = async (data: {
    name: string;
    description: string;
    is_active: boolean;
  }) => {
    setPlanCreating(true);
    try {
      await axios.post(`${API}/plans`, {
        name: data.name,
        description: data.description || undefined,
      });
      onCloseCreate();
      onPlanCreated();
    } catch (e) {
      console.error(e);
    } finally {
      setPlanCreating(false);
    }
  };

  const handleUpdate = async (data: {
    name: string;
    description: string;
    is_active: boolean;
  }) => {
    if (!selectedPlan) return;
    setPlanSaving(true);
    try {
      await axios.put(`${API}/plans/${selectedPlan.id}`, {
        name: data.name,
        description: data.description || undefined,
        isActive: data.is_active,
      });
      onCloseEdit();
      onPlanUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setPlanSaving(false);
    }
  };

  return (
    <>
      {showCreateModal && (
        <PlanModal
          mode="create"
          saving={planCreating}
          onSubmit={handleCreate}
          onClose={onCloseCreate}
        />
      )}

      {showEditModal && selectedPlan && (
        <PlanModal
          mode="edit"
          initialName={selectedPlan.name}
          initialDesc={selectedPlan.description ?? ""}
          initialActive={selectedPlan.is_active}
          saving={planSaving}
          onSubmit={handleUpdate}
          onClose={onCloseEdit}
        />
      )}
    </>
  );
}

/* ─── PlanOverview ───────────────────────────────────────────────────────── */
/**
 * The overview shown when no plan is selected — stat cards + plan grid.
 */
interface PlanOverviewProps {
  plans: Plan[];
  customers: { plan_id?: string }[];
  loading: boolean;
  countForPlan: (id: string) => number;
  onSelectPlan: (id: string) => void;
  onOpenCreateModal: () => void;
  onDeletePlan: (id: string, e: React.MouseEvent) => void;
}

export function PlanOverview({
  plans,
  customers,
  loading,
  countForPlan,
  onSelectPlan,
  onOpenCreateModal,
  onDeletePlan,
}: PlanOverviewProps) {
  return (
    <div className="p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Plans", value: plans.length, color: "text-indigo-400" },
          { label: "Total Customers", value: customers.length, color: "text-emerald-400" },
          {
            label: "On a Plan",
            value: customers.filter((c) => c.plan_id).length,
            color: "text-amber-400",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plans grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600">
          <span className="text-5xl opacity-40">📋</span>
          <p className="text-base font-medium text-slate-400">No plans yet</p>
          <p className="text-sm">
            Click{" "}
            <button
              onClick={onOpenCreateModal}
              className="text-indigo-400 underline underline-offset-2"
            >
              New Plan
            </button>{" "}
            in the sidebar to get started.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">
            All Plans
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const count = countForPlan(plan.id);
              return (
                <div
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.id)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-slate-700 hover:shadow-lg hover:shadow-black/20 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-100">{plan.name}</h3>
                    <button
                      onClick={(e) => onDeletePlan(plan.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-slate-600 hover:text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 min-h-[32px]">
                    {plan.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      👥{" "}
                      <span className="text-slate-300 font-mono font-medium">{count}</span>{" "}
                      customer{count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium">Manage →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}