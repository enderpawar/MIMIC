import { io, Socket } from 'socket.io-client';
import type { RunEvent } from '@flowcap/shared';

const RUNNER_URL = import.meta.env.VITE_RUNNER_URL as string;

let socket: Socket | null = null;

export function connectRunnerSocket(
  runId: string,
  onEvent: (event: RunEvent) => void,
  onDone: () => void
): () => void {
  socket = io(RUNNER_URL);

  socket.on(`run:${runId}:event`, (event: RunEvent) => {
    onEvent(event);
  });

  socket.on(`run:${runId}:done`, () => {
    onDone();
    socket?.disconnect();
  });

  return () => {
    socket?.disconnect();
    socket = null;
  };
}
