import type { ActionKind, Workflow } from './node.js';

// Extension → Interpreter
export interface CapturedAction {
  index: number;
  timestamp: number;       // Unix ms
  kind: ActionKind;
  selector: string;
  value?: string;
  url: string;
  pageTitle: string;
}

export interface InterpretRequest {
  sessionId: string;
  actions: CapturedAction[];
}

export interface InterpretResponse {
  workflow: Workflow;
  confidence: number;      // 0~1
  warnings: string[];
}

// Editor → Runner
export interface RunRequest {
  workflowId: string;
  workflow: Workflow;      // MVP에서는 DB 없이 직접 전달
  variables?: Record<string, string>;
  headless?: boolean;      // default: true
}

// Runner → Editor (WebSocket 이벤트)
export interface RunEvent {
  runId: string;
  nodeId: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  message?: string;
  timestamp: number;
}
