# Test Fixtures

## ConsentedPage Fixture

The `consentedPage` fixture provides a Playwright page that has already handled cookie consent. This is useful for tests that don't want to deal with the cookie banner UI.

### What it does

- ✅ Navigates to the homepage
- ✅ Waits for the page to fully load (networkidle)
- ✅ Automatically detects the cookie banner
- ✅ Clicks the "Agree" button to accept cookies
- ✅ Waits for the banner to disappear
- ✅ Returns a ready-to-use page without cookie consent blocking

### How to use

```typescript
import { test, expect } from './fixtures/consentedPage.fixture';

test('my test with cookies accepted', async ({ consentedPage }) => {
  // The page is already navigated to / and cookie banner is handled
  // You can immediately interact with page elements
  
  const title = await consentedPage.title();
  expect(title.length).toBeGreaterThan(0);
});
```

### Notes

- If the storageState already contains consent cookies (from globalSetup), the banner won't appear at all
- The fixture logs its actions to help with debugging
- If cookie acceptance fails, the fixture logs a warning but doesn't fail the test
- The fixture uses the `baseURL` from playwright.config.ts automatically
