import type { TriggerNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { MimicLogo, NodeBadge, PlayIcon } from '../icons/AppIcons';
import { NodeCardFrame } from './NodeCardFrame';
import { useNodeCard } from '../../hooks/useNodeCard';

function getTriggerSubtitle(node: TriggerNode): string {
  if (node.trigger.kind === 'manual') return 'Main Node';
  if (node.trigger.kind === 'cron') return node.trigger.cron ?? 'Scheduled';
  return node.trigger.urlPattern ?? 'URL Visit';
}

function getTriggerDescription(node: TriggerNode): string {
  if (node.trigger.kind === 'manual') {
    return 'Workflow starts manually from this node.';
  }
  if (node.trigger.kind === 'cron') {
    return 'Runs automatically on the configured schedule.';
  }
  return 'Runs when the URL pattern is visited.';
}

export function TriggerNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as TriggerNode;
  const { orderIndex, status, deleteNode } = useNodeCard(id);

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
      status={status}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
      targetHandle={false}
    />
  );
}
