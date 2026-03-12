import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorkflowNode, WorkflowEdge, RunEvent } from '@flowcap/shared';

interface PickerPos {
  screen: { x: number; y: number };
}

export interface PlaceholderNode {
  id: string;
  position: { x: number; y: number };
}

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  runLog: RunEvent[];
  isRunning: boolean;
  selectedNodeId: string | null;
  nodeRunStatus: Record<string, 'running' | 'success' | 'failed'>;
  runError: string | null;
  /** Screen position for picker popup */
  pickerPos: PickerPos | null;
  /** Placeholder node (created on double-click, removed after type selection) */
  placeholderNode: PlaceholderNode | null;
  setWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addRunEvent: (event: RunEvent) => void;
  setRunning: (running: boolean) => void;
  setSelectedNodeId: (id: string | null) => void;
  clearRunStatus: () => void;
  setRunError: (message: string) => void;
  /** Double-click: create placeholder and open picker */
  openNodePicker: (screen: { x: number; y: number }, placeholder: PlaceholderNode) => void;
  /** Click placeholder: open picker only (reuse existing placeholder) */
  reopenNodePicker: (screen: { x: number; y: number }) => void;
  closeNodePicker: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set) => ({
    nodes: [],
    edges: [],
    runLog: [],
    isRunning: false,
    selectedNodeId: null,
    nodeRunStatus: {},
    runError: null,
    pickerPos: null,
    placeholderNode: null,
    setWorkflow: (nodes, edges) => set(state => {
      state.nodes = nodes;
      state.edges = edges;
    }),
    addNode: (node) => set(state => { state.nodes.push(node); }),
    updateNode: (id, updates) => set(state => {
      const idx = state.nodes.findIndex(n => n.id === id);
      if (idx !== -1) Object.assign(state.nodes[idx], updates);
    }),
    deleteNode: (id) => set(state => {
      state.nodes = state.nodes.filter(n => n.id !== id);
      state.edges = state.edges.filter(
        e => e.source !== id && e.target !== id
      );
    }),
    addRunEvent: (event) => set(state => {
      state.runLog.push(event);
      if (event.status !== 'skipped') {
        state.nodeRunStatus[event.nodeId] = event.status;
      }
    }),
    setRunning: (running) => set(state => { state.isRunning = running; }),
    setSelectedNodeId: (id) => set(state => { state.selectedNodeId = id; }),
    clearRunStatus: () => set(state => {
      state.nodeRunStatus = {};
      state.runError = null;
      state.runLog = [];
    }),
    setRunError: (message) => set(state => { state.runError = message; }),
    openNodePicker: (screen, placeholder) => set(state => {
      state.pickerPos = { screen };
      state.placeholderNode = placeholder;
    }),
    reopenNodePicker: (screen) => set(state => {
      state.pickerPos = { screen };
    }),
    closeNodePicker: () => set(state => {
      state.pickerPos = null;
      state.placeholderNode = null;
    }),
  }))
);
