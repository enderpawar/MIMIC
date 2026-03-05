export type NodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'loop'
  | 'data'
  | 'wait'
  | 'notify'
  | 'subflow';

export type ActionKind =
  | 'click'
  | 'input'
  | 'scroll'
  | 'hover'
  | 'navigate'
  | 'keypress'
  | 'drag';

export interface BaseNode {
  id: string;                          // nanoid() 생성
  type: NodeType;
  label: string;
  position: { x: number; y: number }; // React Flow 좌표
}

export interface ActionNode extends BaseNode {
  type: 'action';
  action: {
    kind: ActionKind;
    selector: string;    // CSS selector 우선, XPath 차선
    value?: string;      // input 값, scroll px 등
    url: string;         // 액션이 발생한 페이지 URL
  };
}

export interface TriggerNode extends BaseNode {
  type: 'trigger';
  trigger: {
    kind: 'manual' | 'cron' | 'url_visit';
    cron?: string;
    urlPattern?: string;
  };
}

export interface ConditionNode extends BaseNode {
  type: 'condition';
  condition: {
    selector: string;
    operator: 'exists' | 'not_exists' | 'contains' | 'eq' | 'neq';
    value?: string;
  };
}

export interface WaitNode extends BaseNode {
  type: 'wait';
  wait: {
    kind: 'element' | 'duration' | 'network_idle';
    selector?: string;
    ms?: number;
    timeout?: number;    // default: 30000
  };
}

export interface DataNode extends BaseNode {
  type: 'data';
  data: {
    selector: string;
    attribute: 'textContent' | 'innerHTML' | 'href' | 'value' | 'src';
    variableName: string;
  };
}

export type WorkflowNode =
  | TriggerNode
  | ActionNode
  | ConditionNode
  | WaitNode
  | DataNode;

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: 'true' | 'false';    // ConditionNode 분기용
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
