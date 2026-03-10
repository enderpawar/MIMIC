import { io, Socket } from 'socket.io-client';
import type { Workflow } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';

const RUNNER_URL = import.meta.env.VITE_RUNNER_URL as string;

let socket: Socket | null = null;

async function connectWithRetry(maxRetries = 3, intervalMs = 3000): Promise<Socket> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await new Promise<Socket>((resolve, reject) => {
        const s = io(RUNNER_URL, { timeout: 3000 });
        s.once('connect', () => resolve(s));
        s.once('connect_error', (err) => {
          s.disconnect();
          reject(err);
        });
      });
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
  }
  throw new Error('Runner에 연결할 수 없습니다 (3회 재시도 실패)');
}

export async function startRun(workflow: Workflow): Promise<void> {
  const { addRunEvent, setRunning, clearRunStatus, setRunError } =
    useWorkflowStore.getState();
  clearRunStatus();

  socket = await connectWithRetry();

  const res = await fetch(`${RUNNER_URL}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowId: workflow.id, workflow }),
  });
  if (!res.ok) throw new Error(`Runner 오류: ${res.status}`);

  const { runId } = (await res.json()) as { runId: string };
  socket.emit('joinRoom', runId);

  socket.on('run:event', addRunEvent);

  socket.on('run:done', () => {
    setRunning(false);
    socket?.disconnect();
    socket = null;
  });

  socket.on('run:error', ({ message }: { message: string }) => {
    setRunning(false);
    setRunError(message);
    socket?.disconnect();
    socket = null;
  });
}
