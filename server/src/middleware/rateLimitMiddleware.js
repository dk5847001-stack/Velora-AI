import { rateLimit } from "express-rate-limit";

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  namespace,
  message = "Too many requests. Please try again later.",
}) => {
  const safeWindowMs = Number(windowMs) > 0 ? Number(windowMs) : 60_000;
  const safeMaxRequests = Number(maxRequests) > 0 ? Number(maxRequests) : 60;
  const safeNamespace = namespace || "global";

  return rateLimit({
    windowMs: safeWindowMs,
    limit: safeMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${safeNamespace}:${req.ip || "unknown"}`,
    handler: (req, res) => {
      res.status(429).json({
        message,
      });
    },
  });
};
