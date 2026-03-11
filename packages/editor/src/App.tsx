import { useState } from 'react';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { RunPanel } from './components/RunPanel';
import { NodeEditPanel } from './components/NodeEditPanel';
import { ImportPanel } from './components/ImportPanel';
import { NodePickerModal } from './components/NodePickerModal';
import { Sidebar } from './components/Sidebar';
import {
  ChevronDownIcon,
  ImportIcon,
  MenuIcon,
  MimicLogo,
  SparklesIcon,
} from './components/icons/AppIcons';

export function App(): JSX.Element {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="editor-shell">
      <Sidebar />

      <div className="editor-main">
        <header
          style={{
            height: 'var(--editor-header-height)',
            padding: '18px 22px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div className="editor-glass-panel" style={{ borderRadius: 20, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              style={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                background: '#fff',
                color: '#4b5563',
                cursor: 'pointer',
              }}
              title="메뉴"
            >
              <MenuIcon size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MimicLogo size={36} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Gabrielle_Moen</div>
                <div style={{ marginTop: 2, fontSize: 12, color: 'var(--editor-text-soft)' }}>Workflow Designer</div>
              </div>
              <ChevronDownIcon size={16} style={{ color: '#9ca3af' }} />
            </div>
          </div>

          <div className="editor-glass-panel" style={{ borderRadius: 20, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span className="editor-pill" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <SparklesIcon size={14} />
              Automation
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Content Ops Workflow</div>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--editor-text-soft)' }}>
                좌측 라이브러리에서 노드를 추가하고 캔버스에서 연결하세요.
              </div>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              onClick={() => setShowImport((value) => !value)}
              style={{
                height: 44,
                padding: '0 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 16,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                background: showImport ? '#111827' : '#ffffff',
                color: showImport ? '#ffffff' : '#111827',
                boxShadow: 'var(--editor-shadow-sm)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <ImportIcon size={16} />
              Import Workflow
            </button>

            {showImport && (
              <div
                className="editor-glass-panel"
                style={{
                  position: 'absolute',
                  top: 56,
                  right: 0,
                  width: 360,
                  borderRadius: 20,
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                <ImportPanel />
              </div>
            )}
          </div>
        </header>

        <div className="editor-canvas-surface">
          <WorkflowCanvas />
        </div>

        <RunPanel />
        <NodeEditPanel />
        <NodePickerModal />
      </div>
    </div>
  );
}
