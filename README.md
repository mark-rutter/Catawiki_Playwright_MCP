# Playwright Automation Framework (AI-Ready)

## Overview

## Playwright MCP (Machine-Consumable Playwright)

This repository contains a lightweight, extensible automation framework built with **Playwright**. Designed with Playwright MCP and AI use in mind. 

It demonstrates a clean foundation for UI automation while intentionally preparing for **AI-assisted test discovery, test case ingestion, and service analysis** using Playwright MCP concepts.

The goal of this exercise is **not full test coverage**, but to show how a framework can scale cleanly and be extended by both **human testers and AI tools** in future iterations.

## A Scalable Loop with AI Assistance

This framework is designed around a clear division of responsibility between humans and AI, enabling safe, scalable growth over time.

### Human Responsibilities
- Define and evolve the overall test architecture
- Add, review, and curate test cases with clear intent
- Validate real browser behaviour (e.g. observing persisted UI state in `--headed` mode rather than relying on cookies)
- Decide what *should* be tested and why

### AI-Assisted Capabilities
- Propose new test cases based on existing patterns
- Expand data-driven test sets safely without modifying core test logic
- Build upon working examples rather than inventing new structures
- Discover additional test opportunities using Playwright MCP (network traffic, services, and data contracts)

### Outcome
- Test logic remains stable as coverage grows
- New tests can be added without refactoring existing ones
- Both humans and AI operate within clear, controlled boundaries
- The framework scales through iteration, not complexity

This project is intentionally structured to be **Playwright MCP–ready** with AI assistance in mind. 

Rather than focusing only on UI execution, Playwright is also used to **observe and document the system under test** in a machine-consumable way. This enables both humans and AI tools to reason about the application and propose new test coverage without tightly coupling tests to UI implementation details.

MCP in this project is about **discovery and understanding**, not autonomous test execution.

## What MCP Means in This Project

Within this framework, Playwright MCP concepts are used to:

- Observe backend services triggered by UI interactions
- Capture network requests and responses during real user flows
- Produce machine-readable discovery artifacts
- Enable AI-assisted test case and coverage suggestions

This keeps the framework extensible while avoiding overengineering.

---

## Service Discovery via Playwright

A dedicated discovery test exercises a real user journey (search → lot page) while observing network traffic.

This allows identification of:

- Backend APIs used by the UI
- Data contracts returned by services
- Opportunities for API, contract, and cross-layer tests

---

## Run Service Discovery

```bash
npx playwright test tests/discovery.spec.ts --headed
```

Discovery artifacts are stored under:

src/discovery/

## Optimized API Testing

After discovery, we test REST APIs efficiently using **session reuse**:

```bash
# Optimized: Tests 5 keywords in ONE session (21s total)
npx playwright test tests/API/search-suggest-optimized.spec.ts --headed

# Data-driven: 5 separate tests with full contract validation
npx playwright test tests/AI/api-contract.spec.ts --headed
```

### Performance Comparison

**Traditional approach** (separate page per test):
- 5 tests × 30s each = **~2.5 minutes**
- Opens page 5 times
- Handles cookie consent 5 times

**Optimized approach** (session reuse):
- **21 seconds total** for all 5 keywords
- Opens page ONCE
- Handles consent ONCE
- Network interception captures API responses

**Key Innovation:** Keep browser session alive, just type different searches and listen to API responses via network interception

## Why use AI Service discovery
These artifacts form a safe input surface for:

- Human-led test design
- AI-assisted test suggestions
- Future automation expansion

---

## Page Object Model (POM) Validation

After discovering stable selectors through inspection, the framework validates that Page Objects work correctly using:

```bash
npx playwright test tests/pages-pom.spec.ts --headed
```

### What This Test Does

**pages-pom.spec.ts** executes a complete user journey using Page Object classes:

1. **HomePage** - Searches for "train" using discovered `data-testid="search-field"` selector
2. **SearchResultsPage** - Verifies search results page (`/s?q=train`), counts lot links, navigates to specific lot
3. **LotPage** - Extracts lot details (name, bid, watchers) using stable selectors

### Why This Matters

- **Validates selector stability** - Ensures discovered selectors work in real flows
- **Tests POM abstraction** - Confirms Page Objects hide complexity from test logic
- **Demonstrates maintainability** - Shows how UI changes affect only Page Objects, not tests
- **AI-friendly patterns** - Page Objects provide stable interfaces for AI-generated tests

