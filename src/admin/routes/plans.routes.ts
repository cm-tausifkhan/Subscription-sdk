import { Router } from "express";
import { PlansService } from "../../modules/plans/plans.service";
import { DBPool } from "../../core/database";
import { authMiddleware, AuthRequest } from "../../middleware/auth.middleware";
import { logError } from '../../core/logger'

export const plansRouter = (pool: DBPool) => {
  const router = Router();
  const plansService = new PlansService(pool);

  /* Create plan - auth required, createdBy taken from token */
  router.post("/", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const plan = await plansService.create({
        ...req.body,
        createdBy: req.user!.id /* automatically taken from JWT token */,
      });
      res.status(201).json(plan);
    } catch (err) {
  logError('plans.create', err)
  res.status(500).json({ error: 'Failed to create plan' })
}
  });

  /* Get all plans */
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const plans = await plansService.findAll();
      res.json(plans);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  /* Get plan by ID */
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const plan = await plansService.findById(req.params.id as string);
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      res.json(plan);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  /* Update plan */
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const plan = await plansService.update(req.params.id as string, req.body);
      res.json(plan);
    } catch (err) {
      res.status(500).json({ error: "Failed to update plan" });
    }
  });

  /* Delete plan */
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const result = await plansService.delete(req.params.id as string);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete plan" });
    }
  });

  return router;
};
