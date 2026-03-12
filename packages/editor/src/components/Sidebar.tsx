import type { JSX } from 'react';
import {
  ChartIcon,
  FileIcon,
  HomeIcon,
  LayersIcon,
  MessageIcon,
  MimicLogo,
  NodeBadge,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from './icons/AppIcons';
import { useWorkflowStore } from '../store/workflowStore';
import { createDefaultNode } from './NodePickerModal';
import { NODE_DEFINITIONS } from '../constants/nodeDefinitions';

const RAIL_ITEMS = [
  { id: 'home', icon: <HomeIcon size={18} />, active: true },
  { id: 'layers', icon: <LayersIcon size={18} /> },
  { id: 'messages', icon: <MessageIcon size={18} /> },
  { id: 'files', icon: <FileIcon size={18} /> },
  { id: 'charts', icon: <ChartIcon size={18} /> },
  { id: 'settings', icon: <SettingsIcon size={18} /> },
  { id: 'users', icon: <UsersIcon size={18} /> },
];

export function Sidebar(): JSX.Element {
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  function handleAdd(type: (typeof NODE_DEFINITIONS)[number]['type']): void {
    const index = nodes.length;
    addNode(createDefaultNode(type, { x: 140 + index * 70, y: 120 + index * 36 }));
  }

  return (
    <aside
      style={{
        width: 'var(--editor-app-sidebar-width)',
        display: 'flex',
        flexShrink: 0,
        borderRight: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      <div
        style={{
          width: 'var(--editor-rail-width)',
          background: 'var(--editor-sidebar-bg)',
          color: '#fff',
          padding: '16px 0 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <MimicLogo size={34} />

        {RAIL_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            style={{
              width: 42,
              height: 42,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 14,
              border: '1px solid transparent',
              background: item.active ? 'rgba(255,255,255,0.14)' : 'transparent',
              color: item.active ? '#ffffff' : 'var(--editor-sidebar-muted)',
              cursor: 'pointer',
            }}
          >
            {item.icon}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div
          style={{
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          U
        </div>
      </div>

      <div
        className="editor-scrollbar"
        style={{
          width: 'var(--editor-sidebar-width)',
          padding: '22px 18px',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="editor-section-title">Node Library</div>
            <p className="editor-section-caption" style={{ marginTop: 6 }}>
              Add node cards from the library.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 16,
              background: '#ffffff',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: 'var(--editor-shadow-sm)',
            }}
          >
            <SearchIcon size={16} style={{ color: '#9ca3af' }} />
            <span style={{ fontSize: 13, color: '#98a0ae' }}>Search nodes, apps, triggers...</span>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
              color: '#fff',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.22)',
            }}
          >
            <div className="editor-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}>
              Featured
            </div>
            <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700 }}>Build automation faster</div>
            <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.76)' }}>
              Combine start, action, wait, and condition nodes to build your workflow.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NODE_DEFINITIONS.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleAdd(item.type)}
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  borderRadius: 18,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#fff',
                  boxShadow: 'var(--editor-shadow-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <NodeBadge tone={item.tone} background={item.background}>
                  {item.icon}
                </NodeBadge>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.label}</div>
                  <div style={{ marginTop: 2, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{item.subtitle}</div>
                  <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#6b7280' }}>{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
