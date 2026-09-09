import { QuotaSharePoolService } from './quota-share-pool.service';

describe('QuotaSharePoolService', () => {
  let service: QuotaSharePoolService;

  beforeEach(() => {
    service = new QuotaSharePoolService();
  });

  it('selects keys in round-robin order', () => {
    const keys = [{ id: 'key-1' }, { id: 'key-2' }];
    expect(service.selectKey('openai', keys)?.id).toBe('key-1');
    expect(service.selectKey('openai', keys)?.id).toBe('key-2');
    expect(service.selectKey('openai', keys)?.id).toBe('key-1');
  });

  it('skips key in cooldown', () => {
    const keys = [{ id: 'key-1' }, { id: 'key-2' }];
    service.markKeyRateLimited('key-1', 60_000);

    expect(service.isKeyAvailable('key-1')).toBe(false);
    expect(service.selectKey('openai', keys)?.id).toBe('key-2');
  });

  it('returns null for empty key pool', () => {
    expect(service.selectKey('openai', [])).toBeNull();
  });
});
