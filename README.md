# Playwright Automation Framework (AI-Ready)

## Overview

This repository contains a lightweight, extensible automation framework built with **Playwright**.

It demonstrates a clean foundation for UI automation while intentionally preparing for **AI-assisted test discovery, test case ingestion, and service analysis** using Playwright MCP concepts.

The goal of this exercise is **not full test coverage**, but to show how a framework can scale cleanly and be extended by both **human testers and AI tools** in future iterations.

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
