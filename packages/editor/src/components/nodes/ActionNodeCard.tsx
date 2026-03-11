import type { ActionNode } from '@flowcap/shared';
import type { NodeProps } from '@xyflow/react';
import {
  ClockIcon,
  CursorClickIcon,
  GlobeIcon,
  KeyboardIcon,
  NodeBadge,
  SparklesIcon,
} from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeCardFrame } from './NodeCardFrame';

function truncate(value: string, maxLength = 26): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function getActionPresentation(node: ActionNode): {
  subtitle: string;
  description: string;
  accentColor: string;
  badge: JSX.Element;
  tags: string[];
} {
  const selector = node.action.selector.trim();
  const targetText = selector ? truncate(selector) : '선택자 미지정';

  switch (node.action.kind) {
    case 'navigate':
      return {
        subtitle: 'Browser',
        description: node.action.value ? `${truncate(node.action.value, 34)} 페이지로 이동합니다.` : '지정한 페이지로 브라우저를 이동합니다.',
        accentColor: '#2563eb',
        badge: (
          <NodeBadge tone="#2563eb" background="linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)">
            <GlobeIcon size={18} />
          </NodeBadge>
        ),
        tags: ['Navigate', 'Browser'],
      };
    case 'input':
    case 'keypress':
      return {
        subtitle: 'Writer',
        description: `${targetText} 필드에 값을 입력합니다.`,
        accentColor: '#f59e0b',
        badge: (
          <NodeBadge tone="#ea580c" background="linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)">
            <KeyboardIcon size={18} />
          </NodeBadge>
        ),
        tags: ['Input', 'Typed'],
      };
    case 'hover':
      return {
        subtitle: 'Preview',
        description: `${targetText} 요소 위에 커서를 올려 상태를 확인합니다.`,
        accentColor: '#8b5cf6',
        badge: (
          <NodeBadge tone="#8b5cf6" background="linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)">
            <SparklesIcon size={18} />
          </NodeBadge>
        ),
        tags: ['Hover', 'Inspect'],
      };
    case 'scroll':
      return {
        subtitle: 'Viewport',
        description: `${targetText} 위치로 스크롤을 이동합니다.`,
        accentColor: '#0f766e',
        badge: (
          <NodeBadge tone="#0f766e" background="linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)">
            <ClockIcon size={18} />
          </NodeBadge>
        ),
        tags: ['Scroll', 'View'],
      };
    default:
      return {
        subtitle: 'Agent',
        description: `${targetText} 요소와 상호작용합니다.`,
        accentColor: '#ea580c',
        badge: (
          <NodeBadge tone="#ea580c" background="linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)">
            <CursorClickIcon size={18} />
          </NodeBadge>
        ),
        tags: ['Action', node.action.kind],
      };
  }
}

export function ActionNodeCard({ data, id }: NodeProps): JSX.Element {
  const node = data as unknown as ActionNode;
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((item) => item.id === id) + 1;
  const presentation = getActionPresentation(node);

  return (
    <NodeCardFrame
      accentColor={presentation.accentColor}
      eyebrow="ACTION"
      title={node.label}
      subtitle={presentation.subtitle}
      description={presentation.description}
      tags={presentation.tags}
      icon={presentation.badge}
      status={nodeRunStatus[id]}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
