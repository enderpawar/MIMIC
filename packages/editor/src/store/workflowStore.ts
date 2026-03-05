import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorkflowNode, WorkflowEdge, RunEvent } from '@flowcap/shared';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  runLog: RunEvent[];
  isRunning: boolean;
  setWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addRunEvent: (event: RunEvent) => void;
  setRunning: (running: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set) => ({
    nodes: [],
    edges: [],
    runLog: [],
    isRunning: false,
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
    addRunEvent: (event) => set(state => { state.runLog.push(event); }),
    setRunning: (running) => set(state => { state.isRunning = running; }),
  }))
);
