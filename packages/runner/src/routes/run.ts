import type { FastifyInstance } from 'fastify';
import type { Server } from 'socket.io';
import type { RunRequest } from '@flowcap/shared';
import { WorkflowExecutor } from '../executor/WorkflowExecutor';
import { emitRunEvent, emitRunDone, emitRunError } from '../socket/runSocket';

export async function runRoutes(fastify: FastifyInstance, io: Server): Promise<void> {
  fastify.post<{ Body: RunRequest }>('/api/run', async (request, reply) => {
    const { workflow } = request.body;
    const runId = crypto.randomUUID();
    const executor = new WorkflowExecutor();

    // 300ms 대기: 클라이언트가 socket room에 join할 시간을 확보
    setTimeout(() => {
      executor
        .execute({ ...workflow, id: runId }, (event) => emitRunEvent(io, runId, event))
        .then(() => emitRunDone(io, runId))
        .catch((err: unknown) => {
          fastify.log.error({ err }, 'workflow execution failed');
          emitRunError(io, runId, err instanceof Error ? err.message : 'Unknown error');
        });
    }, 300);

    return reply.status(202).send({ runId });
  });
}
