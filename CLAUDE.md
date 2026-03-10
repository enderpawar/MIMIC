# CLAUDE.md — MIMIC MVP 개발 컨텍스트

> Claude Code가 모든 세션에서 이 파일을 기준으로 코드를 생성합니다.
> 새 세션 시작 시 반드시 이 파일 전체를 읽고 시작하세요.

---

## 0. MVP 목표 & 완료 기준

**MIMIC MVP란?**
사용자가 Chrome Extension으로 브라우저 행동을 녹화하면,
AI가 자동으로 워크플로우 노드 그래프를 생성하고,
사용자가 이를 편집 후 실행할 수 있는 최소 동작 제품.

**MVP 완료 기준 (이것만 동작하면 MVP)**
- [ ] Chrome Extension에서 클릭·입력·네비게이션 이벤트를 캡처할 수 있다
- [ ] 캡처된 ActionLog를 interpreter로 전송하면 워크플로우 JSON이 반환된다
- [ ] 반환된 워크플로우가 editor에서 노드 그래프로 시각화된다
- [ ] 노드를 추가·삭제·수정할 수 있다
- [ ] 워크플로우를 runner로 전송하면 Playwright가 브라우저를 자동 실행한다
- [ ] 실행 진행 상황이 editor에 실시간으로 표시된다

**MVP에서 제외하는 것 (나중에 구현)**
- 사용자 인증·회원가입
- 워크플로우 저장·버전 관리
- 반복(Loop)·조건(Condition) 노드의 복잡한 처리
- 스케줄 트리거
- 팀 협업 기능

---

## 1. 프로젝트 구조

```
flowcap/
├── packages/
│   ├── extension/        # Chrome Extension MV3 (React + Vite)
│   ├── editor/           # Workflow Editor Web App (React + Vite)
│   ├── interpreter/      # AI 해석 서버 (Python + FastAPI)
│   ├── runner/           # 실행 엔진 (Node.js + Playwright)
│   └── shared/           # 공유 타입·상수·유틸 (TypeScript)
├── infra/
│   └── docker-compose.yml
├── .env.example
├── package.json          # pnpm workspace 루트
└── CLAUDE.md
```

**절대 규칙: 새 파일은 반드시 위 구조 안에 생성한다.**

---

## 2. 기술 스택 (변경 금지)

| 패키지 | 언어/런타임 | 핵심 라이브러리 | 배포 |
|--------|------------|----------------|------|
| extension | TypeScript | React 18, Vite, chrome MV3 | Chrome Web Store |
| editor | TypeScript | React 18, Vite, @xyflow/react, Zustand | Render Static Site |
| interpreter | Python 3.11 | FastAPI, google-generativeai, pydantic v2 | Render Web Service |
| runner | TypeScript/Node.js | Fastify, Playwright, BullMQ, socket.io | Render Web Service (Docker) |
| shared | TypeScript | zod | npm workspace |

**스택 변경이 필요하다고 판단될 때는 코드를 먼저 작성하지 말고
이유를 설명하고 사용자 확인을 받는다.**

---

## 3. 핵심 타입 정의 (shared 패키지 기준)

> 타입을 수정할 때는 반드시 `packages/shared/src/types/` 를 먼저 수정하고
> 영향받는 패키지를 이후에 업데이트한다.

