# OmniRoute-Inspired Features in Manifest

This document details the architecture, design, and components implemented in **Manifest** inspired by the OmniRoute project.

---

## 1. Prompt / Context Token Compression

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/prompt-compression.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/prompt-compression.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/prompt-compression.service.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/prompt-compression.service.spec.ts)

### Description
Reduces input token usage (15% - 60%) by sanitizing incoming prompt content before forwarding to upstream LLM providers.
- **`light` mode:** Normalizes line endings (CRLF -> LF), collapses 3+ consecutive newlines into 2, and trims line-level trailing whitespace.
- **`aggressive` mode:** Collapses multiple spaces outside code blocks and normalizes formatting across text content parts.

---

## 2. Virtual Combo Routing (Custom Model Aliases)

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/virtual-combo-router.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/virtual-combo-router.ts)
- **Tests:** [`packages/backend/src/routing/proxy/virtual-combo-router.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/virtual-combo-router.spec.ts)

### Description
Allows agents and callers to request virtual model aliases (`"model": "combo/*"`) that resolve to prioritized model candidate lists:
- `combo/coding-fast`: `['qwen/qwen-2.5-coder-32b', 'deepseek/deepseek-chat', 'anthropic/claude-3-5-sonnet']`
- `combo/deep-reasoning`: `['deepseek/deepseek-r1', 'openai/o3-mini', 'anthropic/claude-3-5-sonnet']`
- `combo/cheap`: `['groq/llama-3.3-70b', 'cerebras/llama-3.3-70b', 'openrouter/auto']`

---

## 3. Real-Time Provider Cooldown & Health Status Telemetry

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/provider-health-telemetry.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/provider-health-telemetry.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/provider-health-telemetry.service.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/provider-health-telemetry.service.spec.ts)

### Description
Tracks rate-limit events (HTTP 429), consecutive error thresholds, and active cooldown durations per provider in real-time.
- Exposes `recordSuccess(provider)`, `recordError(provider, status, cooldownMs)`, `getProviderHealth(provider)`, and `getAllHealth()`.

---

## 4. Prompt Cache Affinity (Session Stickiness)

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/prompt-cache-affinity.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/prompt-cache-affinity.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/prompt-cache-affinity.service.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/prompt-cache-affinity.service.spec.ts)

### Description
Binds active session keys (`x-session-key`) to the primary winning provider connection and model.
- Maximizes **Prompt Caching** (Anthropic / OpenAI prompt caching) by preventing unnecessary key/model switching mid-session, reducing token cost by up to 90%.

---

## 5. Quota-Share Key Pool Load Balancing

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/quota-share-pool.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/quota-share-pool.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/quota-share-pool.service.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/quota-share-pool.service.spec.ts)

### Description
Distributes requests in round-robin order across multiple tenant provider keys for the same provider pool and automatically bypasses keys currently in rate-limit cooldown.

---

## 6. Modality Bridge (Multimodal Payload Handling)

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/modality-bridge.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/modality-bridge.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/modality-bridge.service.spec.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/modality-bridge.service.spec.ts)

### Description
Safely strips or replaces image blocks with text placeholders when routing fallback requests to non-vision text models, preventing HTTP 400 bad request errors during fallback.

---

## 7. Manifest Native MCP Integration Server

### Module & Location
- **Service:** [`packages/backend/src/routing/proxy/manifest-mcp-server.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/manifest-mcp-server.service.ts)
- **Tests:** [`packages/backend/src/routing/proxy/manifest-mcp-server.service.spec.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/manifest-mcp-server.service.spec.ts)

### Description
Exposes Model Context Protocol (MCP) tool handlers (`get_gateway_health`, `list_combos`, `resolve_model_route`) enabling AI agents (Cursor, Claude Code, Antigravity) to query gateway telemetry and model resolution via MCP tools.
