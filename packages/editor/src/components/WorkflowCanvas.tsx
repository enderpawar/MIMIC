import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';

export function WorkflowCanvas(): JSX.Element {
  const { nodes, edges } = useWorkflowStore();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes as never[]} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
