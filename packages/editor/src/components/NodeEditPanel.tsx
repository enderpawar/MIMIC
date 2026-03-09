import { useState, useEffect } from 'react';
import type { WorkflowNode, ActionNode, WaitNode, ConditionNode } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';

export function NodeEditPanel(): JSX.Element {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const [label, setLabel] = useState('');
  const [selector, setSelector] = useState('');
  const [value, setValue] = useState('');

  // 패널 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (!node) return;
    setLabel(node.label);
    setSelector(getSelector(node));
    setValue(getValue(node));
  }, [node?.id]);

  const isOpen = selectedNodeId !== null;

  function handleSave(): void {
    if (!node) return;

    if (node.type === 'trigger') {
      updateNode(node.id, { label } as Partial<WorkflowNode>);
    } else if (node.type === 'action') {
      updateNode(node.id, {
        label,
        action: { ...(node as ActionNode).action, selector, value },
      } as Partial<WorkflowNode>);
    } else if (node.type === 'wait') {
      const waitNode = node as WaitNode;
      const ms = value !== '' ? Number(value) : waitNode.wait.ms;
      updateNode(node.id, {
        label,
        wait: { ...waitNode.wait, selector, ms },
      } as Partial<WorkflowNode>);
    } else if (node.type === 'condition') {
      updateNode(node.id, {
        label,
        condition: { ...(node as ConditionNode).condition, selector, value },
      } as Partial<WorkflowNode>);
    }

    setSelectedNodeId(null);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 300,
      height: '100%',
      background: '#fff',
      borderLeft: '1px solid #e5e7eb',
      boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'transform 0.25s ease',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f9fafb',
      }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {node ? `${typeLabel(node.type)} 편집` : '노드 편집'}
        </span>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}
        >
          ✕
        </button>
      </div>

      {/* 폼 */}
      {node && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="라벨" value={label} onChange={setLabel} />

          {(node.type === 'action' || node.type === 'condition' || node.type === 'wait') && (
            <Field label="Selector" value={selector} onChange={setSelector} mono />
          )}

          {node.type === 'action' && (
            <Field label="Value" value={value} onChange={setValue} />
          )}

          {node.type === 'wait' && (node as WaitNode).wait.kind === 'duration' && (
            <Field label="대기 시간 (ms)" value={value} onChange={setValue} type="number" />
          )}

          {node.type === 'condition' && (
            <Field label="비교 값" value={value} onChange={setValue} />
          )}
        </div>
      )}

      {/* 저장 버튼 */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '8px 0',
            background: '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  type?: string;
}

function Field({ label, value, onChange, mono, type = 'text' }: FieldProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 13,
          fontFamily: mono ? 'monospace' : 'inherit',
          outline: 'none',
        }}
      />
    </div>
  );
}

function getSelector(node: WorkflowNode): string {
  if (node.type === 'action') return (node as ActionNode).action.selector;
  if (node.type === 'wait') return (node as WaitNode).wait.selector ?? '';
  if (node.type === 'condition') return (node as ConditionNode).condition.selector;
  return '';
}

function getValue(node: WorkflowNode): string {
  if (node.type === 'action') return (node as ActionNode).action.value ?? '';
  if (node.type === 'wait') return String((node as WaitNode).wait.ms ?? '');
  if (node.type === 'condition') return (node as ConditionNode).condition.value ?? '';
  return '';
}

function typeLabel(type: WorkflowNode['type']): string {
  const map: Partial<Record<WorkflowNode['type'], string>> = {
    trigger: '▶ 트리거',
    action: '⚡ 액션',
    wait: '⏳ 대기',
    condition: '◆ 조건',
    data: '📋 데이터',
  };
  return map[type] ?? type;
}
