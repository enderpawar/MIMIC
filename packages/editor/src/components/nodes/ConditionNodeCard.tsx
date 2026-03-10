import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNode } from '@flowcap/shared';
import { useWorkflowStore } from '../../store/workflowStore';

const COLOR = '#F97316';

export function ConditionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ConditionNode;
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const nodeRunStatus = useWorkflowStore((s) => s.nodeRunStatus);
  const nodes = useWorkflowStore((s) => s.nodes);

  const status = nodeRunStatus[id];
  const orderIndex = nodes.findIndex((n) => n.id === id) + 1;

  const borderColor =
    status === 'running' ? '#3b82f6' :
    status === 'success' ? '#22c55e' :
    status === 'failed'  ? '#ef4444' :
    COLOR;

  const borderStyle = status === 'running' ? 'dashed' : 'solid';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#fff',
            border: `3px ${borderStyle} ${borderColor}`,
            boxShadow: '0 4px 16px rgba(249,115,22,0.30)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, border-color 0.2s',
          }}
        >
          ◆
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            cursor: 'pointer',
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
            fontWeight: 700,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            zIndex: 10,
          }}
          title="노드 삭제"
        >
          ✕
        </button>

        {/* 순서 배지 */}
        <div style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          border: `2px solid ${COLOR}`,
          fontSize: 10,
          fontWeight: 700,
          color: COLOR,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}>
          {orderIndex}
        </div>

        {/* target: 좌측 */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ width: 12, height: 12, background: '#9CA3AF', border: '2px solid #fff', left: -6 }}
        />

        {/* source true: 우상단 */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          style={{
            width: 12,
            height: 12,
            background: '#22c55e',
            border: '2px solid #fff',
            right: -6,
            top: '30%',
          }}
        />

        {/* source false: 우하단 */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          style={{
            width: 12,
            height: 12,
            background: '#ef4444',
            border: '2px solid #fff',
            right: -6,
            top: '70%',
          }}
        />

        {/* T / F 라벨 */}
        <div style={{
          position: 'absolute',
          right: -28,
          top: '22%',
          fontSize: 10,
          fontWeight: 700,
          color: '#22c55e',
        }}>T</div>
        <div style={{
          position: 'absolute',
          right: -28,
          top: '62%',
          fontSize: 10,
          fontWeight: 700,
          color: '#ef4444',
        }}>F</div>
      </div>

      {/* 노드 라벨 */}
      <div style={{ textAlign: 'center', maxWidth: 110 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{node.label}</div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
          {node.condition.operator}
          {node.condition.value ? ` "${node.condition.value}"` : ''}
        </div>
      </div>
    </div>
  );
}
