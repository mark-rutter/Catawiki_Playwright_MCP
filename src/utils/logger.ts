import { Page } from '@playwright/test';

export function logNetwork(page: Page) {
  page.on('response', async response => {
    const request = response.request();
    if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
      console.log(`[API] ${response.status()} ${response.url()}`);
    }
  });
}

export function logPageInteraction(action: string, details?: any) {
  console.log(`[ACTION] ${action}`, details ? JSON.stringify(details) : '');
}