```typescript
// packages/shared/src/types/node.ts

export type NodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'loop'
  | 'data'
  | 'wait'
  | 'notify'
  | 'subflow';

export type ActionKind =
  | 'click'
  | 'input'
  | 'scroll'
  | 'hover'
  | 'navigate'
  | 'keypress'
  | 'drag';

export interface BaseNode {
  id: string;                          // nanoid() 생성
  type: NodeType;
  label: string;
  position: { x: number; y: number }; // React Flow 좌표
}

export interface ActionNode extends BaseNode {
  type: 'action';
  action: {
    kind: ActionKind;
    selector: string;    // CSS selector 우선, XPath 차선
    value?: string;      // input 값, scroll px 등
    url: string;         // 액션이 발생한 페이지 URL
  };
}

export interface TriggerNode extends BaseNode {
  type: 'trigger';
  trigger: {
    kind: 'manual' | 'cron' | 'url_visit';
    cron?: string;
    urlPattern?: string;
  };
}

export interface ConditionNode extends BaseNode {
  type: 'condition';
  condition: {
    selector: string;
    operator: 'exists' | 'not_exists' | 'contains' | 'eq' | 'neq';
    value?: string;
  };
}

export interface WaitNode extends BaseNode {
  type: 'wait';
  wait: {
    kind: 'element' | 'duration' | 'network_idle';
    selector?: string;
    ms?: number;
    timeout?: number;    // default: 30000
  };
}

export interface DataNode extends BaseNode {
  type: 'data';
  data: {
    selector: string;
    attribute: 'textContent' | 'innerHTML' | 'href' | 'value' | 'src';
    variableName: string;
  };
}

export type WorkflowNode =
  | TriggerNode
  | ActionNode
  | ConditionNode
  | WaitNode
  | DataNode;

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: 'true' | 'false';    // ConditionNode 분기용
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// packages/shared/src/types/api.ts

// Extension → Interpreter
export interface CapturedAction {
  index: number;
  timestamp: number;       // Unix ms
  kind: ActionKind;
  selector: string;
  value?: string;
  url: string;
  pageTitle: string;
}

export interface InterpretRequest {
  sessionId: string;
  actions: CapturedAction[];
}

export interface InterpretResponse {
  workflow: Workflow;
  confidence: number;      // 0~1
  warnings: string[];
}

// Editor → Runner
export interface RunRequest {
  workflowId: string;
  workflow: Workflow;      // MVP에서는 DB 없이 직접 전달
  variables?: Record<string, string>;
  headless?: boolean;      // default: true
}

// Runner → Editor (WebSocket 이벤트)
export interface RunEvent {
  runId: string;
  nodeId: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  message?: string;
  timestamp: number;
}
```

---

## 4. 레이어 간 통신 규칙

```
extension  →(HTTP POST)→  interpreter : /api/interpret
editor     →(HTTP POST)→  runner      : /api/run
runner     →(WebSocket)→  editor      : ws://runner/ws/run/:runId
```

- **레이어 간 직접 함수 호출 금지.** 반드시 HTTP 또는 WebSocket.
- 모든 HTTP 요청/응답은 `shared/src/types/api.ts` 타입을 따른다.
- CORS는 개발 중 전체 허용(`*`), 배포 시 각 서비스 도메인만 허용.

---

## 5. 패키지별 구현 가이드

### 5-1. extension

**역할:** 사용자 인터랙션 캡처 → ActionLog 생성 → interpreter 전송

```
packages/extension/
├── src/
│   ├── background/
│   │   └── service-worker.ts    # chrome.runtime 메시지 허브
│   ├── content/
│   │   └── capture.ts           # DOM 이벤트 감지 (click, input, navigate)
│   ├── popup/
│   │   ├── Popup.tsx            # 녹화 시작/정지 버튼
│   │   └── main.tsx
│   └── types/                   # extension 전용 타입
├── manifest.json
├── vite.config.ts
└── package.json
```

**capture.ts 핵심 로직:**
```typescript
// 캡처 대상 이벤트
const CAPTURE_EVENTS = ['click', 'input', 'change', 'keydown'];

// 반드시 제외할 선택자 (보안 규칙 — 절대 변경 금지)
const EXCLUDED_SELECTORS = [
  'input[type="password"]',
  'input[autocomplete*="cc-"]',
  'input[autocomplete*="current-password"]',
];

function isExcluded(element: Element): boolean {
  return EXCLUDED_SELECTORS.some(sel => element.matches(sel));
}
```

**manifest.json 권한 (최소 권한 원칙):**
```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["<all_urls>"]
}
```

---

### 5-2. interpreter

**역할:** ActionLog → Gemini API → Workflow JSON 반환

```
packages/interpreter/
├── main.py                  # FastAPI 앱 진입점
├── routers/
│   └── interpret.py         # POST /api/interpret
├── services/
│   └── interpret_service.py # Gemini API 호출 + 파싱 로직
├── models/
│   └── schemas.py           # Pydantic 입출력 모델
├── prompts/
│   └── interpret.txt        # Gemini 프롬프트 템플릿
├── requirements.txt
└── Dockerfile
```

