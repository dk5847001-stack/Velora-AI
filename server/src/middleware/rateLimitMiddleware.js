const RATE_LIMIT_BUCKETS = new Map();

const getClientKey = (req, namespace) => {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwardedIp = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : "";
  const ipAddress = firstForwardedIp || req.ip || req.socket?.remoteAddress || "unknown";
  return `${namespace}:${ipAddress}`;
};

const cleanupExpiredBuckets = (now) => {
  for (const [key, bucket] of RATE_LIMIT_BUCKETS.entries()) {
    if (bucket.resetAt <= now) {
      RATE_LIMIT_BUCKETS.delete(key);
    }
  }
};

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  namespace,
  message = "Too many requests. Please try again later.",
}) => {
  const safeWindowMs = Number(windowMs) > 0 ? Number(windowMs) : 60_000;
  const safeMaxRequests = Number(maxRequests) > 0 ? Number(maxRequests) : 60;
  const safeNamespace = namespace || "global";

  return (req, res, next) => {
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const key = getClientKey(req, safeNamespace);
    const currentBucket = RATE_LIMIT_BUCKETS.get(key);

    if (!currentBucket || currentBucket.resetAt <= now) {
      RATE_LIMIT_BUCKETS.set(key, {
        count: 1,
        resetAt: now + safeWindowMs,
      });
      return next();
    }

    currentBucket.count += 1;

    if (currentBucket.count > safeMaxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((currentBucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message,
      });
    }

    return next();
  };
};
