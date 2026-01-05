interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMITS: Record<string, RateLimitEntry> = {};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000; 

export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingTime?: number;
  message?: string;
} {
  const now = Date.now();
  const entry = RATE_LIMITS[key];

  if (!entry) {
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const timeSinceReset = now - entry.resetTime;
    if (timeSinceReset < LOCKOUT_MS) {
      const remaining = Math.ceil((LOCKOUT_MS - timeSinceReset) / 1000 / 60);
      return {
        allowed: false,
        remainingTime: remaining,
        message: `Muitas tentativas. Tente novamente em ${remaining} minutos.`,
      };
    } else {
      delete RATE_LIMITS[key];
      return { allowed: true };
    }
  }

  const timeSinceReset = now - entry.resetTime;
  if (timeSinceReset < WINDOW_MS) {
    return { allowed: true };
  } else {
    delete RATE_LIMITS[key];
    return { allowed: true };
  }
}

export function recordAttempt(key: string): void {
  const now = Date.now();
  const entry = RATE_LIMITS[key];

  if (!entry) {
    RATE_LIMITS[key] = {
      count: 1,
      resetTime: now,
    };
    return;
  }

  const timeSinceReset = now - entry.resetTime;

  if (timeSinceReset >= WINDOW_MS) {
    RATE_LIMITS[key] = {
      count: 1,
      resetTime: now,
    };
  } else {
    entry.count += 1;
  }
}

export function resetRateLimit(key: string): void {
  delete RATE_LIMITS[key];
}

export function getRemainingAttempts(key: string): number {
  const entry = RATE_LIMITS[key];
  if (!entry) {
    return MAX_ATTEMPTS;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return 0;
  }

  return MAX_ATTEMPTS - entry.count;
}