**interpret_service.py 핵심 로직:**
```python
import google.generativeai as genai
import json
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel(
    model_name="gemini-3.1-pro-preview",
    system_instruction="""
당신은 브라우저 자동화 전문가입니다.
사용자의 브라우저 인터랙션 로그를 분석하여
워크플로우 노드 그래프 JSON을 생성합니다.

반드시 아래 규칙을 따르세요:
1. 응답은 순수 JSON만 출력하세요. 설명 텍스트 금지.
2. 첫 노드는 항상 type: "trigger", kind: "manual" 로 시작하세요.
3. selector는 가장 안정적인 CSS selector를 사용하세요.
4. 연속된 동일 도메인 네비게이션은 하나의 navigate 노드로 합치세요.
"""
)

async def interpret(actions: list[dict]) -> dict:
    prompt = f"다음 액션 로그를 워크플로우로 변환하세요:\n{json.dumps(actions, ensure_ascii=False)}"
    response = model.generate_content(prompt)
    raw = response.text.strip()
    # Gemini가 ```json 블록으로 감쌀 경우 제거
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
```

**환경변수 관리 (pydantic-settings):**
```python
# models/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    redis_url: str = "redis://localhost:6379"
    database_url: str = ""
    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
```

---

### 5-3. editor

**역할:** 워크플로우 시각화·편집·실행 요청·실행 로그 표시

```
packages/editor/
├── src/
│   ├── components/
│   │   ├── WorkflowCanvas.tsx   # React Flow 캔버스
│   │   ├── nodes/
│   │   │   ├── ActionNodeCard.tsx
│   │   │   ├── TriggerNodeCard.tsx
│   │   │   └── ConditionNodeCard.tsx
│   │   ├── Sidebar.tsx          # 노드 추가 패널
│   │   ├── RunPanel.tsx         # 실행 버튼 + 로그 표시
│   │   └── ImportPanel.tsx      # Extension에서 워크플로우 불러오기
│   ├── store/
│   │   └── workflowStore.ts     # Zustand 상태 관리
│   ├── services/
│   │   ├── interpreterApi.ts    # interpreter HTTP 클라이언트
│   │   └── runnerSocket.ts      # runner WebSocket 클라이언트
│   └── main.tsx
├── vite.config.ts
└── package.json
```

**workflowStore.ts 구조:**
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WorkflowNode, WorkflowEdge, RunEvent } from '@flowcap/shared';

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

### React Flow v12 타입 패턴 (절대 변경 금지)
- `data`는 `Record<string, unknown>` 제약 → toFlowNodes에서 `data: n as unknown as Record<string, unknown>`
- 커스텀 노드 내부에서 `data as unknown as TriggerNode`로 복원
- `useReactFlow()` hook은 `<ReactFlow>`를 렌더링하는 컴포넌트에서 사용 불가
  → 반드시 `ReactFlowProvider` + 내부 컴포넌트(`CanvasInner`) 패턴으로 분리

### editor 추가 파일 (Phase 4에서 생성)
- `src/vite-env.d.ts` — import.meta.env 타입 선언 (필수)
- `src/types/chrome.d.ts` — editor에서 chrome API 최소 타입 선언
- `crypto.randomUUID()` 사용 (nanoid 설치 불필요, 이미 브라우저 내장)

```

---

### 5-4. runner

**역할:** Workflow JSON 수신 → Playwright로 브라우저 자동 실행 → 결과 스트리밍

```
packages/runner/
├── src/
│   ├── index.ts              # Fastify 앱 진입점
│   ├── routes/
│   │   └── run.ts            # POST /api/run
│   ├── executor/
│   │   ├── WorkflowExecutor.ts   # 노드 순차 실행 오케스트레이터
│   │   └── nodes/
│   │       ├── ActionExecutor.ts
│   │       ├── WaitExecutor.ts
│   │       └── DataExecutor.ts
│   └── socket/
│       └── runSocket.ts      # socket.io 이벤트 스트리밍
├── Dockerfile
└── package.json
```

