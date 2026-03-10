import { useState } from 'react';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { RunPanel } from './components/RunPanel';
import { NodeEditPanel } from './components/NodeEditPanel';
import { ImportPanel } from './components/ImportPanel';
import { NodePickerModal } from './components/NodePickerModal';

export function App(): JSX.Element {
  const [showImport, setShowImport] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#F3F4F6' }}>

      {/* 상단 타이틀바 — 40px */}
      <header style={{
        height: 40,
        flexShrink: 0,
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        zIndex: 10,
      }}>
        <strong style={{ fontSize: 14, color: '#111827', letterSpacing: '-0.3px' }}>MIMIC</strong>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>워크플로우 에디터</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowImport((v) => !v)}
            style={{
              padding: '4px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              background: showImport ? '#F3F4F6' : '#fff',
              fontSize: 12,
              cursor: 'pointer',
              color: '#374151',
              fontWeight: 500,
            }}
          >
            ↓ Import
          </button>
        </div>
      </header>

      {/* Import 패널 — 헤더 아래 드롭다운 */}
      {showImport && (
        <div style={{
          position: 'absolute',
          top: 40,
          right: 0,
          width: 320,
          zIndex: 100,
          background: '#fff',
          borderLeft: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        }}>
          <ImportPanel />
        </div>
      )}

      {/* 캔버스 — 풀스크린 (헤더 40px + 툴바 56px 제외) */}
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 56 }}>
        <WorkflowCanvas />
      </div>

      {/* 하단 고정 툴바 */}
      <RunPanel />

      {/* 노드 클릭 편집 패널 (우측 슬라이드) */}
      <NodeEditPanel />

      {/* 더블클릭 노드 선택 팝업 */}
      <NodePickerModal />
    </div>
  );
}
