# Security Audit — MIMIC 보안 규칙 점검

MIMIC 프로젝트의 보안 규칙 준수 여부를 점검한다.
아래 항목을 순서대로 확인하고 위반 사항을 보고한다.

## 점검 대상

### 1. Extension 캡처 제외 선택자 (capture.ts)
`packages/extension/src/content/capture.ts`를 읽고 확인:
- `input[type="password"]` 제외 여부
- `input[autocomplete*="cc-"]` 제외 여부
- `input[autocomplete*="current-password"]` 제외 여부
- `isExcluded()` 함수가 이벤트 핸들러에서 호출되는지 확인

### 2. API 키 하드코딩 점검
아래 패턴을 프로젝트 전체에서 검색:
- `AIzaSy` (Gemini API 키 prefix)
- `sk-` (OpenAI 키 prefix)
- `GEMINI_API_KEY=` (값이 있는 경우)

위반 파일이 있으면 즉시 환경변수로 교체할 것.

### 3. Playwright browserContext 격리 확인 (WorkflowExecutor.ts)
`packages/runner/src/executor/WorkflowExecutor.ts`를 읽고 확인:
- `browser.newContext()` 호출 여부 (공유 context 사용 금지)
- `finally` 블록에 `browser?.close()` 존재 여부

### 4. eval() 사용 금지
`packages/` 전체에서 `eval(` 패턴 검색.
발견 시 파일 경로와 라인 번호를 보고하고 대안 제시.

### 5. localStorage / sessionStorage 금지 (extension, editor)
`localStorage` / `sessionStorage` 사용 여부 검색.
발견 시 chrome.storage.session 또는 Zustand로 교체 안내.

## 보고 형식

```markdown
## SecurityAuditReport

### 1. 캡처 제외 선택자
- [ ✅ | ❌ ] password 필드 제외
- [ ✅ | ❌ ] 신용카드 필드 제외

### 2. API 키 하드코딩
- [ ✅ 없음 | ❌ 위반: 파일경로:라인 ]

### 3. browserContext 격리
- [ ✅ | ❌ ] newContext() 사용
- [ ✅ | ❌ ] finally browser.close()

### 4. eval() 사용
- [ ✅ 없음 | ❌ 위반: 파일경로:라인 ]

### 5. localStorage/sessionStorage
- [ ✅ 없음 | ❌ 위반: 파일경로:라인 ]

### 종합 판정
- PASS / FAIL (위반 항목 요약)
```
