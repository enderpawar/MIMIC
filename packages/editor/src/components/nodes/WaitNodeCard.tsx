import type { WaitNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { ClockIcon, NodeBadge } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeCardFrame } from './NodeCardFrame';

function truncate(value: string, maxLength = 24): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function getWaitDescription(node: WaitNode): { subtitle: string; description: string; tags: string[] } {
  if (node.wait.kind === 'duration') {
    const ms = node.wait.ms ?? 1000;
    return {
      subtitle: 'Delay',
      description: `${ms}ms 동안 다음 단계를 기다립니다.`,
      tags: ['Wait', `${ms}ms`],
    };
  }

  if (node.wait.kind === 'element') {
    const selector = node.wait.selector?.trim() ?? '';
    return {
      subtitle: 'Element',
      description: selector ? `${truncate(selector)} 요소가 나타날 때까지 대기합니다.` : '지정한 요소가 준비될 때까지 대기합니다.',
      tags: ['Wait', 'Element'],
    };
  }

  return {
    subtitle: 'Network',
    description: '페이지 네트워크 요청이 안정화될 때까지 대기합니다.',
    tags: ['Wait', 'Network'],
  };
}

export function WaitNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as WaitNode;
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((item) => item.id === id) + 1;
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
      status={nodeRunStatus[id]}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
