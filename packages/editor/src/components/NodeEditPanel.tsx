import { useState, useEffect } from 'react';
import type { WorkflowNode, ActionNode, WaitNode, ConditionNode, DataNode } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import { CloseIcon, SparklesIcon } from './icons/AppIcons';

export function NodeEditPanel(): JSX.Element {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const [label, setLabel] = useState('');
  const [selector, setSelector] = useState('');
  const [value, setValue] = useState('');

  // Initialize form when panel opens (use selectedNodeId, not node?.id)
  useEffect(() => {
    if (!node) return;
    setLabel(node.label);
    setSelector(getSelector(node));
    setValue(getValue(node));
    // node is derived from selectedNodeId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

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
    } else if (node.type === 'data') {
      updateNode(node.id, {
        label,
        data: { ...(node as DataNode).data, selector, variableName: value || (node as DataNode).data.variableName },
      } as Partial<WorkflowNode>);
    }

    setSelectedNodeId(null);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 18,
      right: 18,
      width: 360,
      height: 'calc(100% - 110px)',
      background: 'rgba(255,255,255,0.94)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: 26,
      boxShadow: 'var(--editor-shadow-lg)',
      backdropFilter: 'blur(18px)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 60,
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
    }}>
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div className="editor-pill" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <SparklesIcon size={14} />
            Node Editor
          </div>
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18, color: '#111827' }}>
            {node ? `Edit ${typeLabel(node.type)}` : 'Edit node'}
          </div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 12,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            background: '#fff',
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {node && (
        <div className="editor-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Label" value={label} onChange={setLabel} />

          {(node.type === 'action' || node.type === 'condition' || node.type === 'wait' || node.type === 'data') && (
            <Field label="Selector" value={selector} onChange={setSelector} mono />
          )}

          {node.type === 'action' && (
            <Field label="Value" value={value} onChange={setValue} />
          )}

          {node.type === 'wait' && (node as WaitNode).wait.kind === 'duration' && (
            <Field label="Wait (ms)" value={value} onChange={setValue} type="number" />
          )}

          {node.type === 'condition' && (
            <Field label="Compare value" value={value} onChange={setValue} />
          )}

          {node.type === 'data' && (
            <Field label="Variable name" value={value} onChange={setValue} />
          )}
        </div>
      )}

      <div style={{ padding: '16px 18px 18px', borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            height: 46,
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.18)',
          }}
        >
          Save changes
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
    <div className="editor-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: 13,
          fontFamily: mono ? 'monospace' : 'inherit',
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
  if (node.type === 'data') return (node as DataNode).data.variableName ?? '';
  return '';
}

function typeLabel(type: WorkflowNode['type']): string {
  const map: Partial<Record<WorkflowNode['type'], string>> = {
    trigger: 'Trigger',
    action: 'Action',
    wait: 'Wait',
    condition: 'Condition',
    data: 'Data',
  };
  return map[type] ?? type;
}
