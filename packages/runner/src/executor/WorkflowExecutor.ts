import { chromium, Browser, Page } from 'playwright';
import type { Workflow, WorkflowNode, RunEvent } from '@flowcap/shared';

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

        await this.executeNode(node);

        onEvent({
          runId: workflow.id,
          nodeId: node.id,
          status: 'success',
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // 에러 발생해도 반드시 브라우저 정리
    } finally {
      await this.browser?.close();
    }
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    if (node.type === 'action') {
      const { kind, selector, value } = node.action;
      switch (kind) {
        case 'click':
          await this.page.click(selector, { timeout: 10000 });
          break;
        case 'input':
          await this.page.fill(selector, value ?? '');
          break;
        case 'navigate':
          await this.page.goto(value ?? '', { waitUntil: 'domcontentloaded' });
          break;
        case 'scroll':
          await this.page.evaluate(
            `document.querySelector('${selector}')?.scrollIntoView()`
          );
          break;
      }
    }

    if (node.type === 'wait') {
      const { kind, selector, ms, timeout } = node.wait;
      switch (kind) {
        case 'element':
          await this.page.waitForSelector(selector!, { timeout: timeout ?? 30000 });
          break;
        case 'duration':
          await this.page.waitForTimeout(ms ?? 1000);
          break;
        case 'network_idle':
          await this.page.waitForLoadState('networkidle');
          break;
      }
    }
  }
}
