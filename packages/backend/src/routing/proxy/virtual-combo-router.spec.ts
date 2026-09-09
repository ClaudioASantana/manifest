import { VirtualComboRouter, BUILTIN_COMBOS } from './virtual-combo-router';

describe('VirtualComboRouter', () => {
  let router: VirtualComboRouter;

  beforeEach(() => {
    router = new VirtualComboRouter();
  });

  it('identifies valid combo model strings', () => {
    expect(router.isCombo('combo/coding-fast')).toBe(true);
    expect(router.isCombo('combo/deep-reasoning')).toBe(true);
    expect(router.isCombo('combo/cheap')).toBe(true);
    expect(router.isCombo('gpt-4o')).toBe(false);
    expect(router.isCombo('')).toBe(false);
  });

  it('resolves combo/coding-fast to candidate list', () => {
    const candidates = router.resolveCombo('combo/coding-fast');
    expect(candidates).toEqual([
      'qwen/qwen-2.5-coder-32b',
      'deepseek/deepseek-chat',
      'anthropic/claude-3-5-sonnet',
    ]);
  });

  it('resolves combo without combo/ prefix', () => {
    const candidates = router.resolveCombo('coding-fast');
    expect(candidates).toEqual(BUILTIN_COMBOS['combo/coding-fast'].candidates);
  });

  it('returns null for unknown combo', () => {
    expect(router.resolveCombo('combo/unknown')).toBeNull();
    expect(router.resolveCombo('claude-3-5-sonnet')).toBeNull();
  });

  it('returns list of available combos', () => {
    const available = router.getAvailableCombos();
    expect(available).toHaveLength(3);
    expect(available.map((c) => c.id)).toContain('combo/coding-fast');
  });
});
