import Fastify from 'fastify';
import { Server } from 'socket.io';
import { runRoutes } from './routes/run';
import { setupRunSocket } from './socket/runSocket';

const PORT = Number(process.env.PORT ?? 3001);

const fastify = Fastify({ logger: true });

// socket.io는 fastify.server에 직접 연결
const io = new Server(fastify.server, {
  cors: { origin: '*' },
});
setupRunSocket(io);

fastify.get('/health', async () => ({ status: 'ok' }));

async function start(): Promise<void> {
  fastify.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
  });
  fastify.options('*', async (_req, reply) => reply.send());
  await runRoutes(fastify, io);
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