**WorkflowExecutor.ts 핵심 로직:**
```typescript
import { chromium, Browser, Page } from 'playwright';
import { Workflow, WorkflowNode, RunEvent } from '@flowcap/shared';

export class WorkflowExecutor {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async execute(
    workflow: Workflow,
    onEvent: (event: RunEvent) => void
  ): Promise<void> {
    // 반드시 격리된 browserContext 사용 (보안 규칙 — 절대 변경 금지)
    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    try {
      for (const node of workflow.nodes) {
        if (node.type === 'trigger') continue;

        onEvent({
          runId: workflow.id,
          nodeId: node.id,
          status: 'running',
          timestamp: Date.now()
        });

        await this.executeNode(node);

        onEvent({
          runId: workflow.id,
          nodeId: node.id,
          status: 'success',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      // 에러 발생해도 반드시 브라우저 정리
    } finally {
      await this.browser?.close();
    }
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    if (node.type === 'action') {
      const { kind, selector, value } = node.action;
      switch (kind) {
        case 'click':
          await this.page.click(selector, { timeout: 10000 });
          break;
        case 'input':
          await this.page.fill(selector, value ?? '');
          break;
        case 'navigate':
          await this.page.goto(value ?? '', { waitUntil: 'domcontentloaded' });
          break;
        case 'scroll':
          await this.page.evaluate(
            `document.querySelector('${selector}')?.scrollIntoView()`
          );
          break;
      }
    }

    if (node.type === 'wait') {
      const { kind, selector, ms, timeout } = node.wait;
      switch (kind) {
        case 'element':
          await this.page.waitForSelector(selector!, { timeout: timeout ?? 30000 });
          break;
        case 'duration':
          await this.page.waitForTimeout(ms ?? 1000);
          break;
        case 'network_idle':
          await this.page.waitForLoadState('networkidle');
          break;
      }
    }
  }
}
```

---

## 6. 환경변수 관리

**로컬 개발용 `.env` (루트에 위치, 절대 git commit 금지)**
```bash
# Gemini (Google AI Studio에서 발급)
GEMINI_API_KEY=AIzaSyxxxxx

# Database (Render에서 복사)
DATABASE_URL=postgresql://flowcap:password@host/flowcap

# Redis (Upstash에서 복사)
REDIS_URL=redis://default:password@host:port

# 서비스 URL — 로컬 개발
VITE_INTERPRETER_URL=http://localhost:8000
VITE_RUNNER_URL=http://localhost:3001

# 서비스 URL — 배포 시 아래 주석 해제 후 위 항목 주석 처리
# VITE_INTERPRETER_URL=https://flowcap-interpreter.onrender.com
# VITE_RUNNER_URL=https://flowcap-runner.onrender.com
```

**`.gitignore`에 반드시 포함:**
```
.env
.env.local
node_modules/
__pycache__/
*.pyc
dist/
.venv/
```

---

## 7. 로컬 개발 실행 순서

```bash
# 터미널 1 — interpreter
cd packages/interpreter
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 터미널 2 — runner
cd packages/runner
pnpm install
pnpm dev                        # port 3001

# 터미널 3 — editor
cd packages/editor
pnpm install
pnpm dev                        # port 5173

# Chrome Extension 로드
# Chrome → 확장 프로그램 → 개발자 모드 ON
# → 압축해제된 확장 프로그램 로드 → packages/extension/dist 선택
```

---

## 8. Render 배포 설정

| 서비스 | 타입 | Root Directory | Build Command | Start Command |
|--------|------|---------------|---------------|---------------|
| editor | Static Site | packages/editor | `pnpm install && pnpm build` | — |
| interpreter | Web Service (Python) | packages/interpreter | `pip install -r requirements.txt` | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| runner | Web Service (Docker) | packages/runner | — (Dockerfile 자동 감지) | — |

**배포 시 각 서비스 환경변수:**
```
# interpreter + runner 공통
GEMINI_API_KEY      = (Google AI Studio에서 발급)
REDIS_URL           = (Upstash 대시보드에서 복사)
DATABASE_URL        = (Render PostgreSQL Internal URL)

# editor
VITE_INTERPRETER_URL = https://[interpreter 서비스명].onrender.com
VITE_RUNNER_URL      = https://[runner 서비스명].onrender.com
```

---

## 9. 코딩 규칙

### 공통
```
✅ 모든 함수에 반환 타입 명시
✅ 에러는 반드시 try/catch 처리 후 의미있는 메시지 포함
✅ 환경변수는 코드 상단에서 한 번만 읽고 상수로 사용
✅ 새 기능은 테스트 파일과 함께 작성

❌ any 타입 사용 금지 → unknown + 타입가드 사용
❌ console.log 디버깅 금지 → 구조화 로그 사용
❌ 하드코딩 URL·selector 금지 → 상수 파일로 분리
❌ localStorage / sessionStorage 사용 금지
```

### 보안 (절대 변경 금지)
```
❌ password·신용카드 입력 필드는 캡처 대상에서 반드시 제외
❌ Playwright는 반드시 격리된 browserContext에서 실행
❌ API 키는 코드에 하드코딩 금지, 반드시 환경변수
❌ eval() 사용 금지
```

