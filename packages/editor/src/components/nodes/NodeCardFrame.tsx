import type { CSSProperties, ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CloseIcon } from '../icons/AppIcons';

type NodeStatus = 'running' | 'success' | 'failed' | undefined;

interface EdgeHandleConfig {
  id?: string;
  color: string;
  top?: string;
  label?: string;
}

interface NodeCardFrameProps {
  accentColor: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: ReactNode;
  status: NodeStatus;
  orderIndex: number;
  onDelete: () => void;
  targetHandle?: boolean;
  sourceHandles?: EdgeHandleConfig[];
}

function getStatusLineColor(status: NodeStatus, accentColor: string): string {
  if (status === 'running') return '#2563eb';
  if (status === 'success') return '#16a34a';
  if (status === 'failed') return '#dc2626';
  return accentColor;
}

function getStatusBadge(status: NodeStatus): string {
  if (status === 'running') return 'RUNNING';
  if (status === 'success') return 'DONE';
  if (status === 'failed') return 'FAILED';
  return 'READY';
}

function handleStyle(color: string, extra?: CSSProperties): CSSProperties {
  return {
    background: color,
    ...extra,
  };
}

export function NodeCardFrame({
  accentColor,
  eyebrow,
  title,
  subtitle,
  description,
  tags,
  icon,
  status,
  orderIndex,
  onDelete,
  targetHandle = true,
  sourceHandles = [{ color: accentColor }],
}: NodeCardFrameProps): JSX.Element {
  const topLineColor = getStatusLineColor(status, accentColor);
  const statusLabel = getStatusBadge(status);

  return (
    <div className="editor-node-card" data-status={status}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 16,
          right: 16,
          height: 3,
          borderRadius: '999px',
          background: topLineColor,
          opacity: 0.9,
        }}
      />

      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 999,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: 'rgba(248, 250, 252, 0.94)',
          color: '#7b8494',
          cursor: 'pointer',
        }}
        title="노드 삭제"
      >
        <CloseIcon size={13} />
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {icon}
        <div style={{ minWidth: 0, paddingRight: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8993a3' }}>
              {eyebrow}
            </span>
            <span
              className="editor-chip"
              style={{ height: 20, padding: '0 8px', background: 'rgba(241, 245, 249, 0.84)', flexShrink: 0 }}
            >
              {statusLabel}
            </span>
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 600,
              color: '#647084',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          lineHeight: 1.5,
          color: '#5a6474',
          minHeight: 34,
        }}
      >
        {description}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span className="editor-chip">STEP {orderIndex}</span>
        {tags.map((tag) => (
          <span key={tag} className="editor-chip">
            {tag}
          </span>
        ))}
      </div>

      {targetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="editor-node-handle"
          style={handleStyle('#cbd5e1', { left: -8 })}
        />
      )}

      {sourceHandles.map((handle, index) => {
        const top = handle.top ?? '50%';
        return (
          <Handle
            key={`${handle.id ?? 'source'}-${index}`}
            id={handle.id}
            type="source"
            position={Position.Right}
            className="editor-node-handle"
            style={handleStyle(handle.color, {
              right: -8,
              top,
              transform: 'translateY(-50%)',
            })}
          />
        );
      })}

      {sourceHandles
        .filter((handle) => handle.label)
        .map((handle, index) => (
          <div
            key={`${handle.id ?? 'label'}-${index}`}
            className="editor-node-handle-label"
            style={{
              top: handle.top,
              transform: 'translateY(-50%)',
              color: handle.color,
            }}
          >
            {handle.label}
          </div>
        ))}
    </div>
  );
}
