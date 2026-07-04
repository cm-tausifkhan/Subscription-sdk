// components/types.ts  — TYPES ONLY

export interface Plan {
  id: string;
  name: string;
  description?: string;
  created_by_email?: string;
  created_at: string;
  is_active: boolean;
}

export interface Feature {
  id: string;
  plan_id: string;
  feature_text: string;
  feature_description?: string;
  limitation_type: string;
  limitation_value?: number | null;
  is_enabled: boolean;
}

export interface Pricing {
  id: string;
  plan_id: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly" | "one-time";
  interval_count?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  plan_id?: string;
  created_at: string;
}

export type Tab = "features" | "pricing" | "customers";