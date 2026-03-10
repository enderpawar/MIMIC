import { chromium, Browser, Page } from 'playwright';
import type { Workflow, WorkflowNode, RunEvent } from '@flowcap/shared';
import { executeAction } from './nodes/ActionExecutor';
import { executeWait } from './nodes/WaitExecutor';

export class WorkflowExecutor {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async execute(
    workflow: Workflow,
    onEvent: (event: RunEvent) => void
  ): Promise<void> {
    // 반드시 격리된 browserContext 사용 (보안 규칙 — 절대 변경 금지)
    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    try {
      for (const node of workflow.nodes) {
        if (node.type === 'trigger') continue;

        onEvent({
          runId: workflow.id,
          nodeId: node.id,
          status: 'running',
          timestamp: Date.now(),
        });

        try {
          await this.executeNode(node);
          onEvent({
            runId: workflow.id,
            nodeId: node.id,
            status: 'success',
            timestamp: Date.now(),
          });
        } catch (error) {
          onEvent({
            runId: workflow.id,
            nodeId: node.id,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          });
          // 실패해도 다음 노드 계속 실행
        }
      }
    } finally {
      await this.browser?.close();
    }
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    if (node.type === 'action') await executeAction(this.page, node);
    if (node.type === 'wait') await executeWait(this.page, node);
  }
}
