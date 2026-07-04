import React, { useEffect,useState } from "react";
import type { Customer } from "./types";

interface CustomersSectionProps {
  planId: string 
  planName: string;
  customers: Customer[];
}
interface Subscription {
  subscription_id: string;
  plan_name: string;
  status: string;
  started_at: string;
}

export default function CustomersSection({
  planId,
  planName,
  customers,
}: CustomersSectionProps) {
  const [subscriptions, setSubscriptions] = useState<
    Record<string, Subscription[]>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [planCustomers, setPlanCustomers] = useState<Customer[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)

  const fetchSubscriptions = async (customerId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/api/subscriptions/${customerId}/subscriptions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    setSubscriptions((prev) => ({ ...prev, [customerId]: data }));
  };

  const removeFromPlan = async (subscriptionId: string, customerId: string) => {
    setLoadingId(subscriptionId);
    const token = localStorage.getItem("token");
    await fetch(
      `http://localhost:3000/api/subscriptions/subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    await fetchSubscriptions(customerId);
    setLoadingId(null);
  };


  useEffect(() => {
    const fetchPlanCustomers = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:3000/api/subscription/plan/${planId}/customers`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      setPlanCustomers(data)
      setTotalCount(data.length)
    }
    if (planId) fetchPlanCustomers()
  }, [planId])
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Customers on "{planName}"</h2>
        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          {totalCount} subscribed
        </span>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
          <span className="text-4xl opacity-30">👥</span>
          <p className="text-sm text-slate-500">No customers on this plan</p>
          <p className="text-xs">
            Customers subscribed here will appear below.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {customers.map((c) => (
            <div
              key={c.id}
              className="px-5 py-3.5 hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-semibold text-indigo-400 flex-shrink-0">
                  {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {c.email}
                  </p>
                </div>

                {/* View Plans button */}
                <button
                  onClick={() => fetchSubscriptions(c.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition"
                >
                  View Plans
                </button>
              </div>

              {/* Subscriptions list - shows after clicking View Plans */}
              {subscriptions[c.id] && (
                <div className="mt-3 ml-13 space-y-2">
                  {subscriptions[c.id].length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No active subscriptions
                    </p>
                  ) : (
                    subscriptions[c.id].map((sub) => (
                      <div
                        key={sub.subscription_id}
                        className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-200">
                            {sub.plan_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Since{" "}
                            {new Date(sub.started_at).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removeFromPlan(sub.subscription_id, c.id)
                          }
                          disabled={loadingId === sub.subscription_id}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-2.5 py-1 rounded-lg transition"
                        >
                          {loadingId === sub.subscription_id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
