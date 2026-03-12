import type { WaitNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { ClockIcon, NodeBadge } from '../icons/AppIcons';
import { NodeCardFrame } from './NodeCardFrame';
import { useNodeCard } from '../../hooks/useNodeCard';
import { truncate } from '../../utils/truncate';

function getWaitDescription(node: WaitNode): { subtitle: string; description: string; tags: string[] } {
  if (node.wait.kind === 'duration') {
    const ms = node.wait.ms ?? 1000;
    return {
      subtitle: 'Delay',
      description: `Wait ${ms}ms before next step.`,
      tags: ['Wait', `${ms}ms`],
    };
  }

  if (node.wait.kind === 'element') {
    const selector = node.wait.selector?.trim() ?? '';
    return {
      subtitle: 'Element',
      description: selector ? `Wait until ${truncate(selector)} appears.` : 'Wait until the element is ready.',
      tags: ['Wait', 'Element'],
    };
  }

  return {
    subtitle: 'Network',
    description: 'Wait until network is idle.',
    tags: ['Wait', 'Network'],
  };
}

export function WaitNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as WaitNode;
  const { orderIndex, status, deleteNode } = useNodeCard(id);
  const presentation = getWaitDescription(node);

  return (
    <NodeCardFrame
      accentColor="#f59e0b"
      eyebrow="WAIT"
      title={node.label}
      subtitle={presentation.subtitle}
      description={presentation.description}
      tags={presentation.tags}
      icon={
        <NodeBadge tone="#d97706" background="linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)">
          <ClockIcon size={18} />
        </NodeBadge>
      }
      status={status}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
