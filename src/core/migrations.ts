
import { DB } from "../core/database";
//import { initDB } from "../core/database/index.ts";
//mport { getDBConfig } from "./config";// gateway_customer_id is the id provided by the payment gateway (stripe, razorpay, etc.) to identify the customer in their system
//payment_method_id is the id provided by the payment gateway (stripe, razorpay, etc.) to identify the payment method in their system like card info and all
export const runMigrations = async (pool: DB) => {
  await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Admin',
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      
      payment_gateway VARCHAR(50) DEFAULT NULL, 
      gateway_customer_id VARCHAR(255) DEFAULT NULL,
      payment_method_id VARCHAR(255) DEFAULT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,  /* which admin created this plan */
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

    CREATE TABLE IF NOT EXISTS pricing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      interval VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS plan_features (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
      feature_text TEXT NOT NULL,
      feature_description TEXT,
      limitation_type VARCHAR(50) NOT NULL DEFAULT 'feature_access',
      limitation_value INT DEFAULT NULL,
      is_enabled BOOLEAN DEFAULT true,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      plan_id UUID REFERENCES plans(id),
      status VARCHAR(50) DEFAULT 'active',
      started_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

  `);
  console.log("✅ Migrations ran successfully");
};
