import { Router } from 'express'
import { PlansService } from '../../modules/plans/plans.service'
import { DBPool } from '../../core/database'

export const plansRouter = (pool: DBPool) => {
  const router = Router()
  const plansService = new PlansService(pool)

  // Create plan
  router.post('/', async (req, res) => {
    try {
      const plan = await plansService.create(req.body)
      res.status(201).json(plan)
    } catch (err) {
      res.status(500).json({ error: 'Failed to create plan' })
    }
  })

  // Get all plans
  router.get('/', async (req, res) => {
    try {
      const plans = await plansService.findAll()
      res.json(plans)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch plans' })
    }
  })

  // Get plan by ID
  router.get('/:id', async (req, res) => {
    try {
      const plan = await plansService.findById(req.params.id)
      if (!plan) return res.status(404).json({ error: 'Plan not found' })
      res.json(plan)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch plan' })
    }
  })

  // Update plan
  router.put('/:id', async (req, res) => {
    try {
      const plan = await plansService.update(req.params.id, req.body)
      res.json(plan)
    } catch (err) {
      res.status(500).json({ error: 'Failed to update plan' })
    }
  })

  // Delete plan
  router.delete('/:id', async (req, res) => {
    try {
      const result = await plansService.delete(req.params.id)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete plan' })
    }
  })

  return router
}