import { useState, useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PlusIcon, ChevronDownIcon } from '../icons/AppIcons';
import { useWorkflowStore } from '../../store/workflowStore';
import { createDefaultNode } from '../NodePickerModal';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';

export function PlaceholderNodeCard({ id }: NodeProps): JSX.Element {
  const placeholderNode = useWorkflowStore((state) => state.placeholderNode);
  const addNode = useWorkflowStore((state) => state.addNode);
  const closeNodePicker = useWorkflowStore((state) => state.closeNodePicker);

  const [dropdownOpen, setDropdownOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isThisPlaceholder = placeholderNode?.id === id;

  useEffect(() => {
    if (!isThisPlaceholder) return;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        closeNodePicker();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isThisPlaceholder, closeNodePicker]);

  useEffect(() => {
    if (!isThisPlaceholder) return;
    function onClickOutside(e: MouseEvent): void {
      const el = dropdownRef.current;
      if (el && !el.contains(e.target as Node)) {
        setDropdownOpen(false);
        closeNodePicker();
      }
    }
    const t = setTimeout(() => window.addEventListener('click', onClickOutside), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', onClickOutside);
    };
  }, [isThisPlaceholder, closeNodePicker]);

  function handleSelectType(type: string): void {
    if (!placeholderNode) return;
    addNode(createDefaultNode(type, placeholderNode.position));
    closeNodePicker();
  }

  return (
    <div
      ref={dropdownRef}
      className="editor-placeholder-node-enter"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minHeight: 88,
      }}
    >
      {/* 빈 + 버튼: 좌/우 핸들을 원 기준 동일 비율로 배치 (원 가장자리에서 각 8px 밖) */}
      <div
        style={{
          position: 'relative',
          width: 88,
          height: 88,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.96)',
          color: '#111827',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.10)',
          cursor: 'default',
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
          style={{ left: -8, top: '50%', transform: 'translateY(-50%)', background: '#cbd5e1' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="editor-node-handle"
          style={{ right: -8, top: '50%', transform: 'translateY(-50%)', background: '#cbd5e1' }}
        />
      </div>

      {/* 우측 드롭다운 메뉴 */}
      <div
        style={{
          flex: 1,
          minWidth: 200,
          background: '#fff',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: 16,
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.10)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
          }}
        >
          <span>노드 타입 선택</span>
          <ChevronDownIcon
            size={16}
            style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
        {dropdownOpen && (
          <ul
            style={{
              margin: 0,
              padding: '6px 8px 10px',
              listStyle: 'none',
              borderTop: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            {NODE_DEFINITIONS.map((item) => (
              <li key={item.type}>
                <button
                  type="button"
                  onClick={() => handleSelectType(item.type)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 12,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#111827',
                    textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      color: item.tone,
                      background: item.background,
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
