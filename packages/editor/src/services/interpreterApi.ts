import type { InterpretRequest, InterpretResponse } from '@flowcap/shared';

const INTERPRETER_URL = import.meta.env.VITE_INTERPRETER_URL as string;
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
        // 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(message);
    }

    return res.json() as Promise<InterpretResponse>;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('interpreter 응답 시간 초과 (30초). Render 콜드스타트 중일 수 있습니다.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
