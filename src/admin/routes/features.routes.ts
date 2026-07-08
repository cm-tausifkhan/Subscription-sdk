import { Router } from "express";
import { FeaturesService } from "../../modules/features/features.service";
import { DB } from "../../core/database";

export const featuresRouter = (pool: DB) => {
  const router = Router();
  const featuresService = new FeaturesService(pool);

  // Add feature to a plan
  router.post("/", async (req, res) => {
    try {
      const feature = await featuresService.create(req.body);
      res.status(201).json(feature);
    } catch (err) {
      res.status(500).json({ error: "Failed to create feature" });
    }
  });

  // Get all features for a plan
  router.get("/plan/:planId", async (req, res) => {
    try {
      const features = await featuresService.findByPlan(req.params.planId);
      res.json(features);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch features" });
    }
  });

  // Update a feature
  router.put("/:id", async (req, res) => {
    try {
      const feature = await featuresService.update(req.params.id, req.body);
      res.json(feature);
    } catch (err) {
      res.status(500).json({ error: "Failed to update feature" });
    }
  });

  // Delete a feature
  router.delete("/:id", async (req, res) => {
    try {
      const result = await featuresService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete feature" });
    }
  });

  // Delete all features of a plan
  router.delete("/plan/:planId", async (req, res) => {
    try {
      const result = await featuresService.deleteByPlan(req.params.planId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete features" });
    }
  });

  // Enable or disable a feature
  router.patch("/:id/toggle", async (req, res) => {
    try {
      const { isEnabled } = req.body;
      const feature = await featuresService.toggleFeature(
        req.params.id,
        isEnabled,
      );
      res.json(feature);
    } catch (err) {
      res.status(500).json({ error: "Failed to toggle feature" });
    }
  });

  return router;
};