### Example Flow

```typescript
const homePage = new HomePage(page);
const searchPage = new SearchResultsPage(page);
const lotPage = new LotPage(page);

await homePage.search('train');
const count = await searchPage.getResultsCount();
await searchPage.openLotByIndex(0);
const details = await lotPage.getLotDetails();
```

This pattern allows test logic to remain stable even when UI implementation changes.

---

## Goals of This Framework

- Provide a working, stable example of UI automation
- Demonstrate clear separation of concerns
- Enable easy addition of new test cases
- Document how testable backend services can be discovered
- Show readiness for AI-assisted testing without overengineering

---

## Tech Stack

- Playwright (TypeScript)
- Playwright Test Runner
- Cross-browser support (Chromium, Firefox, WebKit)
- Mobile emulation (example configuration)
- JSON-based test case ingestion

---

## Project Structure

```text
src/
 ├─ pages/               # Page Objects (UI abstraction)
 │   ├─ HomePage.ts
 │   ├─ SearchResultsPage.ts
 │   └─ LotPage.ts
 │
 ├─ testcases/           # Data-driven test inputs
 │   └─ searchLots.json
 │
 ├─ discovery/           # AI & MCP planning documentation
 │   └─ serviceDiscovery.md
 │
 └─ utils/
     ├─ logger.ts        # Network/service observation
     └─ testCaseLoader.ts

tests/
 ├─ ui/                  # UI test examples
 │   └─ search-lot.spec.ts
 │
 └─ smoke/
     └─ framework-health.spec.ts

```
## Implemented Test Scenario

The example test:

```
tests/ui/train_flow.spec.ts
```

Automates the following user journey:

1. Open [https://www.catawiki.com/en/](https://www.catawiki.com/en/)
2. Search for the keyword **"train"**
3. Verify the search results page opens
4. Open the second lot in the results
5. Verify the lot page is displayed
6. Read and log to the console:

   * Lot name
   * Favorites counter
   * Current bid

---
```
tests/ui/ui_search_data_driven.spec.ts
```

Automates the following user journey:

1. Open [https://www.catawiki.com/en/](https://www.catawiki.com/en/)
2. Search for the keyword **"<Data-Driven by searchLots.JSON>"**
3. Verify the search results page opens
4. Open the second lot in the results
5. Verify the lot page is displayed
6. Read and log to the console:

   * Lot name
   * Favorites counter
   * Current bid

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

### Run the train test

```bash
npx playwright test tests/ui/train_flow.spec.ts --headed
```

### Run all tests

```bash
npx playwright test
```

### Run with UI mode

```bash
npx playwright test --ui
```

---
### Run service dicovery

```bash
npx playwright test tests/discovery.spec.ts --headed
```
## Cross-Browser & Mobile Support

The framework is configured to support:

* Chromium
* Firefox
* WebKit (Safari-like)
* Mobile emulation (example: iPhone)

This allows the same test logic to be reused across platforms with minimal configuration.

---

## Data-Driven & AI-Friendly Test Design

Test cases are stored as JSON data and loaded dynamically by tests.

### Example: `searchLots.json`

```json
{
  "cases": [
    {
      "description": "Standard keyword search",
      "keyword": "train",
      "expectedResults": true
    }
  ]
}
```

### Why This Matters

* Humans can easily add or review cases
* AI tools can generate new test cases safely
* Test logic remains stable as coverage grows

---

## Service Discovery & Playwright MCP Readiness

Although this framework focuses on UI automation, it documents and demonstrates how backend services can be discovered using Playwright’s network interception.

### Discovery Approach

* Observe traffic during UI interactions
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

To keep the exercise focused, the following are planned but not implemented:

* Full API test suite
* Contract testing
* Performance testing
* Visual regression
* CI/CD optimization

These are listed as clear next steps rather than partially implemented features.

---

## Planned Next Steps

* Automate service discovery reporting
* Generate API test stubs from observed traffic
* AI-assisted test case suggestions
* UI ↔ API consistency assertions
* Visual regression testing

---

## Summary

This framework demonstrates:

* A clean, maintainable Playwright setup
* Realistic test examples that run reliably
* Clear thinking around scalability and AI integration
* A strong foundation that can grow without refactoring

It is intentionally designed to be **extended, not rewritten**.
