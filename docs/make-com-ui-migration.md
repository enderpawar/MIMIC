# Make.com 스타일 UI 전환 방안

> 작성일: 2026-03-10  
> 대상 패키지: `packages/editor`  
> 참고 레퍼런스: Make.com 워크플로우 에디터 UI

---

## 0. 전환 목표 요약

| 항목 | 현재 (MIMIC) | 목표 (Make.com 스타일) |
|---|---|---|
| 노드 모양 | 직사각형 카드 | 원형 아이콘 버튼 |
| 노드 추가 방법 | 좌측 사이드바 드래그 & 드롭 | 빈 공간 더블클릭 → 팝업 피커 |
| 연결 방향 | 위(target) → 아래(source) 수직 | 왼쪽(target) → 오른쪽(source) 수평 |
| 연결선 스타일 | 애니메이션 실선 | 점선(dotted) + 중간 버튼 |
| 레이아웃 | 헤더 + 좌측 패널 260px + 캔버스 | 상단 타이틀바 + 풀스크린 캔버스 + 하단 툴바 |
| 노드 라벨 위치 | 노드 내부 | 원형 노드 하단 외부 |
| 노드 번호 배지 | 없음 | 원형 우하단 순서 번호 |

---

## 1. 영향받는 파일 목록

### 수정 대상 (7개)

```
packages/editor/src/
├── App.tsx                           ← 레이아웃 전면 재구성
├── components/WorkflowCanvas.tsx     ← 더블클릭 핸들러, 엣지 스타일 변경
├── components/RunPanel.tsx           ← Make.com 하단 툴바 스타일
├── components/Sidebar.tsx            ← 제거 (기능을 NodePicker로 이전)
├── components/nodes/ActionNodeCard.tsx    ← 원형 노드로 재설계
├── components/nodes/TriggerNodeCard.tsx   ← 원형 노드로 재설계
├── components/nodes/WaitNodeCard.tsx      ← 원형 노드로 재설계
└── components/nodes/ConditionNodeCard.tsx ← 원형 노드로 재설계 (마름모)
```

### 신규 생성 대상 (2개)

```
packages/editor/src/
├── components/NodePickerModal.tsx    ← 더블클릭 시 노드 선택 팝업
└── store/workflowStore.ts            ← pickerPosition 상태 추가
```

---

## 2. 변경 상세 설계

---

### 2-1. `App.tsx` — 레이아웃 전면 재구성

**현재 구조:**
```
[헤더]
[좌측 패널(260px)] | [캔버스]
[RunPanel]
[NodeEditPanel] (float)
```

**목표 구조:**
```
[상단 타이틀바 — 씬 이름 + 공유 버튼]
[캔버스 — 풀스크린, 배경 연한 회색]
[하단 툴바 — Run once | 스케줄 토글 | 아이콘 버튼들]
[NodePickerModal] (float, 더블클릭 위치에 렌더)
[NodeEditPanel] (float, 우측 슬라이드)
```

**주요 변경:**
- `Sidebar` 컴포넌트 임포트·렌더 제거
- `ImportPanel`은 상단 타이틀바 우측 버튼으로 이동
- 캔버스 영역 `flex: 1` → `position: relative; width: 100%; height: calc(100vh - 48px - 56px)`
- 헤더 높이 슬림화: 48px → 40px, 배경 흰색 또는 매우 연한 회색

---

### 2-2. `WorkflowCanvas.tsx` — 더블클릭 + 엣지 스타일

#### (A) 더블클릭으로 NodePickerModal 열기

```typescript
// 추가할 핸들러
const onPaneDoubleClick = useCallback(
  (event: React.MouseEvent): void => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    // Zustand store에 pickerPosition 저장 → NodePickerModal이 열림
    openNodePicker(position);
  },
  [screenToFlowPosition, openNodePicker],
);

// ReactFlow에 prop 추가
<ReactFlow
  ...
  onPaneDoubleClick={onPaneDoubleClick}
  // 기존 onDragOver, onDrop은 제거 (드래그 방식 폐기)
/>
```

#### (B) 엣지 스타일 변경 — 점선 + 수평

