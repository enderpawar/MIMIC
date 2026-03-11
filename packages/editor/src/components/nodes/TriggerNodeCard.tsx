import type { TriggerNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { MimicLogo, NodeBadge, PlayIcon } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeCardFrame } from './NodeCardFrame';

function getTriggerSubtitle(node: TriggerNode): string {
  if (node.trigger.kind === 'manual') return 'Main Node';
  if (node.trigger.kind === 'cron') return node.trigger.cron ?? 'Scheduled';
  return node.trigger.urlPattern ?? 'URL Visit';
}

function getTriggerDescription(node: TriggerNode): string {
  if (node.trigger.kind === 'manual') {
    return '워크플로우가 수동으로 시작되는 기준점입니다.';
  }
  if (node.trigger.kind === 'cron') {
    return '설정된 일정에 따라 자동으로 실행됩니다.';
  }
  return '지정한 URL 패턴에 진입하면 실행됩니다.';
}

export function TriggerNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as TriggerNode;
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((item) => item.id === id) + 1;

  return (
    <NodeCardFrame
      accentColor="#2563eb"
      eyebrow="START"
      title={node.label}
      subtitle={getTriggerSubtitle(node)}
      description={getTriggerDescription(node)}
      tags={['Manual', 'Entry']}
      icon={
        <NodeBadge tone="#2563eb" background="linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)">
          {node.trigger.kind === 'manual' ? <PlayIcon size={18} /> : <MimicLogo size={20} />}
        </NodeBadge>
      }
      status={nodeRunStatus[id]}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
      targetHandle={false}
    />
  );
}
