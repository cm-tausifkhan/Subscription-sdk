import { Router } from 'express'
import { SubscriptionService } from '../../modules/subscriptions/subscription.service'
import { DBPool } from '../../core/database'


import { logError } from '../../core/logger'

export const subscriptionRouter = (pool: DBPool) => {
  const router = Router()
  const subscriptionService = new SubscriptionService(pool)
  

  router.post('/', async (req, res) => {
    try {
      const subscription = await subscriptionService.create(req.body)
      res.status(201).json(subscription)
    } catch (err: any) {
      logError('subscriptions.create', err)
      res.status(500).json({ error: err.message || 'Failed to create subscription' })
    }
  })

  /* Get all subscribed plans of a customer */
router.get('/:id/subscriptions', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getCustomerSubscriptions(req.params.id)
    res.json(subscriptions)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer subscriptions' })
  }
})

/* Remove customer from a plan */
router.delete('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const result = await subscriptionService.removeFromPlan(req.params.subscriptionId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove customer from plan' })
  }
})
/* Get all customers subscribed to a plan */
router.get('/plan/:planId/customers',  async (req, res) => {
  try {
    const customers = await subscriptionService.findByPlan(req.params.planId as string)
    res.json(customers)
  } catch (err) {
    logError('subscriptions.findByPlan', err)
    res.status(500).json({ error: 'Failed to fetch plan customers' })
  }
})
return router
}