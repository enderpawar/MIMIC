import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActionNode } from '@flowcap/shared';
import { useWorkflowStore } from '../../store/workflowStore';

const COLOR = '#3B82F6';

function truncate(s: string, max = 20): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function ActionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ActionNode;
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  return (
    <div style={{
      border: `2px solid ${COLOR}`,
      borderRadius: 10,
      minWidth: 180,
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: 13,
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{
        background: `${COLOR}26`,
        padding: '6px 12px',
        fontWeight: 600,
        color: COLOR,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>⚡</span>
        <span style={{
          background: COLOR,
          color: '#fff',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: 11,
        }}>
          {node.action.kind}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: COLOR,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1,
            padding: '0 2px',
          }}
          title="노드 삭제"
        >
          ✕
        </button>
      </div>
      <div style={{ padding: '6px 12px' }}>
        <div style={{ color: '#374151', fontWeight: 500 }}>{node.label}</div>
        <div style={{ color: '#6B7280', marginTop: 2, fontFamily: 'monospace', fontSize: 11 }}>
          {truncate(node.action.selector)}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
