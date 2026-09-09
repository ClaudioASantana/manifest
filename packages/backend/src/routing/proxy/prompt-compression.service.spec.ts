import { PromptCompressionService } from './prompt-compression.service';

describe('PromptCompressionService', () => {
  let service: PromptCompressionService;

  beforeEach(() => {
    service = new PromptCompressionService();
  });

  it('returns text unchanged when mode is off', () => {
    const text = 'Hello   world!\n\n\n\nTest';
    expect(service.compressText(text, 'off')).toBe(text);
  });

  it('collapses multiple empty lines in light mode', () => {
    const text = 'Line 1\n\n\n\nLine 2';
    const compressed = service.compressText(text, 'light');
    expect(compressed).toBe('Line 1\n\nLine 2');
  });

  it('trims trailing whitespace on lines', () => {
    const text = 'Line 1   \nLine 2\t\t';
    const compressed = service.compressText(text, 'light');
    expect(compressed).toBe('Line 1\nLine 2');
  });

  it('collapses multiple spaces outside code blocks in aggressive mode', () => {
    const text = 'This   is    a   test.\n```js\nconst  x  =  1;\n```';
    const compressed = service.compressText(text, 'aggressive');
    expect(compressed).toBe('This is a test.\n```js\nconst  x  =  1;\n```');
  });

  it('compresses messages array with string content', () => {
    const messages = [
      { role: 'user', content: 'Hello    world!\n\n\n\nBye' },
    ];
    const compressed = service.compressMessages(messages, 'light');
    expect(compressed[0].content).toBe('Hello    world!\n\nBye');
  });

  it('compresses messages array with structured content parts', () => {
    const messages = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello   world!\n\n\nTest' }],
      },
    ];
    const compressed = service.compressMessages(messages, 'light');
    const content = compressed[0].content as Array<{ type: string; text?: string }>;
    expect(content[0].text).toBe('Hello   world!\n\nTest');
  });
});
