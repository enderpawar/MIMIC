# Type Sync — shared 타입 일관성 점검

`packages/shared/src/types/`의 타입 정의와 각 패키지의 실제 사용이
일치하는지 확인한다.

## 점검 순서

### 1. shared 타입 현황 파악
`packages/shared/src/types/node.ts`와 `api.ts`를 읽고
현재 정의된 타입 목록을 파악한다.

### 2. extension 타입 사용 확인
`packages/extension/src/` 전체에서:
- `CapturedAction`, `ActionKind` import 경로가 `@flowcap/shared`인지 확인
- 직접 정의한 중복 타입이 없는지 확인
- `CapturedAction` 필드 (`index`, `timestamp`, `kind`, `selector`, `value`, `url`, `pageTitle`) 누락 여부

### 3. editor 타입 사용 확인
`packages/editor/src/` 전체에서:
- `WorkflowNode`, `WorkflowEdge`, `Workflow`, `RunEvent` import 경로 확인
- `workflowStore.ts`의 상태 타입이 shared와 일치하는지 확인
- `RunEvent` 필드 (`runId`, `nodeId`, `status`, `message`, `timestamp`) 사용 확인

### 4. interpreter 타입 사용 확인
`packages/interpreter/models/schemas.py`를 읽고:
- `InterpretRequest`의 Pydantic 모델이 shared `InterpretRequest` 타입과 일치하는지
- `InterpretResponse`의 Pydantic 모델이 shared `InterpretResponse` 타입과 일치하는지
- 필드명/타입 불일치 항목 보고

### 5. runner 타입 사용 확인
`packages/runner/src/` 전체에서:
- `RunRequest`, `RunEvent`, `Workflow` import 경로 확인
- `WorkflowExecutor`에서 사용하는 `WorkflowNode` 타입 필드가 shared와 일치하는지

## 보고 형식

```markdown
## TypeSyncReport

### shared 타입 목록
- node.ts: NodeType, ActionKind, WorkflowNode, WorkflowEdge, Workflow ...
- api.ts: CapturedAction, InterpretRequest, InterpretResponse, RunRequest, RunEvent ...

### 패키지별 타입 일치 여부
| 패키지 | 타입 | 상태 | 비고 |
|--------|------|------|------|
| extension | CapturedAction | ✅ | |
| editor | WorkflowNode | ✅ | |
| interpreter | InterpretRequest | ❌ | sessionId 필드 누락 |
| runner | RunEvent | ✅ | |

### 불일치 항목 (수정 필요)
- 없음 | 파일경로: 설명

### 권장 조치
- 없음 | 수정해야 할 파일과 방법 명시
```
