import { DBPool } from './database'

export const runMigrations = async (pool: DBPool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

   

    CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL,  -- monthly, yearly, one-time
    created_at TIMESTAMP DEFAULT NOW()
   );

    CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL,
      plan_id UUID REFERENCES plans(id),
      status VARCHAR(50) DEFAULT 'active',
      started_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('✅ Migrations ran successfully')
}