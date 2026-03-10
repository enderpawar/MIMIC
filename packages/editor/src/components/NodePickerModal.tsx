import { useState, useEffect, useCallback } from 'react';
import type { WorkflowNode } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';

interface NodeTypeItem {
  type: string;
  label: string;
  desc: string;
  color: string;
  icon: string;
}

const NODE_TYPES_LIST: NodeTypeItem[] = [
  { type: 'trigger',   label: 'Trigger',   desc: '워크플로우 시작점',   color: '#10B981', icon: '▶' },
  { type: 'action',    label: 'Action',    desc: '클릭·입력·이동',      color: '#3B82F6', icon: '⚡' },
  { type: 'wait',      label: 'Wait',      desc: '시간·요소 대기',      color: '#F59E0B', icon: '⏳' },
  { type: 'condition', label: 'Condition', desc: 'true / false 분기',  color: '#F97316', icon: '◆' },
  { type: 'data',      label: 'Data',      desc: '데이터 추출·저장',    color: '#8B5CF6', icon: '📦' },
];

const POPUP_W = 480;
const POPUP_H = 420;

export function createDefaultNode(
  type: string,
  position: { x: number; y: number },
): WorkflowNode {
  const id = crypto.randomUUID();
  switch (type) {
    case 'action':
      return { id, type: 'action', label: '새 액션', position, action: { kind: 'click', selector: '', url: '' } };
    case 'wait':
      return { id, type: 'wait', label: '새 대기', position, wait: { kind: 'duration', ms: 1000 } };
    case 'condition':
      return { id, type: 'condition', label: '새 조건', position, condition: { selector: '', operator: 'exists' } };
    case 'data':
      return { id, type: 'data', label: '새 데이터', position, data: { selector: '', attribute: 'textContent', variableName: 'var1' } };
    default:
      return { id, type: 'trigger', label: '새 트리거', position, trigger: { kind: 'manual' } };
  }
}

export function NodePickerModal(): JSX.Element | null {
  const { pickerPos, placeholderNode, closeNodePicker, addNode } = useWorkflowStore();
  const [query, setQuery] = useState('');

  const handleClose = useCallback((): void => {
    setQuery('');
    closeNodePicker(); // placeholderNode도 함께 제거됨
  }, [closeNodePicker]);

  useEffect(() => {
    if (!pickerPos) return;
    setQuery('');

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pickerPos, handleClose]);

  if (!pickerPos || !placeholderNode) return null;

  const filtered = NODE_TYPES_LIST.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.includes(query),
  );

  // 화면 경계를 벗어나지 않도록 팝업 위치 보정
  const rawLeft = pickerPos.screen.x + 8;
  const rawTop  = pickerPos.screen.y - 16;
  const left = Math.min(rawLeft, window.innerWidth  - POPUP_W - 16);
  const top  = Math.min(Math.max(rawTop, 8), window.innerHeight - POPUP_H - 16);

  function handleSelect(type: string): void {
    if (!placeholderNode) return;
    // 플레이스홀더 위치에 실제 노드 생성
    addNode(createDefaultNode(type, placeholderNode.position));
    handleClose();
  }

  return (
    <>
      {/* 외부 클릭 시 닫기 오버레이 */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
      />

      <div
        style={{
          position: 'fixed',
          top,
          left,
          zIndex: 1000,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          width: POPUP_W,
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* 검색 인풋 */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1.5px solid #7C3AED',
            borderRadius: 8,
            padding: '8px 12px',
          }}>
            <span style={{ color: '#9CA3AF', fontSize: 14 }}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search node types..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: '#111827',
                background: 'transparent',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          {/* 좌측: 노드 목록 */}
          <div style={{ flex: 1, maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                검색 결과가 없습니다
              </div>
            )}
            {filtered.map((item) => (
              <button
                key={item.type}
                onClick={() => handleSelect(item.type)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {item.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 우측: 카테고리 탭 */}
          <div style={{
            width: 160,
            borderLeft: '1px solid #F3F4F6',
            padding: '8px 0',
            background: '#FAFAFA',
            flexShrink: 0,
          }}>
            {[
              { id: 'all',   label: 'All types',   icon: '⊞' },
              { id: 'basic', label: 'Basic',        icon: '⚙' },
              { id: 'flow',  label: 'Flow Control', icon: '⇌' },
            ].map((cat) => (
              <button
                key={cat.id}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  border: 'none',
                  background: cat.id === 'all' ? '#EDE9FE' : 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: cat.id === 'all' ? '#7C3AED' : '#374151',
                  fontWeight: cat.id === 'all' ? 600 : 400,
                  textAlign: 'left',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}

            <div style={{ margin: '8px 16px', borderTop: '1px solid #E5E7EB' }} />
            <div style={{ padding: '4px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
              HINT
            </div>
            <div style={{ padding: '4px 16px', fontSize: 11, color: '#9CA3AF', lineHeight: 1.6 }}>
              빈 공간 더블클릭<br />→ "+" 노드 생성<br />→ 클릭하여 타입 선택
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
