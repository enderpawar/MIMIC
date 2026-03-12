import { useWorkflowStore } from '../store/workflowStore';

interface NodeCardState {
  orderIndex: number;
  status: 'running' | 'success' | 'failed' | undefined;
  deleteNode: (id: string) => void;
}

/**
 * Shared hook for all node card components.
 * Encapsulates the repeated store selector + orderIndex calculation pattern.
 */
export function useNodeCard(id: string): NodeCardState {
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodeRunStatus = useWorkflowStore((state) => state.nodeRunStatus);
  const nodes = useWorkflowStore((state) => state.nodes);

  const orderIndex = nodes.findIndex((n) => n.id === id) + 1;
  const status = nodeRunStatus[id];

  return { orderIndex, status, deleteNode };
}
