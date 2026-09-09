import { Injectable } from '@nestjs/common';

export interface ComboDefinition {
  id: string;
  name: string;
  description: string;
  candidates: string[];
}

export const BUILTIN_COMBOS: Record<string, ComboDefinition> = {
  'combo/coding-fast': {
    id: 'combo/coding-fast',
    name: 'Fast Coding Combo',
    description: 'High-speed code completion optimized for IDE latency',
    candidates: ['qwen/qwen-2.5-coder-32b', 'deepseek/deepseek-chat', 'anthropic/claude-3-5-sonnet'],
  },
  'combo/deep-reasoning': {
    id: 'combo/deep-reasoning',
    name: 'Deep Reasoning Combo',
    description: 'Advanced logical reasoning and architecture planning',
    candidates: ['deepseek/deepseek-r1', 'openai/o3-mini', 'anthropic/claude-3-5-sonnet'],
  },
  'combo/cheap': {
    id: 'combo/cheap',
    name: 'Cost-Optimized Combo',
    description: 'Lowest cost per million tokens across ultra-fast inference providers',
    candidates: ['groq/llama-3.3-70b', 'cerebras/llama-3.3-70b', 'openrouter/auto'],
  },
};

@Injectable()
export class VirtualComboRouter {
  /**
   * Checks if the requested model string is a virtual combo alias.
   */
  isCombo(requestedModel: string): boolean {
    if (!requestedModel) return false;
    const normalized = requestedModel.toLowerCase().trim();
    return normalized.startsWith('combo/') || Boolean(BUILTIN_COMBOS[normalized]);
  }

  /**
   * Resolves a requested combo alias into its prioritized candidate model list.
   * Returns null if the model is not a valid combo.
   */
  resolveCombo(requestedModel: string): string[] | null {
    if (!requestedModel) return null;
    const normalized = requestedModel.toLowerCase().trim();

    const comboKey = normalized.startsWith('combo/') ? normalized : `combo/${normalized}`;
    const definition = BUILTIN_COMBOS[comboKey];

    return definition ? [...definition.candidates] : null;
  }

  /**
   * Returns all available virtual combo definitions for UI selection & API documentation.
   */
  getAvailableCombos(): ComboDefinition[] {
    return Object.values(BUILTIN_COMBOS);
  }
}
