import type { Page } from 'playwright';
import type { ActionNode } from '@flowcap/shared';

export async function executeAction(page: Page, node: ActionNode): Promise<void> {
  const { kind, selector, value } = node.action;
  switch (kind) {
    case 'click':
      await page.click(selector, { timeout: 10000 });
      break;
    case 'input':
      await page.fill(selector, value ?? '');
      break;
    case 'navigate':
      await page.goto(value ?? '', { waitUntil: 'domcontentloaded' });
      break;
    case 'scroll':
      await page.evaluate(
        `document.querySelector('${selector}')?.scrollIntoView()`
      );
      break;
  }
}
