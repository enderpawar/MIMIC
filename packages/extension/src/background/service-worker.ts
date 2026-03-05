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
      chrome.storage.local.remove(['capturedActions']);
      sendResponse({ ok: true, sessionId });
      break;

    case 'STOP_RECORDING':
      isRecording = false;
      sendResponse({ ok: true, actions: capturedActions });
      break;

    case 'CAPTURE_ACTION':
      if (isRecording) {
        capturedActions.push(message.payload as CapturedAction);
        sendResponse({ ok: true });
      }
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
