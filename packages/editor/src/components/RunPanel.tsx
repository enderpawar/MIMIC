import { useWorkflowStore } from '../store/workflowStore';
import { startRun } from '../services/runnerSocket';

const STATUS_COLOR: Record<string, string> = {
  running: '#3b82f6',
  success: '#22c55e',
  failed:  '#ef4444',
};

export function RunPanel(): JSX.Element {
  const { nodes, edges, isRunning, runLog, runError, setRunning, setRunError } =
    useWorkflowStore();

  async function handleRun(): Promise<void> {
    setRunning(true);
    try {
      await startRun({
        id: crypto.randomUUID(),
        name: 'Untitled',
        nodes,
        edges,
        variables: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setRunning(false);
      setRunError(err instanceof Error ? err.message : '알 수 없는 오류');
    }
  }

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
      {/* 헤더 + 실행 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
        <button
          onClick={handleRun}
          disabled={isRunning}
          style={{
            padding: '5px 14px',
            background: isRunning ? '#94a3b8' : '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {isRunning ? '실행 중...' : '▶ 실행'}
        </button>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {runLog.length > 0 && `${runLog.length}개 이벤트`}
        </span>
      </div>

      {/* 에러 배너 */}
      {runError && (
        <div style={{
          margin: '0 12px 8px',
          padding: '6px 10px',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 4,
          color: '#dc2626',
          fontSize: 12,
        }}>
          오류: {runError}
        </div>
      )}

      {/* 실행 로그 */}
      {runLog.length > 0 && (
        <ul style={{
          margin: 0,
          padding: '0 12px 8px',
          listStyle: 'none',
          fontSize: 12,
          maxHeight: 140,
          overflowY: 'auto',
        }}>
          {runLog.map((e) => {
            const nodeLabel = nodes.find((n) => n.id === e.nodeId)?.label ?? e.nodeId;
            const time = new Date(e.timestamp).toLocaleTimeString();
            const color = STATUS_COLOR[e.status] ?? '#6b7280';
            return (
              <li key={`${e.nodeId}-${e.timestamp}`} style={{ padding: '2px 0', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>[{time}]</span>{' '}
                <span style={{ fontWeight: 500 }}>{nodeLabel}</span>{' '}
                <span style={{ color }}>— {e.status}</span>
                {e.message && (
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>({e.message})</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
