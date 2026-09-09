import { Injectable } from '@nestjs/common';

export interface MultimodalContentPart {
  type: string;
  text?: string;
  image_url?: { url: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface ChatMessage {
  role?: string;
  content?: string | MultimodalContentPart[];
  [key: string]: unknown;
}

const KNOWN_VISION_MODELS = new Set([
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'claude-3-opus',
  'claude-3-haiku',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'qwen-vl-max',
]);

@Injectable()
export class ModalityBridgeService {
  /**
   * Checks whether a target model supports vision / image inputs natively.
   */
  supportsVision(model: string): boolean {
    if (!model) return false;
    const normalized = model.toLowerCase();
    for (const visionModel of KNOWN_VISION_MODELS) {
      if (normalized.includes(visionModel)) {
        return true;
      }
    }
    return normalized.includes('vl') || normalized.includes('vision');
  }

  /**
   * Sanitizes payload messages for non-vision fallback models by replacing image content parts with text placeholders.
   */
  sanitizeForModel<T extends ChatMessage>(messages: T[], targetModel: string): T[] {
    if (!Array.isArray(messages) || this.supportsVision(targetModel)) {
      return messages;
    }

    return messages.map((msg) => {
      if (!Array.isArray(msg.content)) {
        return msg;
      }

      const sanitizedContent: MultimodalContentPart[] = msg.content.map((part) => {
        if (part.type === 'image_url' || part.image_url) {
          return {
            type: 'text',
            text: '[Image attached: Removed for text-only model fallback]',
          };
        }
        return part;
      });

      return {
        ...msg,
        content: sanitizedContent,
      };
    });
  }
}
