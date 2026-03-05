import type { FastifyInstance } from 'fastify';
import type { Server } from 'socket.io';
import type { RunRequest } from '@flowcap/shared';
import { WorkflowExecutor } from '../executor/WorkflowExecutor';
import { emitRunEvent, emitRunDone } from '../socket/runSocket';

export async function runRoutes(fastify: FastifyInstance, io: Server): Promise<void> {
  fastify.post<{ Body: RunRequest }>('/api/run', async (request, reply) => {
    const { workflow } = request.body;
    const executor = new WorkflowExecutor();

    // 비동기로 실행 (응답을 먼저 반환)
    setImmediate(() => {
      executor
        .execute(workflow, (event) => emitRunEvent(io, workflow.id, event))
        .then(() => emitRunDone(io, workflow.id))
        .catch((err: unknown) => {
          fastify.log.error({ err }, 'workflow execution failed');
          emitRunDone(io, workflow.id);
        });
    });

    return reply.status(202).send({ runId: workflow.id });
  });
}
