import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { startRun } from '../services/runnerSocket';
import {
  ChartIcon,
  ChevronDownIcon,
  CloseIcon,
  PlayIcon,
  SettingsIcon,
  SparklesIcon,
} from './icons/AppIcons';
import { STATUS_BADGE_COLOR, STATUS_BADGE_ICON } from '../utils/statusColors';

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
      setRunError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const failedCount  = runLog.filter((e) => e.status === 'failed').length;
  const successCount = runLog.filter((e) => e.status === 'success').length;

  return (
    <>
      {/* Log drawer above toolbar */}
      {logOpen && runLog.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 96,
          left: 18,
          right: 18,
          maxHeight: 220,
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 22,
          overflowY: 'auto',
          zIndex: 49,
          padding: '10px 0',
          boxShadow: 'none',
          backdropFilter: 'blur(18px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>
              RUN LOG
            </span>
            <button
              onClick={() => setLogOpen(false)}
              style={{
                width: 30,
                height: 30,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={14} />
            </button>
          </div>
          <ul style={{ margin: 0, padding: '0 16px', listStyle: 'none', fontSize: 12 }}>
            {runLog.map((e) => {
              const nodeLabel = nodes.find((n) => n.id === e.nodeId)?.label ?? e.nodeId;
              const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour12: false });
              const color = STATUS_BADGE_COLOR[e.status] ?? '#6b7280';
              const icon  = STATUS_BADGE_ICON[e.status] ?? '·';
              return (
                <li key={`${e.nodeId}-${e.timestamp}`} style={{
                  padding: '8px 0',
                  color: '#D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'monospace',
                }}>
                  <span style={{ color: '#4B5563', minWidth: 60 }}>[{time}]</span>
                  <span style={{
                    color,
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 36,
                    display: 'inline-flex',
                    justifyContent: 'center',
                    padding: '4px 6px',
                    borderRadius: 999,
                    border: `1px solid ${color}30`,
                    background: `${color}14`,
                  }}>{icon}</span>
                  <span style={{ fontWeight: 500 }}>{nodeLabel}</span>
                  <span style={{ color: '#6B7280' }}>{e.status}</span>
                  {e.message && (
                    <span style={{ color: '#ef4444' }}>({e.message})</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Bottom toolbar */}
      <div style={{
        position: 'absolute',
        bottom: 18,
        left: 18,
        right: 18,
        height: 64,
        background: '#ffffff',
        border: 'none',
        borderRadius: 22,
        boxShadow: 'none',
        backdropFilter: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        gap: 12,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              height: 46,
              padding: '0 18px',
              background: isRunning ? '#9CA3AF' : '#111827',
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
            <PlayIcon size={12} />
            {isRunning ? 'Running...' : 'Run once'}
          </button>
          <button
            style={{
              width: 40,
              height: 46,
              background: isRunning ? '#9CA3AF' : '#111827',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Run options"
          >
            <ChevronDownIcon size={14} />
          </button>
        </div>

        {runLog.length > 0 && (
          <button
            onClick={() => setLogOpen((v) => !v)}
            style={{
              padding: '8px 12px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: 14,
              background: logOpen ? '#f3f4f6' : '#fff',
              cursor: 'pointer',
              fontSize: 12,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <SparklesIcon size={14} />
            Log {runLog.length}
            {successCount > 0 && (
              <span style={{ color: '#22c55e', fontWeight: 600 }}>✓{successCount}</span>
            )}
            {failedCount > 0 && (
              <span style={{ color: '#ef4444', fontWeight: 600 }}>✕{failedCount}</span>
            )}
          </button>
        )}

        {/* Error badge */}
        {runError && (
          <div style={{
            padding: '4px 10px',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
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

        {/* Tool buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { icon: <SettingsIcon size={16} />, title: 'Settings' },
            { icon: <ChartIcon size={16} />, title: 'Stats' },
            { icon: <SparklesIcon size={16} />, title: 'History' },
          ].map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              style={{
                width: 38,
                height: 38,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: 12,
                background: '#fff',
                cursor: 'pointer',
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
