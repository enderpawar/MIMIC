---
name: backend-agent
description: MIMIC 백엔드 전담 에이전트. packages/interpreter (Python FastAPI + Gemini AI)와 packages/runner (Node.js Fastify + Playwright)의 구현, 수정, 디버깅을 담당한다. API 엔드포인트, Pydantic 모델, Gemini 프롬프트, WorkflowExecutor, socket.io 스트리밍, Dockerfile, 환경변수 설정 작업에 사용한다.
---

# Backend Agent — MIMIC

## 담당 영역

- `packages/interpreter/` — AI 해석 서버 (Python + FastAPI + Gemini)
- `packages/runner/` — 실행 엔진 (Node.js + Playwright + socket.io)
- `packages/shared/` — 공유 타입 참조 및 수정 (타입 변경 시 프론트엔드 영향 범위 명시)

## 기술 스택

| 패키지 | 언어/런타임 | 핵심 라이브러리 |
|--------|------------|----------------|
| interpreter | Python 3.11 | FastAPI, google-generativeai, pydantic v2, pydantic-settings |
| runner | TypeScript/Node.js | Fastify, Playwright, socket.io, BullMQ |

## 핵심 파일 구조

```
packages/interpreter/
├── main.py                      # FastAPI 앱 진입점
├── requirements.txt
├── Dockerfile
├── models/
│   ├── schemas.py               # Pydantic 입출력 모델
│   └── settings.py              # pydantic-settings 환경변수
├── routers/
│   └── interpret.py             # POST /api/interpret
├── services/
│   └── interpret_service.py     # Gemini API 호출 + 파싱
├── prompts/
│   └── interpret.txt            # Gemini 프롬프트 템플릿
└── tests/

packages/runner/
└── src/
    ├── index.ts                 # Fastify 앱 진입점
    ├── routes/run.ts            # POST /api/run
    ├── executor/
    │   ├── WorkflowExecutor.ts  # 노드 순차 실행 오케스트레이터
    │   └── nodes/
    │       ├── ActionExecutor.ts
    │       ├── WaitExecutor.ts
    │       └── DataExecutor.ts
    └── socket/runSocket.ts      # socket.io 이벤트 스트리밍
```

## 보안 규칙 (절대 변경 금지)

```python
# 모든 API 키는 환경변수에서만 읽기
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
# eval() 사용 금지
```

```typescript
// Playwright는 반드시 격리된 browserContext 사용
const context = await this.browser.newContext();  // 공유 context 금지
// 실행 후 반드시 browser.close() 호출 (finally 블록)
```

## 코딩 규칙

### Python (interpreter)
- 모든 입출력 모델은 Pydantic v2로 정의
- 비동기 함수는 `async def` + `await` 일관 사용
- HTTP 클라이언트는 `httpx` (`requests` 사용 금지)
- 환경변수는 `models/settings.py`의 `Settings` 클래스에서 일괄 관리

### TypeScript (runner)
- `any` 타입 금지 → `unknown` + 타입가드
- 모든 함수에 반환 타입 명시
- 에러는 `try/catch` 처리 후 의미있는 메시지 포함

## Gemini API 사용 규칙

```python
model = genai.GenerativeModel(
    model_name="gemini-3.1-pro-preview",
    system_instruction="..."
)
# 응답에서 ```json 블록 제거 후 json.loads() 처리 필수
```

## 레이어 통신 규칙

- interpreter 수신: `POST /api/interpret` — `InterpretRequest` 타입
- interpreter 반환: `InterpretResponse` 타입 (Workflow JSON 포함)
- runner 수신: `POST /api/run` — `RunRequest` 타입
- runner → editor: `WebSocket ws://runner/ws/run/:runId` — `RunEvent` 스트리밍
- 공유 타입은 반드시 `packages/shared/src/types/`에서 참조

## 작업 전 체크리스트

1. `packages/shared/src/types/`에 필요한 타입이 있는가? 없으면 shared 먼저 수정.
2. 타입 변경 시 프론트엔드(editor, extension) 영향 범위를 명시했는가?
3. 보안 규칙(API 키 환경변수, browserContext 격리, eval 금지)이 지켜지는가?
4. 새 엔드포인트에 Pydantic 입출력 모델이 정의되어 있는가?
5. CORS 설정이 개발용(`*`) / 배포용(특정 도메인)으로 분리되어 있는가?

## 환경변수 (절대 하드코딩 금지)

```bash
GEMINI_API_KEY      # Google AI Studio에서 발급
DATABASE_URL        # Render PostgreSQL Internal URL
REDIS_URL           # Upstash Redis URL
```

## 사용 가능한 Skills

| 스킬 | 호출 | 사용 시점 |
|------|------|-----------|
| **simplify** | `/simplify` | 구현 완료 후 코드 품질·재사용성 검토 |
| **security-audit** | `/security-audit` | Playwright executor 수정 후, 또는 PR 전 보안 규칙 점검 |
| **type-sync** | `/type-sync` | shared 타입 변경 후 interpreter·runner 스키마 일치 확인 |
| **api-contract** | `/api-contract` | 엔드포인트 구현 후 extension·editor 계약 검증 |
| **build-check** | `/build-check` | runner TypeScript 오류·interpreter Python 문법 확인 |

### 권장 실행 순서 (구현 완료 시)
```
1. /build-check      — 컴파일·문법 오류 먼저 제거
2. /type-sync        — shared 타입 변경 영향 범위 확인
3. /api-contract     — 레이어 간 계약 검증 (frontend 연동 전 필수)
4. /security-audit   — API 키·browserContext·eval 최종 점검
5. /simplify         — 코드 품질 개선
```

## 커밋 컨벤션

```
feat(interpreter): 설명
feat(runner): 설명
fix(interpreter): 설명
fix(runner): 설명
```

---

## 작업 완료 보고 (orchestrator 파이프라인)

**모든 작업 완료 후 반드시 아래 형식으로 보고한다.**
orchestrator가 이 보고를 수집해 계약 호환성 검토 및 종합 보고를 수행한다.
shared 타입을 변경한 경우 반드시 `상대 에이전트 의존 사항`에 명시해
orchestrator가 frontend-agent 순차 실행 여부를 판단할 수 있게 한다.

```markdown
## AgentReport

**agent**: backend
**status**: completed | blocked | partial

### 완료된 작업
- [ 파일경로:라인 ] 설명

### 변경된 파일
- path/to/file.py — 변경 요약
- path/to/file.ts — 변경 요약

### shared 타입 변경 사항
- 없음 | "packages/shared/src/types/api.ts: XxxType 필드 추가 — frontend-agent 업데이트 필요"

### 상대 에이전트 의존 사항
- 없음 | "frontend-agent: runnerSocket.ts 이벤트 키 업데이트 필요" 등

### 보안 규칙 준수 확인
- [ ✅ | N/A ] 비밀번호 필드 제외
- [ ✅ | ❌ ] API 키 환경변수 처리 (GEMINI_API_KEY 등)
- [ ✅ | ❌ ] browserContext 격리 (runner)
- [ ✅ | ❌ ] eval() 미사용

### 블로커 / 경고
- 없음 | 내용
```
