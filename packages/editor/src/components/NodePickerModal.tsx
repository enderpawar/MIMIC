import { useState, useEffect, useCallback } from 'react';
import type { WorkflowNode } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import { CloseIcon, NodeBadge, SearchIcon } from './icons/AppIcons';
import { NODE_DEFINITIONS } from '../constants/nodeDefinitions';
import type { NodeCategory } from '../constants/nodeDefinitions';

const POPUP_W = 520;
const POPUP_H = 420;

export function createDefaultNode(
  type: string,
  position: { x: number; y: number },
): WorkflowNode {
  const id = crypto.randomUUID();
  switch (type) {
    case 'action':
      return { id, type: 'action', label: 'New action', position, action: { kind: 'click', selector: '', url: '' } };
    case 'wait':
      return { id, type: 'wait', label: 'New wait', position, wait: { kind: 'duration', ms: 1000 } };
    case 'condition':
      return { id, type: 'condition', label: 'New condition', position, condition: { selector: '', operator: 'exists' } };
    case 'data':
      return { id, type: 'data', label: 'New data', position, data: { selector: '', attribute: 'textContent', variableName: 'var1' } };
    default:
      return { id, type: 'trigger', label: 'New trigger', position, trigger: { kind: 'manual' } };
  }
}

export function NodePickerModal(): JSX.Element | null {
  const { pickerPos, placeholderNode, closeNodePicker, addNode } = useWorkflowStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeCategory>('All types');

  const handleClose = useCallback((): void => {
    setQuery('');
    closeNodePicker(); // also removes placeholderNode
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

  const filtered = NODE_DEFINITIONS.filter(
    (item) =>
      (activeCategory === 'All types' || item.category === activeCategory) &&
      (
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      ),
  );

  // Clamp popup to viewport
  const rawLeft = pickerPos.screen.x + 8;
  const rawTop  = pickerPos.screen.y - 16;
  const left = Math.min(rawLeft, window.innerWidth  - POPUP_W - 16);
  const top  = Math.min(Math.max(rawTop, 8), window.innerHeight - POPUP_H - 16);

  function handleSelect(type: string): void {
    if (!placeholderNode) return;
    // Create real node at placeholder position
    addNode(createDefaultNode(type, placeholderNode.position));
    handleClose();
  }

  return (
    <>
      {/* Overlay to close on outside click */}
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
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>Choose a step to add to the flow.</div>
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
                No results
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
                onClick={() => setActiveCategory(cat.id as NodeCategory)}
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
              Double-click empty space → "+" node → click to choose type
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
