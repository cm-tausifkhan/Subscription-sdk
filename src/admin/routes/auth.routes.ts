import { Router } from "express";
import { AuthService } from "../../modules/auth/auth.service";
import { DB } from "../../core/database";
import { authMiddleware, AuthRequest } from "../../middleware/auth.middleware";

export const authRouter = (pool: DB) => {
  const router = Router();
  const authService = new AuthService(pool);

  /* Login route */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || "Login failed" });
    }
  });

  /* Get current logged in user - protected route */
  router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  return router;
};
