import type { Server } from 'socket.io';
import type { RunEvent } from '@flowcap/shared';

export function emitRunEvent(io: Server, runId: string, event: RunEvent): void {
  io.emit(`run:${runId}:event`, event);
}

export function emitRunDone(io: Server, runId: string): void {
  io.emit(`run:${runId}:done`);
}
