import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { WaitNode } from '@flowcap/shared';
import { useWorkflowStore } from '../../store/workflowStore';

const COLOR = '#F59E0B';

function subText(node: WaitNode): string {
  const { kind, ms, selector } = node.wait;
  if (kind === 'duration') return ms != null ? `${ms}ms` : 'duration';
  if (kind === 'element') return selector ?? 'selector';
  return 'network_idle';
}

export function WaitNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as WaitNode;
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
        <span>⏳</span>
        <span style={{ textTransform: 'capitalize' }}>{node.wait.kind.replace('_', ' ')}</span>
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
          {subText(node)}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
