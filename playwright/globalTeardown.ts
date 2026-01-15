async function globalTeardown() {
  console.log('\n[GLOBAL TEARDOWN] Cleaning up after test suite...');
  console.log('[GLOBAL TEARDOWN] Cache and cookies cleared by browser context');
  console.log('[GLOBAL TEARDOWN] Cleanup complete\n');
}

export default globalTeardown;
