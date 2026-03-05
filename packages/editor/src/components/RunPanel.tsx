import type { RunRequest } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import { connectRunnerSocket } from '../services/runnerSocket';

const RUNNER_URL = import.meta.env.VITE_RUNNER_URL as string;

export function RunPanel(): JSX.Element {
  const { nodes, edges, isRunning, runLog, setRunning, addRunEvent } = useWorkflowStore();

  async function handleRun(): Promise<void> {
    const workflowId = crypto.randomUUID();
    const body: RunRequest = {
      workflowId,
      workflow: {
        id: workflowId,
        name: 'Untitled',
        nodes,
        edges,
        variables: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setRunning(true);
    connectRunnerSocket(workflowId, addRunEvent, () => setRunning(false));

    const res = await fetch(`${RUNNER_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setRunning(false);
    }
  }

  return (
    <div style={{ padding: 12, borderTop: '1px solid #ddd' }}>
      <button onClick={handleRun} disabled={isRunning}>
        {isRunning ? '실행 중...' : '워크플로우 실행'}
      </button>
      <ul style={{ marginTop: 8, listStyle: 'none', padding: 0, fontSize: 12 }}>
        {runLog.map((e, i) => (
          <li key={i}>[{e.status}] node:{e.nodeId} {e.message ?? ''}</li>
        ))}
      </ul>
    </div>
  );
}
