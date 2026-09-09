import { Injectable } from '@nestjs/common';

export interface KeyPoolItem {
  id: string;
  label?: string;
  [key: string]: unknown;
}

@Injectable()
export class QuotaSharePoolService {
  private readonly roundRobinIndices = new Map<string, number>();
  private readonly keyCooldowns = new Map<string, number>();

  /**
   * Selects an available key from a pool using round-robin distribution, skipping key IDs in cooldown.
   */
  selectKey<T extends KeyPoolItem>(provider: string, keys: T[]): T | null {
    if (!keys || keys.length === 0) return null;

    const availableKeys = keys.filter((k) => this.isKeyAvailable(k.id));
    if (availableKeys.length === 0) {
      // If all keys are in cooldown, fall back to the first key
      return keys[0];
    }

    const providerKey = (provider || 'default').toLowerCase();
    const currentIndex = this.roundRobinIndices.get(providerKey) ?? 0;
    const selectedKey = availableKeys[currentIndex % availableKeys.length];

    this.roundRobinIndices.set(providerKey, (currentIndex + 1) % availableKeys.length);
    return selectedKey;
  }

  /**
   * Marks a specific key as rate-limited, putting it into cooldown.
   */
  markKeyRateLimited(keyId: string, cooldownMs: number = 60_000): void {
    if (!keyId) return;
    this.keyCooldowns.set(keyId, Date.now() + cooldownMs);
  }

  /**
   * Checks whether a key ID is currently available (not in cooldown).
   */
  isKeyAvailable(keyId: string): boolean {
    if (!keyId) return true;
    const cooldownUntil = this.keyCooldowns.get(keyId);
    if (!cooldownUntil) return true;

    if (Date.now() >= cooldownUntil) {
      this.keyCooldowns.delete(keyId);
      return true;
    }
    return false;
  }
}
