import type { Page } from 'playwright';
import type { WaitNode } from '@flowcap/shared';

export async function executeWait(page: Page, node: WaitNode): Promise<void> {
  const { kind, selector, ms, timeout } = node.wait;
  switch (kind) {
    case 'element':
      await page.waitForSelector(selector!, { timeout: timeout ?? 30000 });
      break;
    case 'duration':
      await page.waitForTimeout(ms ?? 1000);
      break;
    case 'network_idle':
      await page.waitForLoadState('networkidle');
      break;
  }
}
