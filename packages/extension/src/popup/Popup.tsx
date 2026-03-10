import { useState, useEffect } from 'react';

type State = 'idle' | 'recording' | 'sending';

export function Popup(): JSX.Element {
  const [state, setState] = useState<State>('idle');
  const [actionCount, setActionCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  // 팝업이 닫혔다 다시 열려도 녹화 상태 복원 — chrome state는 React state와 무관하게 유지됨
  useEffect(() => {
    chrome.storage.local.get(['isRecording', 'capturedActions'], (result) => {
      const res = result as { isRecording?: boolean; capturedActions?: unknown[] };
      if (res['isRecording']) {
        setState('recording');
        setActionCount(res['capturedActions']?.length ?? 0);
      }
    });
  }, []);

  // 녹화 중 500ms 폴링으로 캡처된 액션 수 갱신
  useEffect(() => {
    if (state !== 'recording') return;
    const timer = setInterval(() => {
      chrome.storage.local.get(['capturedActions'], (result) => {
        const actions =
          (result as { capturedActions?: unknown[] })['capturedActions'] ?? [];
        setActionCount(actions.length);
      });
    }, 500);
    return () => clearInterval(timer);
  }, [state]);

  function handleStart(): void {
    chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (res: { ok: boolean }) => {
      if (res?.ok) {
        setActionCount(0);
        setStatusMsg('');
        setState('recording');
      }
    });
  }

  function handleStop(): void {
    setState('sending');
    chrome.runtime.sendMessage(
      { type: 'STOP_RECORDING' },
      (_res: { ok: boolean; actions: unknown[] }) => {
        chrome.runtime.sendMessage(
          { type: 'SEND_TO_INTERPRETER' },
          (r: { ok: boolean; error?: string }) => {
            if (r?.ok) {
              setStatusMsg('워크플로우 생성 완료');
            } else {
              setStatusMsg(`전송 실패: ${r?.error ?? '알 수 없는 오류'}`);
            }
            setState('idle');
          }
        );
      }
    );
  }

  return (
    <div style={{ padding: 16, width: 240, fontFamily: 'sans-serif' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>FlowCap</h2>

      {state === 'idle' && (
        <button onClick={handleStart} style={{ width: '100%', padding: 8 }}>
          녹화 시작
        </button>
      )}

      {state === 'recording' && (
        <>
          <button
            onClick={handleStop}
            style={{ width: '100%', padding: 8, background: '#cc0000', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            녹화 중지 &amp; 전송
          </button>
          <p style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
            녹화 중... {actionCount}개 캡처됨
          </p>
        </>
      )}

      {state === 'sending' && (
        <button disabled style={{ width: '100%', padding: 8, opacity: 0.5 }}>
          전송 중...
        </button>
      )}

      {statusMsg && (
        <p style={{ marginTop: 8, fontSize: 12, color: statusMsg.startsWith('전송 실패') ? '#c00' : '#080' }}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
