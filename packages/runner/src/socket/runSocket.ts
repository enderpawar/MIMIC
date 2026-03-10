import type { Server } from 'socket.io';
import type { RunEvent } from '@flowcap/shared';

// runId → 실행 시작 콜백. 클라이언트가 joinRoom을 보내는 순간 실행이 트리거됨.
const pendingRuns = new Map<string, () => void>();
// 클라이언트가 30초 내 joinRoom을 보내지 않으면 자동 정리
const PENDING_TTL_MS = 30_000;

export function registerPendingRun(runId: string, start: () => void): void {
  pendingRuns.set(runId, start);
  setTimeout(() => pendingRuns.delete(runId), PENDING_TTL_MS);
}

export function setupRunSocket(io: Server): void {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (runId: string) => {
      socket.join(runId);
      const start = pendingRuns.get(runId);
      if (start) {
        pendingRuns.delete(runId);
        start();
      }
    });
  });
}

export function emitRunEvent(io: Server, runId: string, event: RunEvent): void {
  io.to(runId).emit('run:event', event);
}

export function emitRunDone(io: Server, runId: string): void {
  io.to(runId).emit('run:done');
}

export function emitRunError(io: Server, runId: string, message: string): void {
  io.to(runId).emit('run:error', { message });
}
