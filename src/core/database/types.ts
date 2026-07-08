//src/core/database/types.ts
import { Generated, ColumnType } from "kysely";

export interface UsersTable {
  id: Generated<string>;
  name: string;
  email: string;
  password: string;
  role: string;
  is_active: Generated<boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export interface CustomersTable {
  id: Generated<string>;
  name: string;
  email: string;
  payment_gateway: string | null;
  gateway_customer_id: string | null;
  payment_method_id: string | null;
  is_active:  Generated<boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export interface PlansTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  created_by: string | null;
  is_active: Generated<boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export interface PricingTable {
  id: Generated<string>;
  plan_id: string;
  amount: number;
  currency: string;
  interval: string;
  created_at: ColumnType<Date, never, never>;
}

export interface PlanFeaturesTable {
  id: Generated<string>;
  plan_id: string;
  feature_text: string;
  feature_description: string | null;
  limitation_type: string;
  limitation_value: number | null;
  is_enabled: Generated<boolean>;
  display_order: number;
  created_at: ColumnType<Date, never, never>;
}

export interface SubscriptionsTable {
  id: Generated<string>;
  customer_id: string;
  plan_id: string;
  status: Generated<string>;
  started_at: ColumnType<Date, never, never>;
  expires_at: Date | null;
  created_at: ColumnType<Date, never, never>;
}

/* ── The master DB interface Kysely uses for type safety ── */
export interface Database {
  users: UsersTable;
  customers: CustomersTable;
  plans: PlansTable;
  pricing: PricingTable;
  plan_features: PlanFeaturesTable;
  subscriptions: SubscriptionsTable;
}