import { ModalityBridgeService } from './modality-bridge.service';

describe('ModalityBridgeService', () => {
  let service: ModalityBridgeService;

  beforeEach(() => {
    service = new ModalityBridgeService();
  });

  it('identifies vision-capable models', () => {
    expect(service.supportsVision('gpt-4o')).toBe(true);
    expect(service.supportsVision('claude-3-5-sonnet')).toBe(true);
    expect(service.supportsVision('qwen-vl-max')).toBe(true);
    expect(service.supportsVision('deepseek-v3')).toBe(false);
  });

  it('leaves messages unchanged for vision models', () => {
    const messages = [
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,...' } }],
      },
    ];
    const sanitized = service.sanitizeForModel(messages, 'gpt-4o');
    expect(sanitized).toEqual(messages);
  });

  it('replaces image parts with text placeholder for text-only fallback model', () => {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image:' },
          { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
        ],
      },
    ];
    const sanitized = service.sanitizeForModel(messages, 'deepseek-v3');
    const content = sanitized[0].content as Array<{ type: string; text?: string }>;

    expect(content).toHaveLength(2);
    expect(content[1].type).toBe('text');
    expect(content[1].text).toContain('[Image attached: Removed for text-only model fallback]');
  });
});
