import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./core/database";
import { getDBConfig } from "./core/config";
import { runMigrations } from "./migration";
import { plansRouter } from "./admin/routes/plans.routes";
import { featuresRouter } from "./admin/routes/features.routes";
import { pricingRouter } from "./admin/routes/pricing.routes";
import { customersRouter } from "./admin/routes/customers.routes";
import { authRouter } from "./admin/routes/auth.routes";
import { AuthService } from "./modules/auth/auth.service";
import { SubscriptionService } from "./modules/subscriptions/subscription.service";
import { subscriptionRouter } from "./admin/routes/subscription.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const db = initDB(getDBConfig());

/* Public routes - no token needed */
app.use("/api/auth", authRouter(db));

/* Protected routes - token required */
app.use("/api/plans", plansRouter(db));
app.use("/api/features", featuresRouter(db));
app.use("/api/pricing", pricingRouter(db));
app.use("/api/customers", customersRouter(db));
app.use("/api/subscriptions", subscriptionRouter(db));

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled error:", err);
});

const start = async () => {
  await runMigrations(db);

  /* Seed hardcoded admin from .env on server start */
  const authService = new AuthService(db);
  await authService.seedAdmin();

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });
};

start();
