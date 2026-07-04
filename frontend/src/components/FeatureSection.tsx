import React, { useState } from "react";
import axios from "axios";
import Field from "./field";
import { API, inputCls, selectCls } from "./constants";
import type { Feature } from "./types";

interface FeaturesSectionProps {
  planId: string;
  features: Feature[];
  onFeaturesChanged: () => void;
}

export default function FeaturesSection({
  planId,
  features,
  onFeaturesChanged,
}: FeaturesSectionProps) {
  /* ── Form state ── */
  const [featureText, setFeatureText] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [limitationType, setLimitationType] = useState("feature_access");
  const [limitationValue, setLimitationValue] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLimitationType, setEditLimitationType] =
    useState("feature_access");
  const [editLimitationValue, setEditLimitationValue] = useState<number | "">(
    "",
  );

  /* ── Create ── */
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureText.trim()) return;
    try {
      await axios.post(`${API}/features`, {
        planId,
        featureText: featureText.trim(),
        featureDescription: featureDesc.trim() || undefined,
        limitationType,
        limitationValue:
          limitationValue !== "" ? Number(limitationValue) : undefined,
      });
      setFeatureText("");
      setFeatureDesc("");
      setLimitationValue("");
      onFeaturesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (f: Feature) => {
    setEditingId(f.id);
    setEditText(f.feature_text);
    setEditDesc(f.feature_description ?? "");
    setEditLimitationType(f.limitation_type);
    setEditLimitationValue(f.limitation_value ?? "");
  };

  const handleUpdateFeature = async (id: string) => {
    try {
      await axios.put(`${API}/features/${id}`, {
        featureText: editText.trim(),
        featureDescription: editDesc.trim() || undefined,
        limitationType: editLimitationType,
        limitationValue:
          editLimitationValue !== "" ? Number(editLimitationValue) : null,
      });
      setEditingId(null);
      onFeaturesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Toggle ── */
  const handleToggleFeature = async (id: string, current: boolean) => {
    try {
      await axios.patch(`${API}/features/${id}/toggle`, {
        isEnabled: !current,
      });
      onFeaturesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Delete ── */
  const handleDeleteFeature = async (id: string) => {
    try {
      await axios.delete(`${API}/features/${id}`);
      onFeaturesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
      {/* ── Add Feature Form ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-sm font-semibold">Add Feature</h2>
        </div>
        <form onSubmit={handleCreateFeature} className="p-5 space-y-4">
          <Field label="Feature Name">
            <input
              className={inputCls}
              placeholder="e.g. API Access"
              value={featureText}
              onChange={(e) => setFeatureText(e.target.value)}
              required
            />
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              placeholder="Short description"
              value={featureDesc}
              onChange={(e) => setFeatureDesc(e.target.value)}
            />
          </Field>
          <Field label="Type">
            {/* REPLACE the select below */}
            <select
              className={selectCls}
              value={limitationType}
              onChange={(e) => setLimitationType(e.target.value)}
            >
              <option value="feature_access">Feature Access (On/Off)</option>
              <option value="numeric_limit">Numeric Limit</option>
              <option value="usage">Usage (posts, API calls…)</option>
              <option value="seat">Seat (max users/members)</option>
              <option value="time">Time (trial days, expiry)</option>
              <option value="rate">Rate (requests per hour/day)</option>
              <option value="storage">Storage (GB/MB limit)</option>
              <option value="project">Project (max workspaces)</option>
            </select>
          </Field>
          {limitationType === "numeric_limit" && (
            <Field label="Limit Value">
              <input
                className={inputCls}
                type="number"
                placeholder="e.g. 500"
                value={limitationValue}
                onChange={(e) =>
                  setLimitationValue(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                required
              />
            </Field>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition mt-1"
          >
            Add Feature
          </button>
        </form>
      </div>

      {/* ── Feature List ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Features</h2>
          <span className="text-xs text-slate-500 font-mono">
            {features.length} total
          </span>
        </div>

        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-600">
            <span className="text-3xl opacity-40">⚙️</span>
            <p className="text-sm text-slate-500">No features yet</p>
            <p className="text-xs">Add one using the form.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider w-12">
                  On
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {features.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition">
                  {editingId === f.id ? (
                    /* ── Inline Edit Row ── */
                    <td colSpan={4} className="px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Feature Name">
                          <input
                            className={inputCls}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                        </Field>
                        <Field label="Description">
                          <input
                            className={inputCls}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                          />
                        </Field>
                        <Field label="Type">
                          <select
                            className={selectCls}
                            value={editLimitationType}
                            onChange={(e) =>
                              setEditLimitationType(e.target.value)
                            }
                          >
                            <option value="feature_access">
                              Feature Access (On/Off)
                            </option>
                            <option value="numeric_limit">Numeric Limit</option>
                            <option value="usage">
                              Usage (posts, API calls…)
                            </option>
                            <option value="seat">
                              Seat (max users/members)
                            </option>
                            <option value="time">
                              Time (trial days, expiry)
                            </option>
                            <option value="rate">
                              Rate (requests per hour/day)
                            </option>
                            <option value="storage">
                              Storage (GB/MB limit)
                            </option>
                            <option value="project">
                              Project (max workspaces)
                            </option>
                          </select>
                        </Field>
                        {editLimitationType !== "feature_access" && (
                          <Field label="Limit Value">
                            <input
                              className={inputCls}
                              type="number"
                              value={editLimitationValue}
                              onChange={(e) =>
                                setEditLimitationValue(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </Field>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateFeature(f.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-4 py-1.5 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  ) : (
                    /* ── View Row ── */
                    <>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleFeature(f.id, f.is_enabled)
                          }
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            f.is_enabled ? "bg-indigo-600" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              f.is_enabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-200">
                          {f.feature_text}
                        </p>
                        {f.feature_description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {f.feature_description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {f.limitation_type === "feature_access" ||
                        f.limitation_type === "numeric_limit" ? (
                          f.limitation_type === "numeric_limit" ? (
                            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                              Limit: {f.limitation_value}
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                              Access
                            </span>
                          )
                        ) : (
                          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full capitalize">
                            {f.limitation_type}
                            {f.limitation_value != null
                              ? `: ${f.limitation_value}`
                              : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(f)}
                            className="text-xs text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 px-2 py-1 rounded transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(f.id)}
                            className="text-xs text-slate-600 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
