import express from "express";

import {
  getCurrentUser,
  login,
  logout,
  signup,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
const authRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 12,
  namespace: "auth",
  message: "Too many authentication attempts. Please try again shortly.",
});

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);

export default router;
