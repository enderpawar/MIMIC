import { useState } from 'react';

interface PaletteItem {
  type: string;
  label: string;
  color: string;
  desc: string;
}

const NODE_PALETTE: PaletteItem[] = [
  { type: 'trigger',   label: '▶ 트리거',  color: '#10B981', desc: '워크플로우 시작' },
  { type: 'action',    label: '⚡ 액션',    color: '#3B82F6', desc: '클릭·입력·이동' },
  { type: 'wait',      label: '⏳ 대기',    color: '#F59E0B', desc: '시간·요소 대기' },
  { type: 'condition', label: '◆ 조건',    color: '#F97316', desc: 'true/false 분기' },
];

export function Sidebar(): JSX.Element {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e', marginBottom: 10 }}>
        🧩 노드 추가
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>
        드래그해서 캔버스에 추가
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NODE_PALETTE.map((item) => (
          <DraggableNode key={item.type} item={item} />
        ))}
      </div>
    </div>
  );
}

function DraggableNode({ item }: { item: PaletteItem }): JSX.Element {
  const [dragging, setDragging] = useState(false);

  function onDragStart(e: React.DragEvent): void {
    e.dataTransfer.setData('application/reactflow-node', item.type);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => setDragging(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 7,
        border: `1px solid ${item.color}40`,
        borderLeft: `4px solid ${item.color}`,
        background: dragging ? `${item.color}18` : '#fff',
        cursor: 'grab',
        opacity: dragging ? 0.5 : 1,
        transition: 'background 0.1s, opacity 0.1s',
        userSelect: 'none',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: item.color }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
          {item.desc}
        </div>
      </div>
    </div>
  );
}
