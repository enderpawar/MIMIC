import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { startRun } from '../services/runnerSocket';

const STATUS_COLOR: Record<string, string> = {
  running: '#3b82f6',
  success: '#22c55e',
  failed:  '#ef4444',
};

const STATUS_ICON: Record<string, string> = {
  running: '⏳',
  success: '✓',
  failed:  '✕',
};

export function RunPanel(): JSX.Element {
  const { nodes, edges, isRunning, runLog, runError, setRunning, setRunError, clearRunStatus } =
    useWorkflowStore();
  const [logOpen, setLogOpen] = useState(false);

  async function handleRun(): Promise<void> {
    clearRunStatus();
    setRunning(true);
    setLogOpen(true);
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

  const failedCount  = runLog.filter((e) => e.status === 'failed').length;
  const successCount = runLog.filter((e) => e.status === 'success').length;

  return (
    <>
      {/* 로그 드로어 — 툴바 위로 펼쳐짐 */}
      {logOpen && runLog.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 56,
          left: 0,
          right: 0,
          maxHeight: 220,
          background: '#1E1E2E',
          borderTop: '1px solid #374151',
          overflowY: 'auto',
          zIndex: 49,
          padding: '8px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px 6px', borderBottom: '1px solid #374151', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>
              RUN LOG
            </span>
            <button
              onClick={() => setLogOpen(false)}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
          <ul style={{ margin: 0, padding: '0 16px', listStyle: 'none', fontSize: 12 }}>
            {runLog.map((e) => {
              const nodeLabel = nodes.find((n) => n.id === e.nodeId)?.label ?? e.nodeId;
              const time = new Date(e.timestamp).toLocaleTimeString('ko-KR', { hour12: false });
              const color = STATUS_COLOR[e.status] ?? '#6b7280';
              const icon  = STATUS_ICON[e.status] ?? '·';
              return (
                <li key={`${e.nodeId}-${e.timestamp}`} style={{
                  padding: '3px 0',
                  color: '#D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'monospace',
                }}>
                  <span style={{ color: '#4B5563', minWidth: 60 }}>[{time}]</span>
                  <span style={{ color, fontSize: 13 }}>{icon}</span>
                  <span style={{ fontWeight: 500 }}>{nodeLabel}</span>
                  <span style={{ color: '#6B7280' }}>— {e.status}</span>
                  {e.message && (
                    <span style={{ color: '#ef4444' }}>({e.message})</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 하단 고정 툴바 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#fff',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        zIndex: 50,
      }}>
        {/* Run once 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(124,58,237,0.25)' }}>
          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              padding: '8px 16px',
              background: isRunning ? '#9CA3AF' : '#7C3AED',
              color: '#fff',
              border: 'none',
              borderRight: '1px solid rgba(255,255,255,0.2)',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 11 }}>▶</span>
            {isRunning ? '실행 중...' : 'Run once'}
          </button>
          <button
            style={{
              padding: '8px 10px',
              background: isRunning ? '#9CA3AF' : '#7C3AED',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
            }}
            title="실행 옵션"
          >
            ▾
          </button>
        </div>

        {/* 구분선 */}
        <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

        {/* 로그 토글 버튼 */}
        {runLog.length > 0 && (
          <button
            onClick={() => setLogOpen((v) => !v)}
            style={{
              padding: '5px 10px',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              background: logOpen ? '#F3F4F6' : '#fff',
              cursor: 'pointer',
              fontSize: 12,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📋</span>
            로그 {runLog.length}개
            {successCount > 0 && (
              <span style={{ color: '#22c55e', fontWeight: 600 }}>✓{successCount}</span>
            )}
            {failedCount > 0 && (
              <span style={{ color: '#ef4444', fontWeight: 600 }}>✕{failedCount}</span>
            )}
          </button>
        )}

        {/* 에러 배지 */}
        {runError && (
          <div style={{
            padding: '4px 10px',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 6,
            color: '#DC2626',
            fontSize: 12,
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            ⚠ {runError}
          </div>
        )}

        {/* 우측 정렬 도구 버튼들 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { icon: '⚙', title: '설정' },
            { icon: '📊', title: '통계' },
            { icon: '↺', title: '히스토리' },
          ].map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              style={{
                width: 32,
                height: 32,
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
