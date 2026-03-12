import { useState } from 'react';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeEditPanel } from './components/NodeEditPanel';
import { ImportPanel } from './components/ImportPanel';
import { NodePickerModal } from './components/NodePickerModal';
import { Sidebar } from './components/Sidebar';
import { FlowIcon, ImportIcon, MimicLogo } from './components/icons/AppIcons';

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
            alignItems: 'stretch',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div
            className="editor-glass-panel"
            style={{
              borderRadius: 20,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 60,
              flexShrink: 0,
            }}
          >
            <MimicLogo size={36} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>MIMIC</div>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--editor-text-soft)' }}>Workflow Designer</div>
            </div>
          </div>

          <div
            className="editor-glass-panel"
            style={{
              borderRadius: 20,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
              flexShrink: 1,
              flexGrow: 1,
              overflow: 'hidden',
            }}
          >
            <span className="editor-pill" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <FlowIcon size={14} />
              Automation
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Content Ops Workflow</div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: 'var(--editor-text-soft)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Add nodes from the library and connect them on the canvas.
              </div>
            </div>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setShowImport((value) => !value)}
              style={{
                height: 60,
                width: 120,
                padding: '0 16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
        <NodeEditPanel />
        <NodePickerModal />
      </div>
    </div>
  );
}
