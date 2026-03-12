import { useState } from 'react';
import type { CapturedAction } from '@flowcap/shared';
import { interpret } from '../services/interpreterApi';
import { useWorkflowStore } from '../store/workflowStore';
import { ImportIcon, SparklesIcon } from './icons/AppIcons';

type Status = 'idle' | 'loading' | 'success' | 'error';

const hasChrome = typeof chrome !== 'undefined';

export function ImportPanel(): JSX.Element {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);

  async function handleImport(): Promise<void> {
    setStatus('loading');
    setErrorMsg('');
    setConfidence(null);
    setWarnings([]);

    try {
      const actions = await readCapturedActions();

      if (actions.length === 0) {
        setStatus('error');
        setErrorMsg('No captured actions. Record in the extension first.');
        return;
      }

      const res = await interpret({
        sessionId: crypto.randomUUID(),
        actions,
      });

      // Interpreter may not set position; fallback to vertical layout
      const nodesWithPositions = res.workflow.nodes.map((node, i) => ({
        ...node,
        position: node.position ?? { x: 200, y: 80 + i * 140 },
      }));
      setWorkflow(nodesWithPositions, res.workflow.edges);
      setConfidence(res.confidence);
      setWarnings(res.warnings ?? []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  }

  if (!hasChrome) {
    return (
      <div style={panelStyle}>
        <SectionTitle />
        <div style={{
          margin: '12px 0',
          padding: '12px',
          background: '#fff7ed',
          borderRadius: 16,
          border: '1px solid #fed7aa',
          fontSize: 12,
          color: '#9a3412',
          lineHeight: 1.6,
        }}>
          Open the editor from the Chrome Extension popup, or run in an environment with the extension installed.
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <SectionTitle />

      <button
        onClick={() => { void handleImport(); }}
        disabled={status === 'loading'}
        style={btnStyle(status === 'loading')}
      >
        <ImportIcon size={15} />
        Import from extension
      </button>

      {status === 'loading' && <LoadingState />}
      {status === 'success' && <SuccessState confidence={confidence} warnings={warnings} onReset={() => setStatus('idle')} />}
      {status === 'error' && <ErrorState message={errorMsg} onRetry={() => { void handleImport(); }} />}
    </div>
  );
}

// Read capturedActions from chrome.storage.local
function readCapturedActions(): Promise<CapturedAction[]> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined') { resolve([]); return; }
    chrome.storage.local.get(['capturedActions'], (result: Record<string, unknown>) => {
      const actions = (result['capturedActions'] as CapturedAction[] | undefined) ?? [];
      resolve(actions);
    });
  });
}

function SectionTitle(): JSX.Element {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="editor-pill" style={{ background: '#eef2ff', color: '#4f46e5', width: 'fit-content' }}>
        <SparklesIcon size={14} />
        Import
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginTop: 12 }}>
        Import from extension
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
        Convert extension recording to workflow via AI
      </div>
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <Spinner />
      <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 1.5 }}>
        Generating workflow...<br />
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>First run may take up to 30s</span>
      </div>
    </div>
  );
}

function SuccessState({ confidence, warnings, onReset }: {
  confidence: number | null;
  warnings: string[];
  onReset: () => void;
}): JSX.Element {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        padding: '8px 12px',
        background: '#ecfdf5',
        border: '1px solid #86efac',
        borderRadius: 14,
        fontSize: 12,
        color: '#065f46',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>✓ Import complete</div>
        {confidence !== null && (
          <div>Confidence: <strong>{Math.round(confidence * 100)}%</strong></div>
        )}
      </div>
      {warnings.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#92400e' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠ Warnings</div>
          <ul style={{ margin: 0, padding: '0 0 0 14px', lineHeight: 1.6 }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      <button onClick={onReset} style={{ ...btnStyle(false), marginTop: 8, background: '#f3f4f6', color: '#374151' }}>
        Import again
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }): JSX.Element {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        padding: '8px 12px',
        background: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: 14,
        fontSize: 12,
        color: '#991b1b',
        lineHeight: 1.5,
      }}>
        ✕ {message}
      </div>
      <button onClick={onRetry} style={{ ...btnStyle(false), marginTop: 8 }}>
        Retry
      </button>
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <div style={{
      width: 28,
      height: 28,
      border: '3px solid #e5e7eb',
      borderTopColor: '#1a1a2e',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

const panelStyle: React.CSSProperties = {
  padding: 20,
  overflowY: 'auto',
  background: 'rgba(255,255,255,0.94)',
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: 46,
    background: disabled ? '#9ca3af' : '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };
}
