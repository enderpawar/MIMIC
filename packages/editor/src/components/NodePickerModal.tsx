import { useState, useEffect, useCallback } from 'react';
import type { WorkflowNode } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import {
  BellIcon,
  ClockIcon,
  CloseIcon,
  CursorClickIcon,
  DiamondSplitIcon,
  HomeIcon,
  NodeBadge,
  SearchIcon,
} from './icons/AppIcons';

interface NodeTypeItem {
  type: 'trigger' | 'action' | 'wait' | 'condition' | 'data';
  label: string;
  desc: string;
  category: 'All types' | 'Basic' | 'Flow Control';
  tone: string;
  background: string;
  icon: JSX.Element;
}

const NODE_TYPES_LIST: NodeTypeItem[] = [
  {
    type: 'trigger',
    label: 'Start Node',
    desc: '워크플로우 시작점',
    category: 'Basic',
    tone: '#2563eb',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    icon: <HomeIcon size={18} />,
  },
  {
    type: 'action',
    label: 'Email Agent',
    desc: '클릭·입력·이동 같은 실행 단계',
    category: 'Basic',
    tone: '#ea580c',
    background: 'linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)',
    icon: <CursorClickIcon size={18} />,
  },
  {
    type: 'wait',
    label: 'Creative Writer',
    desc: '시간 또는 요소 로딩 대기',
    category: 'Flow Control',
    tone: '#d97706',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
    icon: <ClockIcon size={18} />,
  },
  {
    type: 'condition',
    label: 'Condition',
    desc: 'true / false 분기 처리',
    category: 'Flow Control',
    tone: '#475569',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)',
    icon: <DiamondSplitIcon size={18} />,
  },
  {
    type: 'data',
    label: 'Notification',
    desc: '데이터 추출 및 저장',
    category: 'Basic',
    tone: '#7c3aed',
    background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
    icon: <BellIcon size={18} />,
  },
];

const POPUP_W = 520;
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
  const [activeCategory, setActiveCategory] = useState<'All types' | 'Basic' | 'Flow Control'>('All types');

  const handleClose = useCallback((): void => {
    setQuery('');
    closeNodePicker(); // placeholderNode도 함께 제거됨
  }, [closeNodePicker]);

  useEffect(() => {
    if (!pickerPos) return;
    setQuery('');
    setActiveCategory('All types');

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pickerPos, handleClose]);

  if (!pickerPos || !placeholderNode) return null;

  const filtered = NODE_TYPES_LIST.filter(
    (item) =>
      (activeCategory === 'All types' || item.category === activeCategory) &&
      (
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.includes(query)
      ),
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
          borderRadius: 24,
          boxShadow: '0 28px 56px rgba(15, 23, 42, 0.22)',
          width: POPUP_W,
          overflow: 'hidden',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Add a node</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>원하는 단계를 선택해 플로우에 추가하세요.</div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 12,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: '#fff',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div style={{ padding: '0 20px 16px', borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(37, 99, 235, 0.18)',
            borderRadius: 16,
            padding: '10px 12px',
            background: '#fff',
            boxShadow: 'var(--editor-shadow-sm)',
          }}>
            <SearchIcon size={16} style={{ color: '#9CA3AF' }} />
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
          <div className="editor-scrollbar" style={{ flex: 1, maxHeight: 340, overflowY: 'auto', padding: '12px' }}>
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
                  padding: '14px',
                  borderRadius: 18,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#fff',
                  boxShadow: 'var(--editor-shadow-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 10,
                }}
              >
                <NodeBadge tone={item.tone} background={item.background}>
                  {item.icon}
                </NodeBadge>
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

          <div style={{
            width: 168,
            borderLeft: '1px solid rgba(15, 23, 42, 0.06)',
            padding: '14px 12px',
            background: '#f8fafc',
            flexShrink: 0,
          }}>
            {[
              { id: 'All types', label: 'All types' },
              { id: 'Basic', label: 'Basic' },
              { id: 'Flow Control', label: 'Flow Control' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as 'All types' | 'Basic' | 'Flow Control')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: 14,
                  background: cat.id === activeCategory ? '#111827' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: cat.id === activeCategory ? '#ffffff' : '#374151',
                  fontWeight: cat.id === activeCategory ? 700 : 500,
                  textAlign: 'left',
                  marginBottom: 6,
                }}
              >
                {cat.label}
              </button>
            ))}

            <div style={{ margin: '14px 4px', borderTop: '1px solid #E5E7EB' }} />
            <div style={{ padding: '4px', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
              HINT
            </div>
            <div style={{ padding: '4px', fontSize: 11, color: '#9CA3AF', lineHeight: 1.7 }}>
              빈 공간 더블클릭<br />→ "+" 노드 생성<br />→ 클릭하여 타입 선택
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
