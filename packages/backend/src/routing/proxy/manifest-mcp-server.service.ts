import { Injectable } from '@nestjs/common';
import { ProviderHealthTelemetryService } from './provider-health-telemetry.service';
import { VirtualComboRouter } from './virtual-combo-router';

export interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

@Injectable()
export class ManifestMcpServerService {
  constructor(
    private readonly healthTelemetry: ProviderHealthTelemetryService,
    private readonly comboRouter: VirtualComboRouter,
  ) {}

  /**
   * Executes an MCP tool call and returns standard MCP result object.
   */
  async handleMcpToolCall(toolName: string, args: Record<string, unknown> = {}): Promise<McpToolResult> {
    switch (toolName) {
      case 'get_gateway_health':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(this.healthTelemetry.getAllHealth(), null, 2),
            },
          ],
        };

      case 'list_combos':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(this.comboRouter.getAvailableCombos(), null, 2),
            },
          ],
        };

      case 'resolve_model_route': {
        const model = (args.model as string) ?? 'auto';
        const isCombo = this.comboRouter.isCombo(model);
        const resolved = isCombo ? this.comboRouter.resolveCombo(model) : [model];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  requestedModel: model,
                  isCombo,
                  candidateRoutes: resolved,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Unknown tool name: ${toolName}`,
            },
          ],
        };
    }
  }
}
