import type { ConditionNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { DiamondSplitIcon, NodeBadge } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeCardFrame } from './NodeCardFrame';

function truncate(value: string, maxLength = 18): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function ConditionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ConditionNode;
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((item) => item.id === id) + 1;
  const selector = node.condition.selector.trim();
  const value = node.condition.value ? `"${truncate(node.condition.value)}"` : '기준값 없음';

  return (
    <NodeCardFrame
      accentColor="#64748b"
      eyebrow="BRANCH"
      title={node.label}
      subtitle={node.condition.operator}
      description={selector ? `${truncate(selector)} 값이 ${value} 조건을 만족하는지 분기합니다.` : `${value} 기준으로 true / false 흐름을 분기합니다.`}
      tags={['True', 'False']}
      icon={
        <NodeBadge tone="#475569" background="linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)">
          <DiamondSplitIcon size={18} />
        </NodeBadge>
      }
      status={nodeRunStatus[id]}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
      sourceHandles={[
        { id: 'true', color: '#22c55e', top: '36%', label: 'T' },
        { id: 'false', color: '#ef4444', top: '68%', label: 'F' },
      ]}
    />
  );
}
