import type { DataNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { DatabaseIcon, NodeBadge } from '../icons/AppIcons';
import { NodeCardFrame } from './NodeCardFrame';
import { useNodeCard } from '../../hooks/useNodeCard';
import { truncate } from '../../utils/truncate';

export function DataNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as DataNode;
  const { orderIndex, status, deleteNode } = useNodeCard(id);
  const selector = node.data.selector.trim();

  return (
    <NodeCardFrame
      accentColor="#7c3aed"
      eyebrow="DATA"
      title={node.label}
      subtitle={node.data.attribute}
      description={selector ? `Extract from ${truncate(selector)} into variable ${node.data.variableName}.` : `Load data into variable ${node.data.variableName}.`}
      tags={[node.data.variableName, 'Extract']}
      icon={
        <NodeBadge tone="#7c3aed" background="linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)">
          <DatabaseIcon size={18} />
        </NodeBadge>
      }
      status={status}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
