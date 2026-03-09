import { WorkflowCanvas } from './components/WorkflowCanvas';
import { RunPanel } from './components/RunPanel';
import { NodeEditPanel } from './components/NodeEditPanel';
import { ImportPanel } from './components/ImportPanel';
import { Sidebar } from './components/Sidebar';

export function App(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{
        padding: '8px 16px',
        background: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <strong>MIMIC Editor</strong>
        <span style={{ fontSize: 12, opacity: 0.6 }}>워크플로우 편집기</span>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 좌측 패널: 노드 팔레트 + 불러오기 */}
        <div style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          background: '#fafafa',
        }}>
          <Sidebar />
          <ImportPanel />
        </div>

        {/* 캔버스 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <WorkflowCanvas />
        </div>
      </div>

      <RunPanel />
      <NodeEditPanel />
    </div>
  );
}
