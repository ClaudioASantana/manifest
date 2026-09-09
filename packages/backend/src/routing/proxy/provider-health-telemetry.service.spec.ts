import { ProviderHealthTelemetryService } from './provider-health-telemetry.service';

describe('ProviderHealthTelemetryService', () => {
  let service: ProviderHealthTelemetryService;

  beforeEach(() => {
    service = new ProviderHealthTelemetryService();
  });

  it('defaults to healthy for new provider', () => {
    const health = service.getProviderHealth('groq');
    expect(health.status).toBe('healthy');
    expect(health.consecutiveErrors).toBe(0);
    expect(health.cooldownRemainingMs).toBe(0);
  });

  it('sets status to cooldown on HTTP 429 rate limit', () => {
    service.recordError('groq', 429, 60_000);
    const health = service.getProviderHealth('groq');
    expect(health.status).toBe('cooldown');
    expect(health.lastErrorStatusCode).toBe(429);
    expect(health.cooldownRemainingMs).toBeGreaterThan(0);
  });

  it('resets cooldown on successful attempt', () => {
    service.recordError('openai', 429, 60_000);
    expect(service.getProviderHealth('openai').status).toBe('cooldown');

    service.recordSuccess('openai');
    const health = service.getProviderHealth('openai');
    expect(health.status).toBe('healthy');
    expect(health.consecutiveErrors).toBe(0);
    expect(health.cooldownRemainingMs).toBe(0);
  });

  it('returns all health records in getAllHealth()', () => {
    service.recordSuccess('openai');
    service.recordError('groq', 429);

    const all = service.getAllHealth();
    expect(Object.keys(all)).toContain('openai');
    expect(Object.keys(all)).toContain('groq');
    expect(all['groq'].status).toBe('cooldown');
  });
});