```typescript
// toFlowEdges 수정
function toFlowEdges(edges: WorkflowEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.label,
    label: e.label,
    animated: false,           // ← 애니메이션 제거
    type: 'smoothstep',        // ← 부드러운 수평 곡선
    style: {
      strokeDasharray: '6 4',  // ← 점선
      stroke: '#9CA3AF',       // ← 회색
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#9CA3AF',
    },
  }));
}
```

#### (C) Handle 위치 변경 (캔버스 레벨 처리)

각 노드 컴포넌트에서 Handle의 Position을 변경:
- `Position.Top` → `Position.Left`
- `Position.Bottom` → `Position.Right`

---

### 2-3. `NodePickerModal.tsx` — 신규 생성

Make.com의 앱 선택 팝업을 모방한 컴포넌트.

**UI 구성:**
```
┌─────────────────────────────────────────────┐
│ 🔍 [Search node types...              ]      │
├──────────────────────────┬──────────────────┤
│ 현재 시나리오에서 사용 중  │  All types  ←선택│
│ ● Trigger                │  ✦ Recommended   │
│ ● Action                 │  ⚙ Built-in      │
│ ──────────────           │                  │
│ 모든 노드 타입            │                  │
│ ⚙ Action                 │                  │
│ ⏳ Wait                   │                  │
│ ◆ Condition              │                  │
│ 📦 Data                  │                  │
└──────────────────────────┴──────────────────┘
```

**핵심 동작:**
1. `pickerPosition`이 null이 아닐 때 렌더 (화면 위치 기준 팝업)
2. 노드 타입 클릭 → `createDefaultNode(type, pickerPosition)` → `addNode()` → `closeNodePicker()`
3. 검색창: 노드 타입 라벨/설명 필터링
4. `Escape` 키 또는 팝업 외부 클릭으로 닫기
5. 팝업 위치는 클릭 좌표 기준, 화면 경계 벗어나지 않도록 보정

**Zustand store에 추가할 상태:**
```typescript
pickerPosition: { x: number; y: number } | null;
openNodePicker: (pos: { x: number; y: number }) => void;
closeNodePicker: () => void;
```

---

### 2-4. 원형 노드 컴포넌트 재설계

#### 공통 원형 노드 구조

```
        [Handle Left - target]
               │
    ┌──────────┴──────────┐
    │    ┌──────────┐     │
    │    │  아이콘   │ ③  │  ← ③ = 순서 배지
    │    │  (48px)  │    │
    │    └──────────┘     │
    └──────────┬──────────┘
               │
        [Handle Right - source]
               │
          노드 라벨 (14px bold)
          서브텍스트 (12px gray)
```

#### 원형 노드 공통 스타일

```typescript
const circleStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,             // 이모지 아이콘 크기
  background: COLOR,
  color: '#fff',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  position: 'relative',
  border: '3px solid transparent',
  transition: 'box-shadow 0.2s, border-color 0.2s',
};

// 실행 상태별 border 색상
// running  → border: '#3b82f6' (파랑 점선)
// success  → border: '#22c55e' (초록 실선)
// failed   → border: '#ef4444' (빨강 실선)
```

#### 노드 타입별 색상·아이콘·라벨

| 타입 | 색상 | 아이콘 (이모지) | 기본 라벨 |
|---|---|---|---|
| trigger | `#10B981` | ▶ | Watch / Manual |
| action | `#3B82F6` | ⚡ | Action |
| wait | `#F59E0B` | ⏳ | Wait |
| condition | `#F97316` | ◆ | Condition |
| data | `#8B5CF6` | 📦 | Extract Data |

#### 순서 배지

```typescript
// 노드의 index를 data에 추가하여 배지에 표시
<div style={{
  position: 'absolute',
  bottom: -4,
  right: -4,
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: '#fff',
  border: `2px solid ${COLOR}`,
  fontSize: 10,
  fontWeight: 700,
  color: COLOR,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {orderIndex}
</div>
```

#### Handle 위치 변경

```typescript
// 기존 (수직)
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

// 변경 후 (수평)
<Handle type="target" position={Position.Left}
  style={{ width: 12, height: 12, background: '#9CA3AF' }} />
<Handle type="source" position={Position.Right}
  style={{ width: 12, height: 12, background: COLOR }} />
```

