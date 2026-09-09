import { Injectable } from '@nestjs/common';

export interface SessionAffinity {
  sessionKey: string;
  tenantProviderId: string;
  model: string;
  provider: string;
  createdAt: number;
  lastUsedAt: number;
}

const DEFAULT_AFFINITY_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL

@Injectable()
export class PromptCacheAffinityService {
  private readonly affinityMap = new Map<string, SessionAffinity>();

  /**
   * Retrieves the active prompt cache affinity record for a session key.
   */
  getAffinity(sessionKey: string): SessionAffinity | null {
    if (!sessionKey) return null;
    const record = this.affinityMap.get(sessionKey);
    if (!record) return null;

    const now = Date.now();
    if (now - record.lastUsedAt > DEFAULT_AFFINITY_TTL_MS) {
      this.affinityMap.delete(sessionKey);
      return null;
    }

    record.lastUsedAt = now;
    return record;
  }

  /**
   * Binds a session key to a specific winning provider connection and model.
   */
  setAffinity(sessionKey: string, tenantProviderId: string, model: string, provider: string): void {
    if (!sessionKey || !provider) return;
    const now = Date.now();
    this.affinityMap.set(sessionKey, {
      sessionKey,
      tenantProviderId,
      model,
      provider,
      createdAt: now,
      lastUsedAt: now,
    });
  }

  /**
   * Clears the affinity record for a session key.
   */
  clearAffinity(sessionKey: string): void {
    if (sessionKey) {
      this.affinityMap.delete(sessionKey);
    }
  }
}
