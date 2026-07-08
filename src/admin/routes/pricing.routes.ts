import { Router } from "express";
import { PricingService } from "../../modules/pricing/pricing.service";
import { DB } from "../../core/database";

export const pricingRouter = (pool: DB) => {
  const router = Router();
  const pricingService = new PricingService(pool);

  // Create pricing for a plan
  router.post("/", async (req, res) => {
    try {
      const pricing = await pricingService.create(req.body);
      res.status(201).json(pricing);
    } catch (err) {
      res.status(500).json({ error: "Failed to create pricing" });
    }
  });

  // Get pricing for a plan
  router.get("/plan/:planId", async (req, res) => {
    try {
      const pricing = await pricingService.findByPlan(req.params.planId);
      res.json(pricing);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  });

  // Update pricing
  router.put("/:id", async (req, res) => {
    try {
      const pricing = await pricingService.update(req.params.id, req.body);
      res.json(pricing);
    } catch (err) {
      res.status(500).json({ error: "Failed to update pricing" });
    }
  });

  // Delete pricing
  router.delete("/:id", async (req, res) => {
    try {
      const result = await pricingService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete pricing" });
    }
  });

  return router;
};
