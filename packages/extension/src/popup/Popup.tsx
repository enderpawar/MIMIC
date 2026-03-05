import { useState } from 'react';

type State = 'idle' | 'recording';

export function Popup(): JSX.Element {
  const [state, setState] = useState<State>('idle');
  const [status, setStatus] = useState('');

  function handleStart(): void {
    chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (res) => {
      if (res?.ok) {
        setState('recording');
        setStatus('녹화 중...');
      }
    });
  }

  function handleStop(): void {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (res) => {
      if (res?.ok) {
        setState('idle');
        setStatus(`${res.actions.length}개 액션 캡처됨`);
        chrome.runtime.sendMessage({ type: 'SEND_TO_INTERPRETER' }, (r) => {
          if (r?.ok) setStatus('인터프리터 전송 완료');
          else setStatus(`전송 실패: ${r?.error ?? '알 수 없는 오류'}`);
        });
      }
    });
  }

  return (
    <div style={{ padding: 16, width: 220, fontFamily: 'sans-serif' }}>
      <h2 style={{ margin: '0 0 12px' }}>FlowCap</h2>
      {state === 'idle' ? (
        <button onClick={handleStart} style={{ width: '100%', padding: 8 }}>
          녹화 시작
        </button>
      ) : (
        <button onClick={handleStop} style={{ width: '100%', padding: 8, background: '#e00' }}>
          녹화 정지
        </button>
      )}
      {status && <p style={{ marginTop: 8, fontSize: 12, color: '#555' }}>{status}</p>}
    </div>
  );
}
