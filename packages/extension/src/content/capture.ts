import type { CapturedAction } from '@flowcap/shared';

// 반드시 제외할 선택자 (보안 규칙 — 절대 변경 금지)
const EXCLUDED_SELECTORS = [
  'input[type="password"]',
  'input[autocomplete*="cc-"]',
  'input[autocomplete*="current-password"]',
];

function isExcluded(element: Element): boolean {
  return EXCLUDED_SELECTORS.some(sel => element.matches(sel));
}

// selector 우선순위: id > data-testid > class > tag
function getSelector(element: Element): string {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
  if (element.className) {
    const cls = Array.from(element.classList).map(c => CSS.escape(c)).join('.');
    if (cls) return `${element.tagName.toLowerCase()}.${cls}`;
  }
  return element.tagName.toLowerCase();
}

let actionIndex = 0;
const sessionActions: CapturedAction[] = [];
let isRecording = false;

// 페이지 재로드 후 연속성: 기존 저장 액션 로드 및 인덱스 복원
chrome.storage.local.get(['capturedActions'], (result) => {
  const existing: CapturedAction[] =
    (result as { capturedActions?: CapturedAction[] })['capturedActions'] ?? [];
  existing.forEach(a => sessionActions.push(a));
  actionIndex = sessionActions.length;
});

// 녹화 상태 동기화
chrome.runtime.onMessage.addListener((message: { type: string }) => {
  if (message.type === 'START_RECORDING') isRecording = true;
  if (message.type === 'STOP_RECORDING') isRecording = false;
});

function sendAction(action: Omit<CapturedAction, 'index' | 'timestamp' | 'url' | 'pageTitle'>): void {
  if (!isRecording) return;
  const payload: CapturedAction = {
    ...action,
    index: actionIndex++,
    timestamp: Date.now(),
    url: window.location.href,
    pageTitle: document.title,
  };
  sessionActions.push(payload);
  chrome.storage.local.set({ capturedActions: sessionActions });
  chrome.runtime.sendMessage({ type: 'CAPTURE_ACTION', payload });
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  if (isExcluded(target)) return;
  sendAction({ kind: 'click', selector: getSelector(target) });
}, true);

// input 디바운스: 마지막 값만 저장 (300ms)
const _inputTimers = new Map<Element, ReturnType<typeof setTimeout>>();
document.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  if (isExcluded(target)) return;
  const existing = _inputTimers.get(target);
  if (existing !== undefined) clearTimeout(existing);
  _inputTimers.set(
    target,
    setTimeout(() => {
      _inputTimers.delete(target);
      sendAction({ kind: 'input', selector: getSelector(target), value: target.value });
    }, 300),
  );
}, true);

// navigate: 뒤로/앞으로 버튼 및 해시 변경
window.addEventListener('popstate', () => {
  sendAction({ kind: 'navigate', selector: 'window', value: window.location.href });
});

// navigate: SPA 프로그래밍 방식 내비게이션 (pushState / replaceState)
const originalPushState = history.pushState.bind(history);
history.pushState = (...args: Parameters<typeof history.pushState>): void => {
  originalPushState(...args);
  sendAction({ kind: 'navigate', selector: 'window', value: window.location.href });
};

const originalReplaceState = history.replaceState.bind(history);
history.replaceState = (...args: Parameters<typeof history.replaceState>): void => {
  originalReplaceState(...args);
  sendAction({ kind: 'navigate', selector: 'window', value: window.location.href });
};
