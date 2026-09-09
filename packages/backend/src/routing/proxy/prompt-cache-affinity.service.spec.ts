import { PromptCacheAffinityService } from './prompt-cache-affinity.service';

describe('PromptCacheAffinityService', () => {
  let service: PromptCacheAffinityService;

  beforeEach(() => {
    service = new PromptCacheAffinityService();
  });

  it('returns null when no affinity exists for session key', () => {
    expect(service.getAffinity('session-123')).toBeNull();
  });

  it('stores and retrieves session affinity', () => {
    service.setAffinity('session-123', 'tp-1', 'claude-3-5-sonnet', 'anthropic');
    const affinity = service.getAffinity('session-123');

    expect(affinity).not.toBeNull();
    expect(affinity?.tenantProviderId).toBe('tp-1');
    expect(affinity?.model).toBe('claude-3-5-sonnet');
    expect(affinity?.provider).toBe('anthropic');
  });

  it('clears session affinity', () => {
    service.setAffinity('session-123', 'tp-1', 'claude-3-5-sonnet', 'anthropic');
    expect(service.getAffinity('session-123')).not.toBeNull();

    service.clearAffinity('session-123');
    expect(service.getAffinity('session-123')).toBeNull();
  });
});
