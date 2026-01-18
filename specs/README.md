# Test Specifications

This directory contains human-readable test plans and specifications for the Catawiki Playwright automation framework.

## Overview

The framework implements comprehensive testing across multiple layers:
- **UI Testing** - End-to-end user journey validation
- **API Testing** - REST API contract and performance validation  
- **Discovery Testing** - Service and network analysis
- **Cross-Layer Testing** - UI-backend consistency validation
- **AI-Assisted Testing** - Playwright test agents for automated test generation

---

## Test Categories

### 1. Service Discovery Tests

**Purpose:** Analyze and document backend services through network observation

#### `tests/discovery.spec.ts` - Service Discovery Analysis
**Test Plan:**
1. **Setup Phase**
   - Navigate to Catawiki homepage with consent handled
   - Enable network traffic monitoring and response interception

2. **User Journey Execution**
   - Perform complete search-to-lot-details flow
   - Search for "train" keyword
   - Navigate through search results to lot page
   - Extract lot details and metadata

3. **Network Analysis**
   - Capture all API calls made during user journey
   - Record request/response patterns and data contracts
   - Identify backend services and endpoints

4. **Discovery Artifacts**
   - Generate machine-readable service documentation
   - Output API contract definitions
   - Create network discovery report

**Expected Outcomes:**
- Complete API endpoint mapping
- Data contract documentation  
- Service topology understanding
- Foundation for API testing

---

### 2. UI Testing (End-to-End)

