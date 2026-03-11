import type { DataNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import { DatabaseIcon, NodeBadge } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeCardFrame } from './NodeCardFrame';

function truncate(value: string, maxLength = 22): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function DataNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as DataNode;
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((item) => item.id === id) + 1;
  const selector = node.data.selector.trim();

  return (
    <NodeCardFrame
      accentColor="#7c3aed"
      eyebrow="DATA"
      title={node.label}
      subtitle={node.data.attribute}
      description={selector ? `선택자 ${truncate(selector)} 에서 값을 추출해 ${node.data.variableName} 변수로 저장합니다.` : `${node.data.variableName} 변수에 데이터를 적재합니다.`}
      tags={[node.data.variableName, 'Extract']}
      icon={
        <NodeBadge tone="#7c3aed" background="linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)">
          <DatabaseIcon size={18} />
        </NodeBadge>
      }
      status={nodeRunStatus[id]}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
