import { useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowNode, WorkflowEdge } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import { TriggerNodeCard, ActionNodeCard, WaitNodeCard, ConditionNodeCard } from './nodes';

// 컴포넌트 밖에 정의 — React Flow가 매 렌더마다 비교하므로 안정 참조 필수
const NODE_TYPES = {
  trigger: TriggerNodeCard,
  action: ActionNodeCard,
  wait: WaitNodeCard,
  condition: ConditionNodeCard,
} as const;

function toFlowNodes(nodes: WorkflowNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n as unknown as Record<string, unknown>,
  }));
}

function toFlowEdges(edges: WorkflowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.label,  // ConditionNode true/false handle
    label: e.label,
    animated: true,
  }));
}

function createDefaultNode(
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
    default: // trigger
      return { id, type: 'trigger', label: '새 트리거', position, trigger: { kind: 'manual' } };
  }
}

// useReactFlow()를 사용하기 위해 ReactFlow를 렌더링하는 내부 컴포넌트 분리
function CanvasInner(): JSX.Element {
  const { nodes, edges, setWorkflow, setSelectedNodeId, addNode } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();

  const flowNodes = toFlowNodes(nodes);
  const flowEdges = toFlowEdges(edges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, flowNodes);
      const merged = nodes.map((n) => {
        const found = updated.find((u) => u.id === n.id);
        return found ? { ...n, position: found.position } : n;
      });
      setWorkflow(merged, edges);
    },
    [nodes, edges, flowNodes, setWorkflow],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, flowEdges);
      const merged: WorkflowEdge[] = updatedEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label as WorkflowEdge['label'],
      }));
      setWorkflow(nodes, merged);
    },
    [nodes, edges, flowEdges, setWorkflow],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: WorkflowEdge = {
        id: `e-${connection.source}-${connection.sourceHandle ?? ''}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        label:
          connection.sourceHandle === 'true' || connection.sourceHandle === 'false'
            ? connection.sourceHandle
            : undefined,
      };
      setWorkflow(nodes, [...edges, newEdge]);
    },
    [nodes, edges, setWorkflow],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
  );

  const onDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/reactflow-node');
      if (!nodeType) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(createDefaultNode(nodeType, position));
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodeTypes={NODE_TYPES}
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(): JSX.Element {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