### Python
```
✅ 모든 입출력 모델은 Pydantic v2로 정의
✅ 비동기 함수는 async def + await 일관 사용
✅ HTTP 클라이언트는 httpx (requests 사용 금지)
```

---

## 10. 커밋 컨벤션

```
feat(패키지명): 기능 설명
fix(패키지명): 버그 수정 내용
refactor(패키지명): 리팩토링 내용
test(패키지명): 테스트 추가/수정
chore: 의존성 업데이트, 설정 변경
docs: 문서 수정

예시:
feat(extension): 클릭 이벤트 캡처 로직 구현
fix(runner): Playwright 타임아웃 재시도 처리 추가
feat(interpreter): Gemini API 노드 변환 서비스 구현
```

패키지명: `extension` | `editor` | `interpreter` | `runner` | `shared`

---

## 11. MVP 구현 순서

```
Phase 1 — 기반 세팅 (1주)
  [ ] shared 패키지 타입 정의 완성 (node.ts, api.ts)
  [ ] pnpm workspace 루트 package.json 설정
  [ ] .env.example 작성
  [ ] 각 패키지 boilerplate 생성 (빈 구조만)
  [ ] GitHub 저장소 push + Render 서비스 연결

Phase 2 — 캡처 (1주)
  [ ] extension content script 이벤트 캡처 (click, input, navigate)
  [ ] 비밀번호 필드 자동 제외 로직
  [ ] ActionLog JSON 직렬화
  [ ] popup UI (녹화 시작/정지 버튼)
  [ ] background service worker 메시지 허브

Phase 3 — AI 해석 (1주)
  [ ] interpreter FastAPI 기본 구조 + /health 엔드포인트
  [ ] Gemini API 연동 + 프롬프트 작성 (gemini-3.1-pro-preview)
  [ ] InterpretRequest → Workflow JSON 변환
  [ ] /api/interpret 엔드포인트 단위 테스트
  

Phase 4 — 에디터 (1주)
  [ ] React Flow 캔버스 기본 세팅
  [ ] 커스텀 노드 컴포넌트 (Action, Trigger, Wait)
  [ ] Zustand 상태 관리 연결
  [ ] interpreter 호출 후 워크플로우 렌더링
  [ ] 노드 추가·삭제·수정 UI

Phase 5 — 실행 (1주)
  [ ] runner Fastify 기본 구조 + Dockerfile
  [ ] WorkflowExecutor 노드별 실행 로직
  [ ] socket.io 실행 이벤트 스트리밍
  [ ] editor RunPanel 실시간 로그 표시

Phase 6 — 통합 & 배포 (3일)
  [ ] Extension → Interpreter → Editor → Runner 전체 흐름 테스트
  [ ] 에러 케이스 처리 (타임아웃, 셀렉터 없음 등)
  [ ] Render 전체 서비스 배포
  [ ] 실환경 E2E 동작 검증
```

---

## 12. 작업 시작 전 체크리스트

새 기능 구현 전 Claude Code가 반드시 확인하는 항목:

1. **타입 먼저** — `shared/src/types/`에 필요한 타입이 있는가? 없으면 추가 먼저.
2. **레이어 경계** — 이 로직이 속할 패키지가 명확한가?
3. **통신 규칙** — 레이어 간 통신이 HTTP/WebSocket을 통하는가?
4. **보안 규칙** — 비밀번호 필드 제외, API 키 환경변수, browserContext 격리가 지켜지는가?
5. **MVP 범위** — 섹션 0의 MVP 제외 목록에 해당하는 기능은 아닌가?
6. **환경변수** — 하드코딩된 URL·키·selector가 없는가?

---

## 13. 자주 쓰는 명령어 레퍼런스

```bash
# 전체 의존성 설치
pnpm install

# 패키지별 실행
pnpm --filter @flowcap/editor dev
pnpm --filter @flowcap/runner dev
pnpm --filter @flowcap/shared build

# Extension 빌드
pnpm --filter @flowcap/extension build

# Python 가상환경
cd packages/interpreter
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Docker로 runner 로컬 테스트
docker build -t flowcap-runner ./packages/runner
docker run -p 3001:3001 --env-file .env flowcap-runner

# 헬스체크
curl http://localhost:8000/health   # interpreter
curl http://localhost:3001/health   # runner
```