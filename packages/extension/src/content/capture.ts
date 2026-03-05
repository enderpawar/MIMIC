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

function getSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  if (element.className) {
    const cls = Array.from(element.classList).join('.');
    if (cls) return `${element.tagName.toLowerCase()}.${cls}`;
  }
  return element.tagName.toLowerCase();
}

let actionIndex = 0;

function sendAction(action: Omit<CapturedAction, 'index' | 'timestamp' | 'url' | 'pageTitle'>): void {
  const payload: CapturedAction = {
    ...action,
    index: actionIndex++,
    timestamp: Date.now(),
    url: window.location.href,
    pageTitle: document.title,
  };
  chrome.runtime.sendMessage({ type: 'CAPTURE_ACTION', payload });
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  if (isExcluded(target)) return;
  sendAction({ kind: 'click', selector: getSelector(target) });
}, true);

document.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  if (isExcluded(target)) return;
  sendAction({ kind: 'input', selector: getSelector(target), value: target.value });
}, true);
