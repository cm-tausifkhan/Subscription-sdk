import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createPool } from "./core/database";
import { runMigrations } from "./core/migrations";
import { plansRouter } from "./admin/routes/plans.routes";
import { featuresRouter } from "./admin/routes/features.routes";
import { pricingRouter } from "./admin/routes/pricing.routes";
import { customersRouter } from "./admin/routes/customers.routes";
import { authRouter } from "./admin/routes/auth.routes";
import { AuthService } from "./modules/auth/auth.service";

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

const pool = createPool(process.env.DATABASE_URL!);

/* Public routes - no token needed */
app.use("/api/auth", authRouter(pool));

/* Protected routes - token required */
app.use("/api/plans", plansRouter(pool));
app.use("/api/features", featuresRouter(pool));
app.use("/api/pricing", pricingRouter(pool));
app.use("/api/customers", customersRouter(pool));

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled error:", err);
});
const start = async () => {
  await runMigrations(pool);

  /* Seed hardcoded admin from .env on server start */
  const authService = new AuthService(pool);
  await authService.seedAdmin();

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });
};

start();
