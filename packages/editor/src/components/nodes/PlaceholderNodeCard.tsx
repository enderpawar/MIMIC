import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';

export function PlaceholderNodeCard({ id }: NodeProps): JSX.Element {
  const placeholderNode = useWorkflowStore((s) => s.placeholderNode);
  const pickerPos = useWorkflowStore((s) => s.pickerPos);
  const reopenNodePicker = useWorkflowStore((s) => s.reopenNodePicker);
  const closeNodePicker = useWorkflowStore((s) => s.closeNodePicker);

  const isPickerOpen = pickerPos !== null && placeholderNode?.id === id;

  function handleClick(e: React.MouseEvent): void {
    e.stopPropagation();

    if (isPickerOpen) {
      // 피커가 열려 있으면 닫기 (플레이스홀더는 유지)
      useWorkflowStore.setState({ pickerPos: null });
      return;
    }

    // 피커 열기 — 노드 오른쪽에 팝업 위치
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    reopenNodePicker({ x: rect.right + 8, y: rect.top });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative' }}>
        <div
          onClick={handleClick}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: isPickerOpen ? '#EDE9FE' : '#F3F4F6',
            border: `2px dashed ${isPickerOpen ? '#7C3AED' : '#9CA3AF'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: isPickerOpen ? '#7C3AED' : '#9CA3AF',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            userSelect: 'none',
            boxShadow: isPickerOpen ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
          }}
        >
          +
        </div>

        <Handle
          type="target"
          position={Position.Left}
          style={{ width: 12, height: 12, background: '#D1D5DB', border: '2px solid #fff', left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: 12, height: 12, background: '#D1D5DB', border: '2px solid #fff', right: -6 }}
        />
      </div>

      <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
        클릭하여 선택
      </div>
    </div>
  );
}
