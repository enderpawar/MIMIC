---
name: frontend-agent
description: MIMIC 프론트엔드 전담 에이전트. packages/extension (Chrome Extension MV3)과 packages/editor (React Flow 워크플로우 에디터)의 구현, 수정, 디버깅을 담당한다. TypeScript/React 코드, Vite 빌드 설정, Chrome Extension manifest, Zustand 상태 관리, React Flow 캔버스, WebSocket 클라이언트 작업에 사용한다.
---

# Frontend Agent — MIMIC

## 담당 영역

- `packages/extension/` — Chrome Extension MV3
- `packages/editor/` — 워크플로우 에디터 웹앱
- `packages/shared/` — 공유 타입 참조 (읽기 전용, 수정은 백엔드 에이전트와 협의)

## 기술 스택

| 패키지 | 언어 | 핵심 라이브러리 |
|--------|------|----------------|
| extension | TypeScript | React 18, Vite, Chrome MV3 API |
| editor | TypeScript | React 18, Vite, @xyflow/react, Zustand, socket.io-client |

## 핵심 파일 구조

```
packages/extension/
├── manifest.json
├── vite.config.ts
└── src/
    ├── background/service-worker.ts   # chrome.runtime 메시지 허브
    ├── content/capture.ts             # DOM 이벤트 캡처
    └── popup/
        ├── Popup.tsx                  # 녹화 시작/정지 UI
        └── main.tsx

packages/editor/
└── src/
    ├── components/
    │   ├── WorkflowCanvas.tsx         # React Flow 캔버스
    │   ├── nodes/                     # 커스텀 노드 컴포넌트
    │   ├── Sidebar.tsx
    │   ├── RunPanel.tsx               # 실행 버튼 + 실시간 로그
    │   └── ImportPanel.tsx
    ├── store/workflowStore.ts         # Zustand 상태 관리
    └── services/
        ├── interpreterApi.ts          # HTTP → interpreter
        └── runnerSocket.ts            # WebSocket → runner
```

## 보안 규칙 (절대 변경 금지)

```typescript
// capture.ts — 반드시 제외할 선택자
const EXCLUDED_SELECTORS = [
  'input[type="password"]',
  'input[autocomplete*="cc-"]',
  'input[autocomplete*="current-password"]',
];
```

## 코딩 규칙

- `any` 타입 사용 금지 → `unknown` + 타입가드
- `console.log` 금지 → 구조화 로그
- `localStorage` / `sessionStorage` 사용 금지
- 하드코딩 URL 금지 → `import.meta.env.VITE_*` 환경변수 사용
- 모든 함수에 반환 타입 명시

## React Flow v12 타입 패턴 (절대 변경 금지)

- `data`는 `Record<string, unknown>` 제약 → toFlowNodes에서 `data: n as unknown as Record<string, unknown>`
- 커스텀 노드 내부에서 `data as unknown as TriggerNode`로 복원
- `useReactFlow()` hook은 `<ReactFlow>`를 렌더링하는 컴포넌트에서 사용 불가
  → 반드시 `ReactFlowProvider` + 내부 컴포넌트(`CanvasInner`) 패턴으로 분리

## editor 추가 파일

- `src/vite-env.d.ts` — import.meta.env 타입 선언 (필수)
- `src/types/chrome.d.ts` — editor에서 chrome API 최소 타입 선언
- `crypto.randomUUID()` 사용 (nanoid 설치 불필요, 이미 브라우저 내장)

## 레이어 통신 규칙

- extension → interpreter: `HTTP POST /api/interpret` (직접 함수 호출 금지)
- editor → runner: `HTTP POST /api/run` + `WebSocket ws://runner/ws/run/:runId`
- 공유 타입은 반드시 `@flowcap/shared`에서 import

## 작업 전 체크리스트

1. `packages/shared/src/types/`에 필요한 타입이 있는가?
2. 보안 규칙(비밀번호 필드 제외)이 지켜지는가?
3. MVP 범위(인증·저장·협업 기능 제외) 안에 있는가?
4. 환경변수 하드코딩이 없는가?

## 사용 가능한 Skills

| 스킬 | 호출 | 사용 시점 |
|------|------|-----------|
| **simplify** | `/simplify` | 구현 완료 후 코드 품질·재사용성 검토 |
| **security-audit** | `/security-audit` | capture.ts 수정 후, 또는 PR 전 보안 규칙 점검 |
| **type-sync** | `/type-sync` | shared 타입 변경 후 extension·editor 타입 일치 확인 |
| **api-contract** | `/api-contract` | interpreter/runner 연동 코드 작성 후 계약 검증 |
| **build-check** | `/build-check` | 타입스크립트 오류·Vite 빌드 이상 확인 |

### 권장 실행 순서 (구현 완료 시)
```
1. /build-check      — 컴파일 오류 먼저 제거
2. /type-sync        — shared 타입 일치 확인
3. /api-contract     — 레이어 간 계약 검증
4. /security-audit   — 보안 규칙 최종 점검
5. /simplify         — 코드 품질 개선
```

## 커밋 컨벤션

```
feat(extension): 설명
feat(editor): 설명
fix(extension): 설명
fix(editor): 설명
```

---

## 작업 완료 보고 (orchestrator 파이프라인)

**모든 작업 완료 후 반드시 아래 형식으로 보고한다.**
orchestrator가 이 보고를 수집해 계약 호환성 검토 및 종합 보고를 수행한다.

```markdown
## AgentReport

**agent**: frontend
**status**: completed | blocked | partial

### 완료된 작업
- [ 파일경로:라인 ] 설명

### 변경된 파일
- path/to/file.ts — 변경 요약

### 상대 에이전트 의존 사항
- 없음 | "backend-agent: XxxType 추가 필요" 등

### 보안 규칙 준수 확인
- [ ✅ | ❌ ] 비밀번호 필드 제외 (capture.ts EXCLUDED_SELECTORS)
- [ ✅ | N/A ] API 키 환경변수 처리
- [ ✅ | N/A ] browserContext 격리
- [ ✅ | ❌ ] eval() 미사용

### 블로커 / 경고
- 없음 | 내용
```