#### `tests/ui/train_flow.spec.ts` - Basic Search Flow
**Test Plan:**
1. Open Catawiki homepage (https://www.catawiki.com/en/)
2. Search for keyword "train"
3. Verify search results page loads correctly
4. Navigate to second lot in results
5. Verify lot page displays properly
6. Extract and validate:
   - Lot name
   - Favorites counter  
   - Current bid amount

**Expected Outcomes:**
- Search functionality works correctly
- Navigation flow is stable
- Lot page data is accessible

#### `tests/ui/train_flow_v2.spec.ts` - Data-Driven Search Flow
**Test Plan:**
1. **Data-Driven Execution** (5 test cases)
   - Load test cases from `trainFlowCases.json`
   - Execute same flow for: train, watch, art, rolex keywords
   - Use different lot indices per test case

2. **Per Test Case Validation:**
   - Search results page loads (`/s?q=<keyword>`)
   - Minimum number of lots found
   - Target lot index exists and is clickable
   - Lot page loads with valid data

3. **Comprehensive Assertions (15+ per test):**
   - URL validation
   - Page title verification
   - Element visibility checks
   - Data extraction validation
   - Performance timing checks

**Expected Outcomes:**
- All 5 keywords (sample test inputs) produce valid results
- Different lot indices work correctly
- Consistent behavior across search terms

#### `tests/ui/ui_search_data_driven.spec.ts` - JSON-Driven Search Tests
**Test Plan:**
1. Load test cases dynamically from `searchLots.json`
2. Execute search flow for each data-driven case
3. Same validation pattern as train_flow tests
4. Support for multiple keyword variations

**Expected Outcomes:**
- JSON data drives test execution correctly
- Easy addition of new test cases
- Maintainable test data structure

---

### 3. Page Object Model Validation

#### `tests/pages-pom.spec.ts` - POM Architecture Validation
**Test Plan:**
1. **HomePage Class Testing**
   - Verify search functionality using `data-testid="search-field"`
   - Test search button interaction
   - Validate page object abstraction

2. **SearchResultsPage Class Testing**
   - Confirm URL pattern matching (`/s?q=train`)
   - Count lot links using stable selectors
   - Test navigation to specific lot indices

3. **LotPage Class Testing**
   - Extract lot details using discovered selectors
   - Validate bid status information
   - Test watcher count extraction

**Expected Outcomes:**
- Page Object classes work correctly
- Selectors remain stable
- UI changes only affect Page Objects, not tests

---

### 4. API Testing

#### `tests/AI/api-contract.spec.ts` - REST API Contract Validation
**Test Plan:**
1. **Data-Driven API Testing** (5 test cases)
   - Use same keywords as UI tests for consistency
   - Trigger search via UI to capture API responses
   - Validate API contracts through network interception

2. **Contract Validation Per Keyword:**
   - HTTP status codes (200 OK expected)
   - Response structure validation
   - Data type checking
   - Business rule validation (suggestions relevance)

3. **Cross-Test Consistency:**
   - Same test data as UI tests
   - Consistent validation patterns
   - API-UI behavior correlation

**Expected Outcomes:**
- All 5 API contracts validate successfully
- Response schemas match expected format
- API behavior aligns with UI behavior

#### `tests/API/search-suggest-optimized.spec.ts` - Performance-Optimized API Testing
**Test Plan:**
1. **Session Reuse Strategy**
   - Single browser session for all tests
   - One-time cookie consent handling
   - Keep page context alive across searches

2. **Bulk Testing Approach**
   - Test all 5 keywords in single session
   - Sequential search execution with network monitoring
   - Capture API responses for each search

3. **Performance Measurement**
   - Track total execution time (target: ~21 seconds)
   - Compare against traditional approach (2.5 minutes)
   - Measure 7x performance improvement

**Expected Outcomes:**
- 21-second execution time achieved
- All 5 keywords tested successfully
- Dramatic performance improvement validated

---

### 5. Cross-Layer Testing

#### `tests/AI/ui-backend-consistency.spec.ts` - UI-Backend Data Consistency
**Test Plan:**
1. **Parallel Data Capture**
   - Extract data from UI elements
   - Capture same data from API responses
   - Compare for consistency

2. **Data Points Validation:**
   - Search result counts (UI vs API)
   - Lot metadata consistency
   - Pricing information alignment

**Expected Outcomes:**
- UI and API data match perfectly
- No discrepancies in critical information
- Frontend-backend synchronization confirmed

#### `tests/AI/performance.spec.ts` - API Performance Benchmarks
**Test Plan:**
1. **Response Time Measurement**
   - Capture API response times
   - Set performance thresholds
   - Track performance regression

2. **Load Pattern Analysis**
   - Multiple keyword performance comparison
   - Identify performance bottlenecks
   - Generate performance reports

**Expected Outcomes:**
- Response times within acceptable thresholds
- Performance baseline established
- Performance monitoring capability proven

---

### 6. AI-Assisted Testing

#### `tests/seed.spec.ts` - Playwright Test Agents Seed Template
**Test Plan:**
1. **Pattern Demonstration**
   - Show proven test patterns for AI learning
   - Demonstrate baseTest fixture usage
   - Illustrate network monitoring techniques

2. **Comprehensive Examples**
   - Search flow patterns
   - Element selection strategies
   - Assertion techniques (soft assertions)
   - File I/O for test artifacts

3. **AI Training Data**
   - Provide complete working examples
   - Show error handling patterns
   - Demonstrate best practices

**Expected Outcomes:**
- AI agents understand framework patterns
- Generated tests follow established conventions
- Quality and reliability standards maintained

---

## Test Execution Strategy

### Sequential Execution Order
1. **Discovery Tests** - Map services and APIs
2. **POM Validation** - Verify page object stability  
3. **UI Tests** - Validate user journeys
4. **API Tests** - Verify backend contracts
5. **Cross-Layer Tests** - Ensure consistency
6. **Performance Tests** - Validate benchmarks

### Parallel Execution Capability
- UI tests can run in parallel across browsers
- API tests can execute concurrently with UI tests
- Discovery can run independently for different user flows

### Performance Targets
- **Discovery Phase:** Complete in <60 seconds
- **UI Tests:** <30 seconds per test case
- **Optimized API Tests:** <25 seconds for 5 keywords
- **Full Test Suite:** <5 minutes total execution

---

## Quality Assurance

### Assertion Strategy
- **Hard Assertions:** Critical functionality (page loads, search works)
- **Soft Assertions:** Data validation and detailed checks
- **Cross-Layer Validation:** UI-API consistency checks

### Error Handling
- **Retry Logic:** Automatic retry on transient failures
- **Trace Capture:** Full debugging info on failures
- **Graceful Degradation:** Tests continue on non-critical failures

### Reporting
- **Test Results:** Pass/fail with detailed logging
- **Performance Metrics:** Response times and execution duration
- **Discovery Artifacts:** JSON files with service documentation
- **Coverage Reports:** Feature and API coverage analysis

---

## Success Criteria

### Functional Validation
✅ All user journeys complete successfully  
✅ API contracts validate correctly  
✅ Cross-layer data consistency maintained  
✅ Page objects provide stable abstraction  

### Performance Validation
✅ Optimized tests achieve 7x speedup  
✅ Full test suite completes in <5 minutes  
✅ Discovery phase captures complete service map  

### Quality Validation
✅ Zero false positives in test results  
✅ Comprehensive error reporting and debugging info  
✅ Maintainable test structure for future growth  
✅ AI-ready patterns for automated test generation
