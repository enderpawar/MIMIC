import type { Server } from 'socket.io';
import type { RunEvent } from '@flowcap/shared';

export function setupRunSocket(io: Server): void {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (runId: string) => {
      socket.join(runId);
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
