import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNode } from '@flowcap/shared';
import { useWorkflowStore } from '../../store/workflowStore';

const COLOR = '#F97316';

export function ConditionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ConditionNode;
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
      position: 'relative',
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
        <span>◆</span>
        <span>조건</span>
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
        <div style={{ color: '#6B7280', marginTop: 2, fontSize: 11 }}>
          <span style={{ fontFamily: 'monospace' }}>{node.condition.operator}</span>
          {node.condition.value != null && (
            <span> &quot;{node.condition.value}&quot;</span>
          )}
        </div>
      </div>
      {/* 좌측: true 분기 */}
      <Handle
        type="source"
        position={Position.Left}
        id="true"
        style={{ background: '#10B981' }}
      />
      <div style={{
        position: 'absolute',
        left: -22,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 10,
        color: '#10B981',
        fontWeight: 700,
        pointerEvents: 'none',
      }}>
        T
      </div>
      {/* 우측: false 분기 */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ background: '#EF4444' }}
      />
      <div style={{
        position: 'absolute',
        right: -16,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 10,
        color: '#EF4444',
        fontWeight: 700,
        pointerEvents: 'none',
      }}>
        F
      </div>
    </div>
  );
}
