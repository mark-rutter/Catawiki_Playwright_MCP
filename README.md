# CataWiki Playwright Testing Framework

## Quick Start

This repository demonstrates Playwright UI testing + AI assistance to scale this framwork for the CataWiki auction platform. 

See README2 AI for more on AI and /docs/quick_start_guide.md for hands-on AI experiance.

This is demo of Test Automation Framework designed for Humans and AI. This repository contains a lightweight, extensible automation framework built with Playwright.
It demonstrates a clean foundation for UI automation while intentionally preparing for AI-assisted test discovery, test case ingestion, and service analysis using Playwright MCP concepts.


## Goals of This Framework

The goal of this exercise is not full test coverage, but to show how a framework can scale cleanly and be extended by both human testers and AI tools in future iterations.

- Provide a working, stable example of UI automation
- Demonstrate clear separation of concerns
- Enable easy addition of new test cases
- Document how testable backend services can be discovered
- Show readiness for AI-assisted testing without overengineering

Tech Stack: Human, Playwrite, Agents, MCP



### Prerequisites

- Node.js (v18+)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/mark-rutter/Catawiki_Playwright_MCP
cd CataWiki

# Navigate to Playwright framework
cd Catawiki_Playwright_MCP

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run "the train" test
npx playwright test tests/ui/train_flow_v2.spec.ts

# Run all tests (Chromium --headed sorry)
npx playwright test 
```

### Setup Playwright MCP

**Playwright MCP** enables AI browser interaction and service discovery.

```bash
# Install Playwright MCP server
npm install @microsoft/playwright-mcp

# Initialize AI test agents (one-time setup)
npx playwright init-agents --loop=vscode
```

This sets up:
- 🎭 **Planner Agent** - Converts requirements to test strategies  
- 🎭 **Generator Agent** - Creates working test code
- 🎭 **Healer Agent** - Fixes and maintains tests

### Run Tests

```bash
# Run all tests
npx playwright test

# Run with browser UI (recommended for first run)
npx playwright test --headed

# Run specific test suite
npx playwright test tests/discovery.spec.ts --headed

# Run performance-optimized API tests
npx playwright test tests/API/search-suggest-optimized.spec.ts --headed
```

### Key Test Suites (Ordered by creation)

- **smoke** - UI-backend consistency validation **by human** 
- **UI Tests** - End-to-end user journeys (data-driven) **by human** 
- **Discovery Tests** - Maps backend services and APIs 
- **AI** - built from the service discovery analysis **by AI**.
- **API Tests** - Performance-optimized contract validation **by AI**.

### Framework Structure
 │
 ├─ discovery/           # Service discovery & API analysis
 │   ├─ serviceDiscovery.md
 │   ├─ api-calls.json
 │   ├─ contract-analysis.json
 │   └─ network-discovery.json
 │
 └─ utils/
     ├─ logger.ts        # Network/service observation
     └─ testCaseLoader.ts

tests/
 ├─ ui/                  # UI automation tests
 │   ├─ train_flow.spec.ts       # Original train flow
 │   └─ train_flow_v2.spec.ts    # Data-driven POM version (5 tests)
 │
 ├─ AI/                  # AI-generated test examples
 │   ├─ api-contract.spec.ts         # Data-driven (5 tests)
 │   ├─ ui-backend-consistency.spec.ts
 │   ├─ performance.spec.ts
 │   └─ data-driven-api.spec.ts
 │
 ├─ API/                 # Direct REST API tests
 │   ├─ search-suggest.spec.ts
 │   └─ search-suggest-optimized.spec.ts  # Session reuse (21s for 5 keywords!)
 │
 ├─ smoke/               # Framework health checks
 │   ├─ framework-health.spec.ts
 │   └─ consent.spec.ts
 │
 ├─ pages-pom.spec.ts    # POM validation test
 ├─ discovery.spec.ts    # Service discovery test
 └─ baseTest.ts          # Custom fixtures (consentedPage)
```

---

## Implemented Test Scenarios

### Example User Journey: `tests/smoke/train_flow.spec.ts`

Automated test that demonstrates:

