import type { CapturedAction, InterpretRequest } from '@flowcap/shared';

const INTERPRETER_URL: string =
  (import.meta.env.VITE_INTERPRETER_URL as string | undefined) ?? 'http://localhost:8000';

let isRecording = false;
let capturedActions: CapturedAction[] = [];
let sessionId = '';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      isRecording = true;
      capturedActions = [];
      sessionId = crypto.randomUUID();
      // isRecording을 storage에 영속 — 페이지 이동 시 content script 재로드 후 복원에 사용
      chrome.storage.local.remove(['capturedActions', 'isRecording'], () => {
        chrome.storage.local.set({ isRecording: true });
      });
      sendResponse({ ok: true, sessionId });
      break;

    case 'STOP_RECORDING':
      isRecording = false;
      chrome.storage.local.set({ isRecording: false });
      sendResponse({ ok: true, actions: capturedActions });
      break;

    case 'CAPTURE_ACTION':
      // Service worker 재시작 시 in-memory isRecording이 초기화되므로 storage로 확인
      chrome.storage.local.get(['isRecording'], (result) => {
        const recording = isRecording || !!(result as { isRecording?: boolean })['isRecording'];
        if (recording) {
          isRecording = true; // 메모리 동기화
          capturedActions.push(message.payload as CapturedAction);
        }
        sendResponse({ ok: recording });
      });
      break;

    case 'SEND_TO_INTERPRETER': {
      chrome.storage.local.get(['capturedActions'], (result) => {
        const actions: CapturedAction[] =
          (result as { capturedActions?: CapturedAction[] })['capturedActions'] ?? [];
        const body: InterpretRequest = { sessionId, actions };
        fetch(`${INTERPRETER_URL}/api/interpret`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
          .then(res => res.json())
          .then(data => {
            chrome.storage.local.set({ lastWorkflow: data });
            sendResponse({ ok: true, data });
          })
          .catch(err => sendResponse({ ok: false, error: String(err) }));
      });
      return true; // async response
    }
  }
  return true;
});
