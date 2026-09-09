import { Injectable } from '@nestjs/common';

export interface ProviderHealthStatus {
  provider: string;
  status: 'healthy' | 'cooldown' | 'degraded';
  cooldownRemainingMs: number;
  consecutiveErrors: number;
  lastErrorStatusCode: number | null;
  lastSuccessTimestamp: number | null;
  lastErrorTimestamp: number | null;
}

const DEFAULT_COOLDOWN_MS = 60_000; // 60 seconds default cooldown on 429

@Injectable()
export class ProviderHealthTelemetryService {
  private readonly healthMap = new Map<string, ProviderHealthStatus>();

  /**
   * Records a successful provider attempt, clearing active cooldown and resetting consecutive errors.
   */
  recordSuccess(provider: string): void {
    if (!provider) return;
    const key = provider.toLowerCase();
    const current = this.getOrCreate(key);

    this.healthMap.set(key, {
      ...current,
      status: 'healthy',
      cooldownRemainingMs: 0,
      consecutiveErrors: 0,
      lastSuccessTimestamp: Date.now(),
    });
  }

  /**
   * Records a provider error (e.g. HTTP 429, 503, 504), setting cooldown if rate-limited.
   */
  recordError(provider: string, statusCode?: number, cooldownMs?: number): void {
    if (!provider) return;
    const key = provider.toLowerCase();
    const current = this.getOrCreate(key);
    const now = Date.now();
    const isRateLimit = statusCode === 429;
    const isServerError = statusCode && statusCode >= 500;

    const duration = cooldownMs ?? (isRateLimit ? DEFAULT_COOLDOWN_MS : 15_000);
    const consecutive = current.consecutiveErrors + 1;
    const isCooldown = isRateLimit || (isServerError && consecutive >= 3);

    this.healthMap.set(key, {
      ...current,
      status: isCooldown ? 'cooldown' : consecutive >= 2 ? 'degraded' : 'healthy',
      cooldownRemainingMs: isCooldown ? duration : 0,
      consecutiveErrors: consecutive,
      lastErrorStatusCode: statusCode ?? null,
      lastErrorTimestamp: now,
    });
  }

  /**
   * Gets the current health status of a specific provider.
   */
  getProviderHealth(provider: string): ProviderHealthStatus {
    if (!provider) {
      return {
        provider: 'unknown',
        status: 'healthy',
        cooldownRemainingMs: 0,
        consecutiveErrors: 0,
        lastErrorStatusCode: null,
        lastSuccessTimestamp: null,
        lastErrorTimestamp: null,
      };
    }

    const key = provider.toLowerCase();
    const current = this.getOrCreate(key);
    const now = Date.now();

    // Check if cooldown has expired
    if (current.status === 'cooldown' && current.lastErrorTimestamp) {
      const elapsed = now - current.lastErrorTimestamp;
      if (elapsed >= current.cooldownRemainingMs) {
        return {
          ...current,
          status: 'healthy',
          cooldownRemainingMs: 0,
        };
      }
      return {
        ...current,
        cooldownRemainingMs: Math.max(0, current.cooldownRemainingMs - elapsed),
      };
    }

    return current;
  }

  /**
   * Returns health status map for all tracked providers.
   */
  getAllHealth(): Record<string, ProviderHealthStatus> {
    const result: Record<string, ProviderHealthStatus> = {};
    for (const [key] of this.healthMap) {
      result[key] = this.getProviderHealth(key);
    }
    return result;
  }

  private getOrCreate(key: string): ProviderHealthStatus {
    const existing = this.healthMap.get(key);
    if (existing) return existing;

    const initial: ProviderHealthStatus = {
      provider: key,
      status: 'healthy',
      cooldownRemainingMs: 0,
      consecutiveErrors: 0,
      lastErrorStatusCode: null,
      lastSuccessTimestamp: null,
      lastErrorTimestamp: null,
    };
    this.healthMap.set(key, initial);
    return initial;
  }
}
