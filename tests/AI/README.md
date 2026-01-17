# AI-Driven Test Examples

This folder contains **foundational test examples** built from the service discovery analysis **by AI**. Each test demonstrates a different testing approach using the APIs discovered in `tests/discovery.spec.ts`.

---

## 📁 Test Files

### 1. **api-contract.spec.ts** - API Contract Validation
**Purpose:** Validates that API responses match expected schema structure

**What it tests:**
- ✅ Response has required fields (`query_terms`, `text`, `entity`, etc.)
- ✅ Data types are correct (arrays, objects, strings)
- ✅ Business rules are followed (max 10 suggestions, contains search term)

**When to use:**
- After API changes to ensure backward compatibility
- In CI/CD to catch schema breaking changes
- To validate third-party API integrations

**Run:**
```bash
npx playwright test tests/AI/api-contract.spec.ts --headed
```

---

### 2. **ui-backend-consistency.spec.ts** - UI-Backend Data Consistency
**Purpose:** Ensures UI displays match the data returned by backend APIs

**What it tests:**
- ✅ API returns suggestions
- ✅ UI displays suggestions
- ✅ UI suggestions are relevant to search term
- ✅ No data loss between API → UI rendering

**When to use:**
- To catch frontend display bugs
- To validate data transformations
- To ensure accessibility of API data in UI

**Run:**
```bash
npx playwright test tests/AI/ui-backend-consistency.spec.ts --headed
```

---

### 3. **performance.spec.ts** - API Performance Benchmarks
**Purpose:** Monitors API response times and validates performance thresholds

**What it tests:**
- ⚡ APIs respond within acceptable time limits (< 2s)
- ⚡ No 4xx/5xx errors
- ⚡ Average response time is acceptable
- ⚡ Slow APIs are flagged in logs

**When to use:**
- Performance regression testing
- Load testing validation
- Monitoring production API health
- Identifying slow endpoints

**Run:**
```bash
npx playwright test tests/AI/performance.spec.ts --headed
```

---

### 4. **data-driven-api.spec.ts** - Parameterized API Testing
**Purpose:** Tests the same API with multiple inputs to validate consistent behavior

**What it tests:**
- 🔄 Multiple search keywords produce valid responses
- 🔄 Schema is consistent across different inputs
- 🔄 Each suggestion has required entity type
- 🔄 Minimum suggestion count is met

**When to use:**
- Testing edge cases and variations
- Validating internationalization (i18n)
- Regression testing with known inputs
- Building test coverage systematically

**Run:**
```bash
npx playwright test tests/AI/data-driven-api.spec.ts --headed
```

---

## 🎯 How These Tests Were Built

All tests are based on the **Service Discovery** analysis:

1. **Discovery Phase** (`tests/discovery.spec.ts`)
   - Captured 41 API calls during search flow
   - Extracted response schemas
   - Analyzed endpoints and patterns

2. **Documentation Phase** (`src/discovery/serviceDiscovery.md`)
   - Documented discovered APIs
   - Noted schema structures
   - Identified test opportunities

3. **Implementation Phase** (this folder)
   - Created focused test examples
   - Validated API contracts
   - Built reusable patterns

---

## 🚀 Running All AI Tests

```bash
# Run all AI tests
npx playwright test tests/AI/ --headed

# Run specific test type
npx playwright test tests/AI/api-contract.spec.ts --headed

# Run with HTML report
npx playwright test tests/AI/ --headed
npx playwright show-report
```

---

## 📊 Test Reports

Each test attaches detailed information to the HTML report:
- API responses (JSON format)
- Performance metrics
- UI vs API comparisons
- Validation results

View the report:
```bash
npx playwright show-report
```

---

## 🔧 Extending These Tests

### Add More Test Cases
Edit the test files and add more scenarios:
```typescript
const searchTestCases = [
  { keyword: 'train', minSuggestions: 1 },
  { keyword: 'YOUR_KEYWORD', minSuggestions: 1 }, // Add here
];
```

### Test Other Discovered APIs
Refer to `src/discovery/serviceDiscovery.md` for more endpoints:
- `/buyer/api/v1/search/related_terms`
- `/buyer/api/v1/lots/recently_viewed`
- `/buyer/api/v1/collections/related`

### Create Custom Contract Schemas
Build schema validators using libraries like `zod` or `ajv` for stricter validation.

---

## 📚 Best Practices

1. **Keep tests focused** - One test per API/scenario
2. **Use meaningful assertions** - Validate business logic, not just structure
3. **Attach context to reports** - Include API responses and metrics
4. **Make tests readable** - Use test.step() for clear reporting
5. **Handle failures gracefully** - Use soft assertions where appropriate

---

## 🎓 Learning Resources

- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Network Events](https://playwright.dev/docs/network)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Data-Driven Testing](https://playwright.dev/docs/test-parameterize)
