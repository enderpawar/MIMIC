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
import { NodeCardFrame } from './NodeCardFrame';
import { useNodeCard } from '../../hooks/useNodeCard';
import { truncate } from '../../utils/truncate';

function getActionPresentation(node: ActionNode): {
  subtitle: string;
  description: string;
  accentColor: string;
  badge: JSX.Element;
  tags: string[];
} {
  const selector = node.action.selector.trim();
  const targetText = selector ? truncate(selector) : 'No selector';

  switch (node.action.kind) {
    case 'navigate':
      return {
        subtitle: 'Browser',
        description: node.action.value ? `Navigate to ${truncate(node.action.value, 34)}.` : 'Navigate browser to the given URL.',
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
        description: `Type value into ${targetText}.`,
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
        description: `Hover over ${targetText} to inspect.`,
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
        description: `Scroll to ${targetText}.`,
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
        description: `Interact with ${targetText}.`,
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
  const { orderIndex, status, deleteNode } = useNodeCard(id);
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
      status={status}
      orderIndex={orderIndex}
      onDelete={() => deleteNode(id)}
    />
  );
}
