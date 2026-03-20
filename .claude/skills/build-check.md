# Build Check — 컴파일·빌드 검증

각 패키지의 TypeScript 컴파일과 Vite 빌드가 오류 없이 통과하는지 확인한다.

## 실행 순서

### 1. shared 패키지 빌드 (의존성 선행 필수)
```bash
pnpm --filter @flowcap/shared build
```
오류 발생 시 `packages/shared/src/types/` 타입 정의 오류이므로
다른 패키지 빌드 전에 반드시 수정한다.

### 2. extension TypeScript 타입 체크
```bash
pnpm --filter @flowcap/extension typecheck
# 또는
cd packages/extension && npx tsc --noEmit
```

### 3. editor TypeScript 타입 체크
```bash
pnpm --filter @flowcap/editor typecheck
# 또는
cd packages/editor && npx tsc --noEmit
```

### 4. runner TypeScript 타입 체크
```bash
cd packages/runner && npx tsc --noEmit
```

### 5. interpreter Python 문법 검사
```bash
cd packages/interpreter
python -m py_compile main.py routers/interpret.py services/interpret_service.py models/schemas.py
```

### 6. extension Vite 빌드 (Chrome Extension 번들링)
```bash
pnpm --filter @flowcap/extension build
```
`packages/extension/dist/` 아래 결과물 확인.

### 7. editor Vite 빌드
```bash
pnpm --filter @flowcap/editor build
```

## 오류 대응 가이드

| 오류 패턴 | 원인 | 조치 |
|-----------|------|------|
| `Cannot find module '@flowcap/shared'` | shared 빌드 미완료 | Step 1 재실행 |
| `Type 'X' is not assignable to type 'Y'` | shared 타입 불일치 | `/type-sync` 실행 |
| `Property 'X' does not exist` | 타입 정의 누락 | shared 타입 업데이트 |
| `SyntaxError` (Python) | 문법 오류 | 해당 파일 수정 |
| `Module not found` (Vite) | import 경로 오류 | 경로 및 파일명 확인 |

## 보고 형식

```markdown
## BuildCheckReport

| 패키지 | 명령 | 결과 | 오류 요약 |
|--------|------|------|-----------|
| shared | build | ✅ PASS | |
| extension | tsc --noEmit | ✅ PASS | |
| editor | tsc --noEmit | ❌ FAIL | WorkflowNode 타입 불일치 |
| runner | tsc --noEmit | ✅ PASS | |
| interpreter | py_compile | ✅ PASS | |
| extension | vite build | ✅ PASS | |
| editor | vite build | ✅ PASS | |

### 수정 필요 항목
- 없음 | 파일경로:라인 — 오류 내용 및 수정 방법
```
