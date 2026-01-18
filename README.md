````md
# CataWiki Playwright Testing Framework

## Overview

This repository demonstrates a **clean, extensible Playwright UI testing framework** built for the CataWiki auction platform.

The focus of this README is **Playwright-based test automation**: structure, patterns, and scalability.  
Details about AI tooling and experimentation have been intentionally moved to a separate document (see `README2_AI.md`).

While the framework is UI-first, it is designed to *observe and document* the system under test in a way that supports future expansion, including service discovery and AI-assisted test generation, without coupling tests tightly to UI implementation details.

---

## Goals of This Framework

The goal of this exercise is **not full coverage**, but to demonstrate how a Playwright framework can scale cleanly over time and remain understandable to humans while being extensible by automation tooling.

Key goals:

- Provide a stable, working example of UI automation
- Demonstrate clear separation of concerns
- Enable easy addition of new test cases
- Support data-driven and maintainable test design
- Prepare for future test expansion without overengineering
- Provided a safe extenadble framework humans and AI can read

**Tech Stack:**  
Human testers · Playwright · TypeScript

---

## Prerequisites

- Node.js (v18+)
- Git

---

## Installation

```bash
# Clone the repository
git clone https://github.com/mark-rutter/Catawiki_Playwright_MCP
cd Catawiki_Playwright_MCP

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
````

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run with browser UI (recommended for first run)
npx playwright test --headed

# Run service discovery test
npx playwright test tests/discovery.spec.ts --headed

# Run optimized API tests
npx playwright test tests/API/search-suggest-optimized.spec.ts --headed

# Run example UI journey
npx playwright test tests/ui/train_flow_v2.spec.ts --headed
```

---

## Key Test Suites

* **smoke** – Framework health and session validation
* **ui** – End-to-end user journeys (data-driven)
* **API** – Direct REST API tests and optimized patterns
* **discovery** – Backend service discovery via UI flows
* **AI** – Generated test examples (see separate AI README)

---

## Framework Structure

```
src/
 ├─ discovery/               # Service discovery & API analysis
 │   ├─ serviceDiscovery.md
 │   ├─ api-calls.json
 │   ├─ contract-analysis.json
 │   └─ network-discovery.json
 │
 └─ utils/
     ├─ logger.ts            # Network/service observation
     └─ testCaseLoader.ts

tests/
 ├─ ui/                      # UI automation tests
 │   ├─ train_flow.spec.ts
 │   └─ train_flow_v2.spec.ts
 │
 ├─ API/                     # Direct REST API tests
 │   ├─ search-suggest.spec.ts
 │   └─ search-suggest-optimized.spec.ts
 │
 ├─ AI/                      # AI-generated examples (optional)
 │
 ├─ smoke/                   # Framework health checks
 │   ├─ framework-health.spec.ts
 │   └─ consent.spec.ts
 │
 ├─ pages-pom.spec.ts        # POM validation test
 ├─ discovery.spec.ts        # Service discovery test
 └─ baseTest.ts              # Custom fixtures (consentedPage)
```

---

## Implemented Test Scenarios

### Example User Journey – UI

**File:** `tests/smoke/train_flow.spec.ts`

Demonstrates a complete user journey:

1. Open CataWiki homepage
2. Search for the keyword **"train"**
3. Verify the results page loads
4. Open a specific lot
5. Validate the lot detail page
6. Log key details to the console:

   * Lot name
   * Favorites count
   * Current bid

This test prioritizes **clarity and debuggability** over exhaustive validation. It was used to set patterns for `tests/smoke/train_flow_v2.spec.ts` which adds more flexibility and consumes JSON test objects. 

---

### Page Object Model Validation

**File:** `tests/pages-pom.spec.ts`

Validates the Page Object abstraction:

* `HomePage.search()` using stable selectors
* `SearchResultsPage` navigation by index
* `LotPage.getLotDetails()` data extraction

Run with:

```bash
npx playwright test tests/pages-pom.spec.ts --headed
```

---

### Data-Driven UI Tests

**File:** `tests/ui/train_flow_v2.spec.ts`

Demonstrates scalable test design using Page Objects and JSON test data.

**Key characteristics:**

* Multiple test cases loaded from JSON
* Different search keywords and lot indices
* Soft assertions for richer feedback
* Stable test logic with growing coverage

Run with:

```bash
npx playwright test tests/ui/train_flow_v2.spec.ts --headed
```

---

## Data-Driven Test Design

Test cases are defined in structured JSON files and loaded dynamically.

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
    }
  ]
}
```

### Why This Matters

* Humans can easily add or review test cases
* Test logic remains unchanged as coverage grows
* Page Objects absorb UI changes
* Clear separation between **test intent** and **test implementation**

---

## Service Discovery (UI-Driven)

Although this repository focuses on UI automation, it also demonstrates how backend services can be **observed and documented** during real user flows.

### Approach

* Intercept XHR / `fetch` requests
* Log endpoints, response status, and timing
* Capture artifacts for later analysis

Artifacts are stored under:

```
src/discovery/
```

This enables future work such as API tests, contract validation, and UI–backend consistency checks.

---

## Cross-Browser & Mobile Support

The framework is designed to support:

* Chromium (enabled for this POC)
* Firefox
* WebKit (Safari-like)
* Mobile emulation

The same test logic can be reused across platforms with minimal configuration.

---

## Design Principles

* Readable tests over clever abstractions
* Page Objects for UI stability
* Minimal abstraction added only when needed
* Deterministic setup and teardown
* **Intentionally shallow, but structurally sound**

---

## Known Limitations (Intentional)

The following are planned but not implemented to keep the scope focused:

* Full CI/CD pipeline
* Visual regression testing
* Cross-browser execution in CI
* Advanced reporting dashboards
* Test data lifecycle management

These are considered **next steps**, not omissions.

---

## Summary

This repository demonstrates:

* A clean, maintainable Playwright setup
* Realistic UI automation examples
* Data-driven test design
* Page Object Model validation
* UI-driven service discovery
* A clear path to scale without rewriting tests

The framework is intentionally designed to be **extended, not replaced**, as coverage and tooling evolve.

```
```
