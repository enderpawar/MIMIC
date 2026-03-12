import type { InterpretRequest, InterpretResponse } from '@flowcap/shared';

const INTERPRETER_URL: string = import.meta.env.VITE_INTERPRETER_URL ?? 'http://localhost:8000';
const TIMEOUT_MS = 30_000;

export async function interpret(body: InterpretRequest): Promise<InterpretResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${INTERPRETER_URL}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let message = `interpret failed: ${res.status}`;
      try {
        const parsed = JSON.parse(text) as { detail?: string };
        if (parsed.detail) message = parsed.detail;
      } catch {
        // Use default message on parse failure
      }
      throw new Error(message);
    }

    return res.json() as Promise<InterpretResponse>;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Interpreter timeout (30s). Render may be cold starting.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
