import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { executeAction } from './nodes/ActionExecutor';
import { WorkflowExecutor } from './WorkflowExecutor';
import type { ActionNode, Workflow } from '@flowcap/shared';

// 테스트 1: navigate → example.com title 확인
test('navigate action: https://example.com 이동 후 title 확인', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const node: ActionNode = {
    id: 't1',
    type: 'action',
    label: 'navigate',
    position: { x: 0, y: 0 },
    action: { kind: 'navigate', selector: '', value: 'https://example.com', url: '' },
  };

  try {
    await executeAction(page, node);
    const title = await page.title();
    assert.equal(title, 'Example Domain');
  } finally {
    await browser.close();
  }
});

// 테스트 2: 존재하지 않는 selector 클릭 → failed 이벤트 확인
test('click action: 존재하지 않는 selector 클릭 시 failed 이벤트 발생', { timeout: 15000 }, async () => {
  const workflow: Workflow = {
    id: 'wf-test',
    name: 'test',
    nodes: [
      {
        id: 'n1',
        type: 'trigger',
        label: 'start',
        position: { x: 0, y: 0 },
        trigger: { kind: 'manual' },
      },
      {
        id: 'n2',
        type: 'action',
        label: 'click',
        position: { x: 0, y: 100 },
        action: {
          kind: 'click',
          selector: '#does-not-exist',
          value: undefined,
          url: 'https://example.com',
        },
      },
    ],
    edges: [],
    variables: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const events: Array<{ nodeId: string; status: string; message?: string }> = [];
  const executor = new WorkflowExecutor();
  await executor.execute(workflow, (e) => events.push(e as typeof events[0]));

  const n2Events = events.filter((e) => e.nodeId === 'n2');
  assert.ok(n2Events.some((e) => e.status === 'running'), 'running 이벤트 없음');
  assert.ok(n2Events.some((e) => e.status === 'failed'), 'failed 이벤트 없음');
});
