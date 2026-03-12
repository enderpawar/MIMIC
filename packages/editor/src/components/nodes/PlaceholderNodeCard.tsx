import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PlusIcon } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';

export function PlaceholderNodeCard({ id }: NodeProps): JSX.Element {
  const placeholderNode = useWorkflowStore((state) => state.placeholderNode);
  const pickerPos = useWorkflowStore((state) => state.pickerPos);
  const reopenNodePicker = useWorkflowStore((state) => state.reopenNodePicker);

  const isPickerOpen = pickerPos !== null && placeholderNode?.id === id;

  function handleClick(event: React.MouseEvent): void {
    event.stopPropagation();

    if (isPickerOpen) {
      useWorkflowStore.setState({ pickerPos: null });
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    reopenNodePicker({ x: rect.right + 10, y: rect.top + 12 });
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        width: 88,
        height: 88,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        background: isPickerOpen ? '#111827' : 'rgba(255, 255, 255, 0.96)',
        color: isPickerOpen ? '#ffffff' : '#111827',
        border: `1px solid ${isPickerOpen ? '#111827' : 'rgba(15, 23, 42, 0.08)'}`,
        boxShadow: isPickerOpen ? '0 16px 38px rgba(15, 23, 42, 0.20)' : '0 12px 28px rgba(15, 23, 42, 0.10)',
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
    >
      <PlusIcon size={28} />
      <div
        style={{
          position: 'absolute',
          bottom: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: 11,
          fontWeight: 700,
          color: '#6b7280',
          letterSpacing: '0.04em',
        }}
      >
        ADD STEP
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="editor-node-handle"
        style={{ left: -8, background: '#cbd5e1' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="editor-node-handle"
        style={{ right: -8, background: '#cbd5e1' }}
      />
    </div>
  );
}
