/**
 * ollama-client.ts — Thin HTTP client for Ollama local API
 * Endpoint: http://localhost:11434
 */

export interface OllamaConfig {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface GenerateOptions {
  prompt: string;
  system?: string;
  /** Request JSON output from the model */
  jsonMode?: boolean;
}

const DEFAULT_URL   = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3:latest';

// ─── Client ───────────────────────────────────────────────────────────────────

export class OllamaClient {
  private baseUrl: string;
  readonly model: string;
  private temperature: number;
  private timeoutMs: number;

  constructor(cfg: OllamaConfig = {}) {
    this.baseUrl     = cfg.baseUrl    ?? DEFAULT_URL;
    this.model       = cfg.model      ?? DEFAULT_MODEL;
    this.temperature = cfg.temperature ?? 0.4;
    this.timeoutMs   = cfg.timeoutMs   ?? 120_000;
  }

  /** Check Ollama is reachable and the model exists */
  async ping(): Promise<{ ok: boolean; models: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return { ok: false, models: [] };
      const data = await res.json() as { models: { name: string }[] };
      return { ok: true, models: data.models.map(m => m.name) };
    } catch {
      return { ok: false, models: [] };
    }
  }

  /**
   * Generate text. Returns raw string.
   * Throws on network error or non-2xx status.
   */
  async generate(opts: GenerateOptions): Promise<string> {
    const body = {
      model:  this.model,
      prompt: opts.prompt,
      system: opts.system,
      stream: false,
      options: { temperature: this.temperature },
      ...(opts.jsonMode ? { format: 'json' } : {}),
    };

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama ${res.status}: ${text}`);
    }

    const data = await res.json() as { response: string };
    return data.response.trim();
  }

  /**
   * Generate and parse as JSON.
   * Retries up to `retries` times on parse failure.
   */
  async generateJSON<T>(opts: GenerateOptions, retries = 2): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const raw = await this.generate({ ...opts, jsonMode: true });
      try {
        // Extract first {...} or [...] block in case of surrounding text
        const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        return JSON.parse(match ? match[0] : raw) as T;
      } catch {
        if (attempt === retries) throw new Error(`JSON parse failed after ${retries + 1} attempts.\nRaw: ${raw.slice(0, 300)}`);
        // add a nudge on retry
        opts = { ...opts, prompt: opts.prompt + '\n\nIMPORTANT: Respond with valid JSON only, no other text.' };
      }
    }
    throw new Error('unreachable');
  }
}
