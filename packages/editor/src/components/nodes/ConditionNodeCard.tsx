import type { ConditionNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { DiamondSplitIcon, NodeBadge } from '../icons/AppIcons';
import { NodeCardFrame } from './NodeCardFrame';
import { useNodeCard } from '../../hooks/useNodeCard';
import { truncate } from '../../utils/truncate';

export function ConditionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ConditionNode;
  const { orderIndex, status, deleteNode } = useNodeCard(id);
  const selector = node.condition.selector.trim();
  const value = node.condition.value ? `"${truncate(node.condition.value)}"` : 'No value';

  return (
    <NodeCardFrame
      accentColor="#64748b"
      eyebrow="BRANCH"
      title={node.label}
      subtitle={node.condition.operator}
      description={selector ? `Branch if ${truncate(selector)} satisfies ${value}.` : `Branch true/false by ${value}.`}
      tags={['True', 'False']}
      icon={
        <NodeBadge tone="#475569" background="linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)">
          <DiamondSplitIcon size={18} />
        </NodeBadge>
      }
      status={status}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
      sourceHandles={[
        { id: 'true', color: '#22c55e', top: '36%', label: 'T' },
        { id: 'false', color: '#ef4444', top: '68%', label: 'F' },
      ]}
    />
  );
}
