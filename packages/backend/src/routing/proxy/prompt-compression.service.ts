import { Injectable } from '@nestjs/common';

export type CompressionMode = 'off' | 'light' | 'aggressive';

export interface ChatMessageContent {
  role?: string;
  content?: string | Array<{ type: string; text?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

@Injectable()
export class PromptCompressionService {
  /**
   * Compresses an array of chat messages according to the selected mode.
   */
  compressMessages<T extends ChatMessageContent>(messages: T[], mode: CompressionMode = 'light'): T[] {
    if (mode === 'off' || !Array.isArray(messages)) {
      return messages;
    }

    return messages.map((msg) => {
      if (typeof msg.content === 'string') {
        return {
          ...msg,
          content: this.compressText(msg.content, mode),
        };
      }

      if (Array.isArray(msg.content)) {
        const compressedContent = msg.content.map((part) => {
          if (part.type === 'text' && typeof part.text === 'string') {
            return {
              ...part,
              text: this.compressText(part.text, mode),
            };
          }
          return part;
        });
        return {
          ...msg,
          content: compressedContent,
        };
      }

      return msg;
    });
  }

  /**
   * Compresses input text by stripping redundant whitespace and formatting.
   */
  compressText(text: string, mode: CompressionMode = 'light'): string {
    if (!text || mode === 'off') {
      return text;
    }

    let result = text;

    // Normalize Windows CRLF line endings to LF
    result = result.replace(/\r\n/g, '\n');

    // Collapse 3+ consecutive newlines into 2 (preserve paragraph breaks)
    result = result.replace(/\n{3,}/g, '\n\n');

    // Trim trailing whitespace per line
    result = result.replace(/[ \t]+$/gm, '');

    if (mode === 'aggressive') {
      // Collapse multiple spaces within non-code lines
      const lines = result.split('\n');
      let inCodeBlock = false;

      const compressedLines = lines.map((line) => {
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return line;
        }

        if (inCodeBlock) {
          return line;
        }

        // Collapse multiple spaces to single space outside code blocks
        return line.replace(/[ \t]{2,}/g, ' ');
      });

      result = compressedLines.join('\n');
    }

    return result.trim();
  }
}