#### ConditionNode 특이사항

Condition 노드는 좌측이 target, 우측이 두 개(true/false)로 분기:

```typescript
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} id="true"
  style={{ top: '35%', background: '#22c55e' }} />
<Handle type="source" position={Position.Right} id="false"
  style={{ top: '65%', background: '#ef4444' }} />
```

---

### 2-5. `RunPanel.tsx` — Make.com 하단 툴바 스타일

**현재:** 상단 고정, 배경 회색, 실행 버튼 + 로그 목록

**목표:** 하단 고정, 얇은 툴바 (56px), 배경 흰색 + 그림자

```
┌────────────────────────────────────────────────────────┐
│ [▶ Run once ▾]  [⊙ Every 15 min]  │  🗃 💡 ⚙ 📋  │ 🔴🟡 │
└────────────────────────────────────────────────────────┘
```

**스타일 변경:**
```typescript
// 기존
position: 'relative', padding: '12px 16px', background: '#f9fafb'

// 변경 후
position: 'fixed',
bottom: 0,
left: 0,
right: 0,
height: 56,
background: '#fff',
borderTop: '1px solid #E5E7EB',
boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
display: 'flex',
alignItems: 'center',
padding: '0 16px',
gap: 12,
zIndex: 50,
```

**Run once 버튼:**
```typescript
// 보라-초록 그라디언트 → Make.com 스타일 보라 버튼
background: '#7C3AED',
color: '#fff',
borderRadius: 8,
padding: '8px 16px',
fontSize: 14,
fontWeight: 600,
border: 'none',
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
gap: 6,
```

**로그 표시:** 하단 툴바에서 분리 → 별도 `RunLogDrawer` 컴포넌트로 위로 펼쳐지는 드로어 형식 (클릭 시 토글)

---

### 2-6. `Sidebar.tsx` 처리

기존 드래그 팔레트 사이드바는 `NodePickerModal`로 기능이 이전되므로 **파일 자체는 유지하되 `App.tsx`에서 렌더링 제거**.

향후 좌측 아이콘 네비게이션 레일(홈·스케줄·설정 등)로 재활용 가능.

---

## 3. Zustand Store 추가 상태

```typescript
// workflowStore.ts에 추가
interface WorkflowState {
  // ... 기존 상태 유지
  
  // NodePicker 상태
  pickerPosition: { x: number; y: number } | null;   // flow 좌표계
  openNodePicker: (pos: { x: number; y: number }) => void;
  closeNodePicker: () => void;
  
  // 노드 순서 인덱스 (원형 배지용)
  getNodeOrder: (id: string) => number;
}

// immer setter 구현
openNodePicker: (pos) => set(state => { state.pickerPosition = pos; }),
closeNodePicker: () => set(state => { state.pickerPosition = null; }),
getNodeOrder: (id) => get().nodes.findIndex(n => n.id === id) + 1,
```

---

## 4. 구현 순서 (Phase별)

### Phase A — 레이아웃 재구성 (하루)
1. `App.tsx` 레이아웃 변경 (사이드바 제거, 캔버스 풀스크린)
2. `RunPanel.tsx` 하단 고정 툴바로 변경
3. 캔버스 하단 여백 56px 추가 (툴바에 가리지 않도록)

### Phase B — NodePickerModal 구현 (하루)
1. `workflowStore.ts`에 `pickerPosition` 상태 추가
2. `NodePickerModal.tsx` 컴포넌트 신규 작성
3. `WorkflowCanvas.tsx`에 `onPaneDoubleClick` 핸들러 추가
4. `App.tsx`에 `NodePickerModal` 렌더 추가

### Phase C — 원형 노드 재설계 (하루)
1. `ActionNodeCard.tsx` 원형으로 재작성
2. `TriggerNodeCard.tsx` 원형으로 재작성
3. `WaitNodeCard.tsx` 원형으로 재작성
4. `ConditionNodeCard.tsx` 원형으로 재작성
5. Handle 방향 전체를 Left/Right로 변경

