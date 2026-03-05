import type { InterpretRequest, InterpretResponse } from '@flowcap/shared';

const INTERPRETER_URL = import.meta.env.VITE_INTERPRETER_URL as string;

export async function interpret(body: InterpretRequest): Promise<InterpretResponse> {
  const res = await fetch(`${INTERPRETER_URL}/api/interpret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`interpret failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<InterpretResponse>;
}