1. Open [https://www.catawiki.com/en/](https://www.catawiki.com/en/)
2. Search for the keyword **"train"**
3. Verify the search results page opens
4. Open the second lot in the results
5. Verify the lot page is displayed
6. Read and log to the console:
   * Lot name
   * Favorites counter
   * Current bid

### Page Object Model Test: `tests/pages-pom.spec.ts`

Validates the POM abstraction layer using discovered selectors:

1. **HomePage.search()** - Uses stable `data-testid="search-field"` selector
2. **SearchResultsPage** - Counts results, navigates to specific lot by index
3. **LotPage.getLotDetails()** - Extracts lot name, bid status, watchers count

**Run:**
```bash
npx playwright test tests/pages-pom.spec.ts --headed
```

### Data-Driven POM Test: `tests/ui/train_flow_v2.spec.ts`

Demonstrates scalable, AI-friendly test design using Page Objects and JSON test data:

**Features:**
- **5 test cases** loaded from `trainFlowCases.json`
- Different search keywords: train, watch, art, rolex
- Different lot indices: 0, 1, 2 (tests navigation flexibility)
- **15+ soft assertions** per test validating data integrity
- Complete POM abstraction (HomePage → SearchResults → LotPage)

**Test Results (All Passing):**
- ✅ Train search - First lot: Liliput train carriage, €1
- ✅ Train search - Second lot: Märklin train set, €75, 28 watchers
- ✅ Watch search - Third lot: Masonic pocket watch, €83, 57 watchers
- ✅ Art search - First lot: Pokémon art, €20, 10 watchers
- ✅ Rolex search - Second lot: GMT-Master 16700, €8,500, 46 watchers

**Run:**
```bash
npx playwright test tests/ui/train_flow_v2.spec.ts --headed
```

This demonstrates **navigation, validation, data extraction, and maintainable abstraction**, not just pass/fail checks.

---

## Running the Tests

### Install dependencies

```bash
npm install
```

### Install Playwright browsers

```bash
npx playwright install
```

### Run specific tests

```bash
# Original train flow (single test)
npx playwright test tests/smoke/train_flow.spec.ts --headed

# Data-driven train flow V2 (5 tests from JSON)
npx playwright test tests/ui/train_flow_v2.spec.ts --headed

# Page Object Model validation
npx playwright test tests/pages-pom.spec.ts --headed

# Service discovery
npx playwright test tests/discovery.spec.ts --headed

# Optimized API testing (5 keywords in one session - 21s!)
npx playwright test tests/API/search-suggest-optimized.spec.ts --headed

# Data-driven API contract tests
npx playwright test tests/AI/api-contract.spec.ts --headed
```

### Run all tests

```bash
npx playwright test --headed
```

### Run with UI mode

```bash
npx playwright test --ui
```

---

## Cross-Browser & Mobile Support

The framework can be configured to support:

* Chromium (enabled for this POC)
* Firefox
* WebKit (Safari-like)
* Mobile emulation (example: iPhone)

This allows the **same test logic** to be reused across platforms with minimal configuration.

---

## Data-Driven & AI-Friendly Test Design

Test cases are stored as **JSON data** and loaded dynamically by tests.

### Example (`trainFlowCases.json`)

```json
{
  "cases": [
    {
      "description": "Train search - First lot",
      "keyword": "train",
      "lotIndex": 0,
      "expectedMinResults": 10
    },
    {
      "description": "Watch search - Third lot",
      "keyword": "watch",
      "lotIndex": 2,
      "expectedMinResults": 10
    },
    {
      "description": "Rolex search - Second lot",
      "keyword": "rolex",
      "lotIndex": 1,
      "expectedMinResults": 5
    }
  ]
}
```

### Why This Matters

* **Humans** can easily add or review cases without touching test code
* **AI tools** can safely generate new test cases in structured JSON format
* **Test logic** remains stable as coverage grows (Page Objects handle UI changes)
* **Scalability** - 5 tests from 1 spec file + 1 JSON file = easy expansion

### How It Works

```typescript
// Load test data
const testData = JSON.parse(fs.readFileSync('trainFlowCases.json'));

// Generate tests dynamically
testData.cases.forEach((testCase) => {
  test(`Train Flow V2 - ${testCase.description}`, async ({ page }) => {
    await homePage.search(testCase.keyword);
    await searchPage.openLotByIndex(testCase.lotIndex);
    const details = await lotPage.getLotDetails();
    // ... validations
  });
});
```

This pattern allows **AI to propose new test cases** by simply adding JSON objects, without modifying the test logic.

---

## Service Discovery & Playwright MCP Readiness

Although this framework focuses on UI automation, it **documents and demonstrates how backend services can be discovered** using Playwright’s network interception capabilities.

### Discovery Approach

* Observe XHR / `fetch` traffic during UI interactions
* Log endpoints, response status, and timing
* Identify testable services behind user flows

This process is documented in:

```
src/discovery/serviceDiscovery.md
```

### Future Use

* API test creation
* Contract testing
* UI ↔ backend data validation
* AI-assisted test generation

---

## Design Principles

* Readable tests over clever tests
* Page Objects for UI stability
* Minimal abstraction, added only when needed
* Fail fast and capture trace on retry
* **Intentionally shallow, but structurally deep**

---

## Known Limitations (Intentional)

To keep the exercise focused, the following are **planned but not yet implemented**:

* Full cross-browser test coverage (currently Chromium-only in CI)
* Visual regression testing
* CI/CD pipeline integration
* Parallel execution optimization
* Test data management/cleanup
* Advanced reporting dashboards

These are listed as **clear next steps**, not partially implemented features.

---

## Completed Implementation Highlights

✅ **Core Test Implementation** - `tests/smoke/train_flow.spec.ts`:
  - Complete user journey: search → results → lot details
  - **Console output logging** as requested (lot name, favorites, current bid)
  - Soft assertions for resilient validation
  - Defensive error handling (graceful degradation)
  - Expanded to **train_flow_v2.spec.ts** with data-driven design (5 test cases)

✅ **Page Object Model** - Stable UI abstraction layer:
  - HomePage, SearchResultsPage, LotPage classes
  - Discovered selectors via Playwright MCP inspection (`data-testid="search-field"`)
  - Validated with pages-pom.spec.ts (full journey test)
  - Enables maintainable, AI-friendly test authoring

✅ **Service Discovery** - Automated via `tests/discovery.spec.ts`:
  - Captures 41+ API calls during UI flows
  - Generates machine-readable artifacts (api-calls.json, contract-analysis.json)
  - Documents 10 discovered endpoints in serviceDiscovery.md

✅ **API Test Generation** - Multiple approaches for testing REST APIs:
  - Contract validation (api-contract.spec.ts) - Data-driven with 5 test cases
  - Optimized testing (search-suggest-optimized.spec.ts) - **5 keywords in 21s** (vs 2.5min)
  - Session reuse pattern - Opens page ONCE, tests multiple APIs
  - Network interception - Captures API responses without navigation
  - Performance benchmarks (performance.spec.ts)
  - UI-Backend consistency (ui-backend-consistency.spec.ts)

✅ **AI-Assisted Test Case Design** - Data-driven pattern with JSON test data:
  - trainFlowCases.json with 5 test cases (train, watch, art, rolex)
  - AI can safely add cases without touching test code
  - Demonstrated scalability (1 spec → 5 tests → 15+ validations each)
  - Real production data extracted (prices €1 to €8,500, watchers 0-57)

---

## Next Steps

* Expand data-driven test coverage to more user journeys
* Add visual regression testing with screenshot comparison
* Implement CI/CD pipeline (GitHub Actions)
* Cross-browser execution in CI
* Test data factories for complex scenarios
* Enhanced reporting with trend analysis

---

## Summary

This framework demonstrates:

* **Clean, maintainable Playwright setup** with TypeScript and Page Objects
* **Realistic test examples** that run reliably (15 tests currently passing)
* **Data-driven testing** - 5 tests from 1 spec + JSON test data
* **Service discovery** - Network analysis captured 41 API calls, identified 10 endpoints
* **AI-ready patterns** - Stable POM interfaces, JSON test cases, soft assertions
* **Clear scalability path** - Add test cases via JSON, not code changes
* **Working examples** at multiple levels:
  - UI automation (train_flow, train_flow_v2)
  - Page Object validation (pages-pom.spec.ts)
  - API testing (AI/api-contract.spec.ts)
  - Performance benchmarks (AI/performance.spec.ts)
  - UI-Backend consistency (AI/ui-backend-consistency.spec.ts)

### Current Test Coverage

✅ **30+ Passing Tests:**
- 5 data-driven UI tests (train_flow_v2)
- 5 data-driven API contract tests (api-contract.spec.ts)
- 1 optimized API test covering 5 keywords (search-suggest-optimized.spec.ts)
- 4 AI-generated tests (performance, consistency, etc.)
- 3 framework health checks
- 1 POM validation test
- 1 service discovery test

It is **intentionally designed to be extended, not rewritten**.


