import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TriggerNode } from '@flowcap/shared';
import { useWorkflowStore } from '../../store/workflowStore';

const COLOR = '#10B981';

export function TriggerNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as TriggerNode;
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
      <div style={{
        background: `${COLOR}26`,
        padding: '6px 12px',
        fontWeight: 600,
        color: COLOR,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>▶</span>
        <span style={{ textTransform: 'capitalize' }}>{node.trigger.kind}</span>
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
      <div style={{ padding: '6px 12px', color: '#374151' }}>
        {node.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
