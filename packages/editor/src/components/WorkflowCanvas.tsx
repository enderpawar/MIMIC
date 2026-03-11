import { useCallback, useMemo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeMouseHandler,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowNode, WorkflowEdge } from '@flowcap/shared';
import { useWorkflowStore } from '../store/workflowStore';
import { PlusIcon } from './icons/AppIcons';
import {
  TriggerNodeCard,
  ActionNodeCard,
  WaitNodeCard,
  ConditionNodeCard,
  DataNodeCard,
  PlaceholderNodeCard,
} from './nodes';

// 컴포넌트 밖에 정의 — React Flow가 매 렌더마다 비교하므로 안정 참조 필수
const NODE_TYPES = {
  trigger: TriggerNodeCard,
  action: ActionNodeCard,
  wait: WaitNodeCard,
  condition: ConditionNodeCard,
  data: DataNodeCard,
  placeholder: PlaceholderNodeCard,
} as const;

function toFlowNodes(
  nodes: WorkflowNode[],
  nodeRunStatus: Record<string, 'running' | 'success' | 'failed'>,
): Node[] {
  return nodes.map((n) => {
    const status = nodeRunStatus[n.id];
    const borderColor =
      status === 'running' ? '#3b82f6' :
      status === 'success' ? '#22c55e' :
      status === 'failed'  ? '#ef4444' :
      undefined;
    return {
      id: n.id,
      type: n.type,
      position: n.position,
      data: n as unknown as Record<string, unknown>,
      style: borderColor ? ({ '--status-color': borderColor } as CSSProperties) : undefined,
    };
  });
}

function toFlowEdges(edges: WorkflowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.label,
    label: e.label,
    animated: false,
    type: 'smoothstep',
    style: {
      strokeDasharray: '5 7',
      stroke: '#a8b0bd',
      strokeWidth: 1.9,
      strokeLinecap: 'round',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#a8b0bd',
      width: 16,
      height: 16,
    },
  }));
}

// useReactFlow()를 사용하기 위해 ReactFlow를 렌더링하는 내부 컴포넌트 분리
function CanvasInner(): JSX.Element {
  const {
    nodes, edges, nodeRunStatus,
    setWorkflow, setSelectedNodeId,
    openNodePicker, placeholderNode,
  } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();

  // 워크플로우 노드 + 플레이스홀더 노드를 합쳐서 React Flow에 전달
  const flowNodes = useMemo(() => {
    const wfNodes = toFlowNodes(nodes, nodeRunStatus);
    if (placeholderNode) {
      wfNodes.push({
        id: placeholderNode.id,
        type: 'placeholder',
        position: placeholderNode.position,
        data: {},
      });
    }
    return wfNodes;
  }, [nodes, nodeRunStatus, placeholderNode]);
  const flowEdges = useMemo(() => toFlowEdges(edges), [edges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // 'position' 변경만 스토어에 반영 — 무한루프 방지
      // placeholder 노드는 WorkflowNode 배열에 없으므로 제외
      const placeholderId = placeholderNode?.id;
      const positionChanges = changes.filter(
        (c) => c.type === 'position' && c.id !== placeholderId,
      );
      if (positionChanges.length === 0) return;

      const updated = applyNodeChanges(positionChanges, flowNodes);
      const merged = nodes.map((n) => {
        const found = updated.find((u) => u.id === n.id);
        return found ? { ...n, position: found.position } : n;
      });
      setWorkflow(merged, edges);
    },
    [nodes, edges, flowNodes, setWorkflow, placeholderNode],
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
    [nodes, flowEdges, setWorkflow],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const edgeLabel =
        connection.sourceHandle === 'true' || connection.sourceHandle === 'false'
          ? connection.sourceHandle
          : undefined;

      const isDuplicate = edges.some(
        (e) => e.source === connection.source && e.target === connection.target && e.label === edgeLabel,
      );
      if (isDuplicate) return;

      const newEdge: WorkflowEdge = {
        id: `e-${connection.source}-${connection.sourceHandle ?? ''}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        label: edgeLabel,
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  // screenToFlowPosition / openNodePicker를 ref로 유지 — useEffect 의존성 최소화
  const screenToFlowPositionRef = useRef(screenToFlowPosition);
  const openNodePickerRef = useRef(openNodePicker);
  useEffect(() => { screenToFlowPositionRef.current = screenToFlowPosition; });
  useEffect(() => { openNodePickerRef.current = openNodePicker; });

  // 빈 공간 더블클릭 → 플레이스홀더 노드 생성 + NodePickerModal 열기
  // React Flow 내부가 합성 이벤트를 소비할 수 있으므로
  // capture phase 네이티브 리스너로 반드시 먼저 처리
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function handleDblClick(e: MouseEvent): void {
      const target = e.target as Element;
      // 노드·엣지·컨트롤 위 클릭은 무시 (빈 배경만 처리)
      if (
        target.closest('.react-flow__node') ||
        target.closest('.react-flow__edge') ||
        target.closest('.react-flow__controls') ||
        target.closest('.react-flow__minimap')
      ) return;

      // 기존 플레이스홀더 제거
      const store = useWorkflowStore.getState();
      if (store.placeholderNode) store.closeNodePicker();

      const flow = screenToFlowPositionRef.current({ x: e.clientX, y: e.clientY });
      const placeholder = { id: crypto.randomUUID(), position: flow };
      openNodePickerRef.current({ x: e.clientX, y: e.clientY }, placeholder);
    }

    // capture: true → React Flow의 버블 단계 핸들러보다 먼저 실행
    el.addEventListener('dblclick', handleDblClick, { capture: true });
    return () => el.removeEventListener('dblclick', handleDblClick, { capture: true });
  }, []); // 마운트 시 1회만 등록 (콜백은 ref로 최신 유지)

  const handleFloatingAdd = useCallback((): void => {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const screen = {
      x: rect.right - 100,
      y: rect.bottom - 110,
    };
    const flow = screenToFlowPositionRef.current(screen);
    const placeholder = { id: crypto.randomUUID(), position: flow };

    const store = useWorkflowStore.getState();
    if (store.placeholderNode) {
      store.closeNodePicker();
    }

    openNodePickerRef.current(screen, placeholder);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="editor-glass-panel"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '28px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 18,
          zIndex: 6,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div className="editor-pill">Canvas</div>
        <div className="editor-pill">Double click to add</div>
      </div>

      <ReactFlow
        nodeTypes={NODE_TYPES}
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
        defaultViewport={{ x: 120, y: 100, zoom: 0.9 }}
        minZoom={0.2}
        maxZoom={2}
        fitView={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.1} color="var(--editor-canvas-dot)" />
        <Controls
          showInteractive={false}
          style={{
            bottom: 18,
            left: 18,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.10)',
          }}
        />
      </ReactFlow>

      <button
        onClick={handleFloatingAdd}
        title="노드 추가"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
          width: 62,
          height: 62,
          display: 'grid',
          placeItems: 'center',
          border: 'none',
          borderRadius: 999,
          background: '#ffffff',
          color: '#111827',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.18)',
          cursor: 'pointer',
          zIndex: 6,
        }}
      >
        <PlusIcon size={26} />
      </button>
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
