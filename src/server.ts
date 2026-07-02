import express from 'express'
import dotenv from 'dotenv'
import { createPool } from './core/database'
import { runMigrations } from './core/migrations'
import { plansRouter } from './admin/routes/plans.routes'
import { featuresRouter } from './admin/routes/features.routes'
import { pricingRouter } from './admin/routes/pricing.routes'

dotenv.config()

const app = express()
app.use(express.json())

const pool = createPool(process.env.DATABASE_URL!)

// Routes
app.use('/api/plans', plansRouter(pool))
app.use('/api/features', featuresRouter(pool))
app.use('/api/pricing', pricingRouter(pool))

const start = async () => {
  await runMigrations(pool)
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
  })
}

start()