### Phase D — 엣지·캔버스 스타일 (반나절)
1. `toFlowEdges`에 점선 스타일 적용
2. `Background` 패턴 변경 (dots → lines 또는 없음)
3. `Controls`, `MiniMap` 스타일 커스터마이징

### Phase E — 통합 검증 (반나절)
1. 더블클릭 → 피커 → 노드 생성 전체 흐름 확인
2. 노드 간 엣지 연결 (Left/Right Handle) 확인
3. 실행 상태 원형 노드 테두리 색상 확인
4. NodeEditPanel 슬라이드 패널 동작 확인

---

## 5. 하위 호환성 주의사항

| 항목 | 주의 내용 |
|---|---|
| `createDefaultNode` | `WorkflowCanvas.tsx`에서 `NodePickerModal.tsx`로 이동 |
| `onDrop` / `onDragOver` | `WorkflowCanvas.tsx`에서 제거 (더블클릭으로 대체) |
| Handle ID | ConditionNode의 `true`/`false` handle ID는 기존 유지 (엣지 라벨 호환) |
| `nodeRunStatus` outline | 기존 `outline` CSS → 원형 노드의 `border` 색상으로 변경 |
| `screenToFlowPosition` | NodePickerModal에서도 동일하게 사용 (flow 좌표계 기준으로 노드 생성) |

---

## 6. 구현 후 예상 결과

```
[상단 타이틀바: "MIMIC Editor" ────────────────── [Import] [Share]]

                  ┌─────────────────────────────────────┐
                  │  ○ ──•••──> ○ ──•••──> ○  [+]       │
                  │ ▶         ⚡          ⏳              │
                  │ Trigger   Click       Wait           │
                  │ Manual    #btn        2000ms         │
                  │                                     │
                  │  (빈 공간 더블클릭 → 노드 피커 팝업) │
                  └─────────────────────────────────────┘

[하단 툴바: [▶ Run once ▾] [⊙ 15min] ─────────── [⚙][📋][▶]📊]
```

---

## 7. 참고: NodePickerModal 컴포넌트 스켈레톤

```typescript
// packages/editor/src/components/NodePickerModal.tsx

interface NodeTypeItem {
  type: string;
  label: string;
  desc: string;
  color: string;
  icon: string;
}

const NODE_TYPES_LIST: NodeTypeItem[] = [
  { type: 'trigger',   label: 'Trigger',   desc: '워크플로우 시작점', color: '#10B981', icon: '▶' },
  { type: 'action',    label: 'Action',    desc: '클릭·입력·이동',   color: '#3B82F6', icon: '⚡' },
  { type: 'wait',      label: 'Wait',      desc: '시간·요소 대기',   color: '#F59E0B', icon: '⏳' },
  { type: 'condition', label: 'Condition', desc: 'true/false 분기', color: '#F97316', icon: '◆' },
  { type: 'data',      label: 'Data',      desc: '데이터 추출',      color: '#8B5CF6', icon: '📦' },
];

export function NodePickerModal(): JSX.Element | null {
  const { pickerPosition, closeNodePicker, addNode } = useWorkflowStore();
  const [query, setQuery] = useState('');

  if (!pickerPosition) return null;

  const filtered = NODE_TYPES_LIST.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.includes(query),
  );

  function handleSelect(type: string): void {
    addNode(createDefaultNode(type, pickerPosition!));
    closeNodePicker();
  }

  // 팝업 위치: 클릭 좌표 기준 (화면 좌표계 필요 → store에 screen 좌표도 함께 저장)
  return (
    <div
      style={{
        position: 'fixed',
        top: /* screenY */ 200,
        left: /* screenX */ 300,
        zIndex: 1000,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        width: 480,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* 검색 인풋 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search node types..."
          style={{
            width: '100%',
            border: '1.5px solid #7C3AED',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* 노드 목록 */}
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 0' }}>
        {filtered.map((item) => (
          <button
            key={item.type}
            onClick={() => handleSelect(item.type)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

*이 문서는 Make.com UI 패턴을 MIMIC 에디터에 적용하기 위한 구현 가이드입니다.*  
*실제 구현은 Phase A → E 순서로 진행하며, 각 Phase 완료 후 동작 검증을 수행합니다.*
