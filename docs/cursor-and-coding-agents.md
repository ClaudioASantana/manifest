# Connecting Cursor IDE & Coding Agents to Manifest

This guide explains how to connect **Cursor IDE** and other AI-powered coding assistants (such as *Cline*, *Roo Code*, *Continue.dev*, and *Aider*) to **Manifest**.

## Overview

Manifest provides unified OpenAI-compatible (`/v1/chat/completions`) and Anthropic-compatible (`/v1/messages`) endpoints. Coding tools connect directly to Manifest to leverage dynamic model routing, fallback chains, cost tracking, and request logging.

---

## Cursor IDE Setup

To route your Cursor requests through Manifest:

1. Open **Cursor Settings** (`Cmd+,` on macOS / `Ctrl+,` on Windows/Linux) -> **Models**.
2. Turn **ON** `OpenAI API Key` and enter your Manifest key (e.g. `mk_...`).
3. Click **Override OpenAI Base URL** and enter your Manifest base endpoint:
   - **Cloud / Deployed Instance:** `https://your-manifest-domain/v1` (or `https://app.manifest.build/v1`)
   - **Local Docker Instance:** `http://localhost:2099/v1`
4. Set the default model to `auto` (or any model configured in your Manifest instance).

> [!NOTE]
> When running Manifest locally (`http://localhost:2099/v1`), if Cursor's cloud features cannot reach `localhost`, expose your local port via a public tunnel (such as Cloudflare Tunnel `cloudflared` or Pinggy) and set the resulting HTTPS URL in Cursor's `Base URL` field.

---

## Other Coding Agents

### Cline & Roo Code
In VS Code extension settings for Cline / Roo Code:
- **API Provider:** `OpenAI Compatible`
- **Base URL:** `https://your-manifest-domain/v1`
- **API Key:** `mk_YOUR_MANIFEST_KEY`
- **Model ID:** `auto`

### Continue.dev
In `~/.continue/config.json`:
```json
{
  "models": [
    {
      "title": "Manifest Auto",
      "provider": "openai",
      "model": "auto",
      "apiKey": "mk_YOUR_MANIFEST_KEY",
      "apiBase": "https://your-manifest-domain/v1"
    }
  ]
}
```

### Aider
Execute Aider with your Manifest credentials:
```bash
OPENAI_API_BASE="https://your-manifest-domain/v1" OPENAI_API_KEY="mk_YOUR_MANIFEST_KEY" aider --model openai/auto
```

---

## Analytics & Caller Attribution

Manifest inspects caller headers and automatically attributes request logs in the Analytics dashboard for:
- `cursor` (Cursor IDE)
- `cline` (Cline)
- `roo-code` (Roo Code)
- `continue` (Continue.dev)
- `aider` (Aider)
