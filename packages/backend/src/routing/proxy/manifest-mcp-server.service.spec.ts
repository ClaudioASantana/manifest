import { ManifestMcpServerService } from './manifest-mcp-server.service';
import { ProviderHealthTelemetryService } from './provider-health-telemetry.service';
import { VirtualComboRouter } from './virtual-combo-router';

describe('ManifestMcpServerService', () => {
  let service: ManifestMcpServerService;
  let healthTelemetry: ProviderHealthTelemetryService;
  let comboRouter: VirtualComboRouter;

  beforeEach(() => {
    healthTelemetry = new ProviderHealthTelemetryService();
    comboRouter = new VirtualComboRouter();
    service = new ManifestMcpServerService(healthTelemetry, comboRouter);
  });

  it('handles get_gateway_health tool call', async () => {
    healthTelemetry.recordSuccess('openai');
    const result = await service.handleMcpToolCall('get_gateway_health');

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('openai');
    expect(result.content[0].text).toContain('healthy');
  });

  it('handles list_combos tool call', async () => {
    const result = await service.handleMcpToolCall('list_combos');

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('combo/coding-fast');
    expect(result.content[0].text).toContain('combo/deep-reasoning');
  });

  it('handles resolve_model_route tool call', async () => {
    const result = await service.handleMcpToolCall('resolve_model_route', { model: 'combo/coding-fast' });

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.isCombo).toBe(true);
    expect(parsed.candidateRoutes).toContain('qwen/qwen-2.5-coder-32b');
  });

  it('returns error for unknown tool call', async () => {
    const result = await service.handleMcpToolCall('unknown_tool');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool name');
  });
});
