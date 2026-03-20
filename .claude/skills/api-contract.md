# API Contract — 레이어 간 통신 계약 검증

MIMIC의 레이어 간 HTTP/WebSocket 통신 계약이 양쪽 모두에서
올바르게 구현되어 있는지 확인한다.

## 점검 대상 레이어

```
extension  →(HTTP POST /api/interpret)→  interpreter
editor     →(HTTP POST /api/run)→        runner
runner     →(WebSocket ws/run/:runId)→   editor
```

## 점검 순서

### 1. extension → interpreter 계약

**송신측 (extension) 확인:**
`packages/extension/src/` 에서 interpreter 호출 코드를 찾아:
- 엔드포인트: `POST /api/interpret` 여부
- 요청 바디: `InterpretRequest` (`sessionId: string`, `actions: CapturedAction[]`) 구조
- `Content-Type: application/json` 헤더 여부
- 에러 처리 (네트워크 실패, 4xx/5xx) 여부

**수신측 (interpreter) 확인:**
`packages/interpreter/routers/interpret.py`를 읽어:
- `POST /api/interpret` 라우트 존재 여부
- Pydantic 모델로 `InterpretRequest` 파싱 여부
- `InterpretResponse` 형식으로 반환 여부 (`workflow`, `confidence`, `warnings`)
- CORS 설정 여부

### 2. editor → runner 계약

**송신측 (editor) 확인:**
`packages/editor/src/services/` 에서 runner 호출 코드를 찾아:
- 엔드포인트: `POST /api/run` 여부
- 요청 바디: `RunRequest` (`workflowId`, `workflow`, `variables?`, `headless?`) 구조
- 에러 처리 여부

**수신측 (runner) 확인:**
`packages/runner/src/routes/run.ts`를 읽어:
- `POST /api/run` 라우트 존재 여부
- `RunRequest` 타입 파싱 여부
- runId 반환 여부

### 3. runner → editor WebSocket 계약

**송신측 (runner) 확인:**
`packages/runner/src/socket/runSocket.ts`를 읽어:
- `RunEvent` 형식 (`runId`, `nodeId`, `status`, `message?`, `timestamp`) 이벤트 발행 여부
- status 값: `'running' | 'success' | 'failed' | 'skipped'`

**수신측 (editor) 확인:**
`packages/editor/src/services/runnerSocket.ts`를 읽어:
- WebSocket 연결 경로: `ws://[runner]/ws/run/:runId` 여부
- `RunEvent` 타입으로 파싱 후 `addRunEvent()` 호출 여부

## 보고 형식

```markdown
## ApiContractReport

### extension → interpreter
- [ ✅ | ❌ ] 엔드포인트 일치 (POST /api/interpret)
- [ ✅ | ❌ ] 요청 스키마 일치 (InterpretRequest)
- [ ✅ | ❌ ] 응답 스키마 일치 (InterpretResponse)
- [ ✅ | ❌ ] 에러 처리 존재

### editor → runner
- [ ✅ | ❌ ] 엔드포인트 일치 (POST /api/run)
- [ ✅ | ❌ ] 요청 스키마 일치 (RunRequest)
- [ ✅ | ❌ ] runId 응답 처리

### runner → editor (WebSocket)
- [ ✅ | ❌ ] 연결 경로 일치 (ws/run/:runId)
- [ ✅ | ❌ ] RunEvent 스키마 일치
- [ ✅ | ❌ ] status 값 일치

### 불일치 항목
- 없음 | 파일경로:라인 — 설명 및 수정 방법
```
