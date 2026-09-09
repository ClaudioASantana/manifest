# Architecture & Implementation Plan: OmniRoute-Inspired Enhancements for Manifest

This document outlines the design and step-by-step implementation plan for integrating key high-value features inspired by OmniRoute into **Manifest**.

---

## 1. Prompt / Context Token Compression Middleware

### Objective
Reduce input token usage by 15% to 60% by stripping excessive whitespace, redundant system prompt formatting, duplicate lines, and comments from incoming agent requests before forwarding them to upstream providers.

### Key Components & Files
- **Backend Service:** [`packages/backend/src/routing/proxy/prompt-compression.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/prompt-compression.service.ts)
  - Implements lightweight token compression (`compressPrompt` / `compressMessages`).
  - Supports configurable compression modes: `off`, `light` (whitespace/formatting cleanup), and `aggressive` (deduplication + prompt trimming).
- **Proxy Controller Integration:** [`packages/backend/src/routing/proxy/proxy.controller.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/proxy.controller.ts)
  - Applies prompt compression when `x-manifest-compression` header is present or when enabled in tenant settings.

---

## 2. Virtual Route Combos & Custom Model Aliases

### Objective
Allow agents to specify custom model aliases (e.g., `"model": "combo/coding-fast"`, `"model": "combo/reasoning"`) that map directly to prioritized candidate model chains and fallback rules.

### Key Components & Files
- **Combo Router Service:** [`packages/backend/src/routing/proxy/virtual-combo-router.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/virtual-combo-router.ts)
  - Resolves combo aliases (`combo/*`) into an ordered list of model candidates.
  - Built-in combos:
    - `combo/coding-fast`: Qwen Coder / DeepSeek V3 / Claude Sonnet
    - `combo/deep-reasoning`: DeepSeek R1 / OpenAI o-series / Claude Opus
    - `combo/cheap`: Free & lowest-cost models across providers
- **Proxy Controller / Service Integration:**
  - Plugs into model resolution in [`proxy.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/proxy.service.ts) before provider dispatch.

---

## 3. Real-Time Provider Cooldown & Health Status Telemetry

### Objective
Expose real-time provider health, rate-limit cooldown status, and error telemetry so developers and UI dashboards can monitor provider availability live.

### Key Components & Files
- **Health Telemetry Service:** [`packages/backend/src/routing/proxy/provider-health-telemetry.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/provider-health-telemetry.service.ts)
  - Tracks provider rate-limits (HTTP 429), consecutive errors, and active cooldown timers.
- **Health Controller Endpoint:** [`packages/backend/src/routing/proxy/provider-health.controller.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/provider-health.controller.ts)
  - Exposes `GET /v1/providers/health` reporting live status, active cooldown seconds, and success rates.

---

## 4. Zero-Config Trial Mode

### Objective
Provide instant out-of-the-box response capability for fresh Manifest deployments before users set up API keys.

### Key Components & Files
- **Zero-Config Fallback Handler:** Integrated into [`proxy.service.ts`](file:///home/gattsu/repos/manifest/packages/backend/src/routing/proxy/proxy.service.ts)
  - Automatically routes requests with `"model": "auto"` to public/free trial tier providers when no custom keys exist.

---

## Verification & Testing Plan
- Add unit tests for prompt compression in `prompt-compression.service.spec.ts`.
- Add unit tests for virtual combo routing in `virtual-combo-router.spec.ts`.
- Add unit tests for provider health telemetry in `provider-health-telemetry.service.spec.ts`.
