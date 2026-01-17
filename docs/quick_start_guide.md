# QA Engineer Quick Start Guide - AI Testing with Playwright MCP

**From setup to AI-generated tests in 15 minutes** 🎭🚀

## Overview

This guide walks QA Engineers through hands-on usage of the 3 AI agents in this project. You'll learn how to go from basic setup to generating working test code using AI assistance.

## Prerequisites Completed ✅

If you're reading this, you should have already:
- Cloned the repository
- Installed dependencies (`npm install`)
- Run the basic setup steps from the root README

## The 3 AI Agents - What They Actually Do

### 🎭 **Planner Agent** - Requirements → Test Strategy
**Input**: Human requirements (like "test the bidding flow")
**Output**: Structured test plans and strategies
**Real Example**: **I've already run the Planner** - see the output in [tests/seed.spec.ts](../tests/seed.spec.ts)

### 🎭 **Generator Agent** - Strategy → Working Code  
**Input**: Test plans and proven patterns
**Output**: Complete `.spec.ts` test files
**Real Example**: **I've already run the Generator** - see the output in [specs/basic-operations.md](../specs/basic-operations.md)

### 🎭 **Healer Agent** - Broken Tests → Fixed Tests
**Input**: Test failures and error traces
**Output**: Updated test code with fixes
**Usage**: Monitors test health automatically

## 🔍 Service Discovery - The Foundation

**Service Discovery runs first** to provide clean data for AI agents:

```bash
# Run discovery to map the application
npx playwright test tests/discovery.spec.ts --headed
```

**What happens**: 
- Playwright navigates through real user journeys
- Network traffic is captured and analyzed
- API contracts are extracted to `src/discovery/`
- Clean JSON artifacts are generated for AI consumption

**AI Benefit**: Agents get structured data instead of raw browser output

## Step-by-Step: Try Each Agent

### Step 1: Understand What's Already Been Done

**Planner Agent Output**: [tests/seed.spec.ts](../tests/seed.spec.ts)
- Shows proven test patterns
- Demonstrates baseTest fixture usage  
- Includes network monitoring examples
- Provides soft assertion patterns

**Generator Agent Output**: [specs/basic-operations.md](../specs/basic-operations.md)
- 135+ comprehensive test scenarios
- 8 core testing areas (auth, bidding, payments, etc.)
- Performance benchmarks and success criteria
- 3-phase implementation strategy

### Step 2: Run Service Discovery (Foundation Layer)

```bash
# Generate fresh discovery data for AI agents
npx playwright test tests/discovery.spec.ts --headed
```

**Expected Outcome**: 
- `src/discovery/api-calls.json` contains API contracts
- `src/discovery/network-discovery.json` has service topology  
- Clean, structured data ready for AI processing

### Step 3: Try the Planner Agent

**Current Status**: ✅ **Already completed** - see [tests/seed.spec.ts](../tests/seed.spec.ts)

**To generate new plans**:
```bash
# Initialize AI agents if not already done
npx playwright init-agents --loop=vscode

# Planner reads requirements and creates test strategies
# Input: Human requirements (verbal or written)
# Output: Structured test plans and execution strategies
```

**Real Usage**: 
- Give Planner a requirement like "I need to test mobile checkout flow"
- It reads existing patterns from seed.spec.ts
- Generates step-by-step test strategy with selectors and assertions

### Step 4: Try the Generator Agent

**Current Status**: ✅ **Already completed** - see [specs/basic-operations.md](../specs/basic-operations.md)

**To generate new test code**:
```bash
# Generator takes plans + patterns and creates working tests
# Input: Test strategies from Planner + proven patterns from seed.spec.ts  
# Output: Complete .spec.ts files with proper structure
```

**Real Usage**:
- Generator reads the comprehensive test plan in basic-operations.md
- Uses established patterns from seed.spec.ts (baseTest fixture, soft assertions, etc.)
- Produces working test files following framework conventions

### Step 5: Try the Healer Agent

**Usage**: Healer runs automatically when tests fail

```bash
# Run tests to see current health
npx playwright test

# If tests fail, Healer automatically:
# 1. Analyzes failure patterns
# 2. Updates selectors and logic  
# 3. Preserves original test intent
# 4. Suggests or applies fixes
```

**Real Usage**:
- When Catawiki UI changes break existing tests
- Healer detects failures and suggests selector updates
- Maintains test coverage without manual intervention

## Advanced AI Usage with MCP

### Playwright MCP Integration

**MCP (Machine-Consumable Playwright)** enables AI agents to:

```bash
# Connect MCP server for AI browser control
npm install @microsoft/playwright-mcp

# Enable AI agents to directly interact with browsers
# AI can read page content, navigate, and understand context
```

### AI-Driven Test Expansion

**Use AI to scale your test coverage**:

1. **Pattern Recognition**: AI learns from successful tests in your framework
2. **Automatic Generation**: Creates similar tests for different scenarios  
3. **Smart Maintenance**: Keeps tests working as applications evolve

### MCP-Enabled Workflows

```bash
# AI agent workflow with MCP:
# 1. AI reads application via MCP browser connection
# 2. Understands page structure and functionality  
# 3. Generates appropriate test scenarios
# 4. Creates working Playwright test code
# 5. Validates tests work correctly
```

## What's Next? Moving Forward

### Immediate Next Steps

1. **Review the Examples**: 
   - Study [tests/seed.spec.ts](../tests/seed.spec.ts) for proven patterns
   - Examine [specs/basic-operations.md](../specs/basic-operations.md) for comprehensive planning

2. **Try Small Changes**:
   - Modify requirements in basic-operations.md  
   - Ask Generator to create tests for specific scenarios
   - Let Healer fix any test failures you encounter

3. **Scale Up Gradually**:
   - Add new test scenarios to the specs
   - Use AI to generate test code for additional user journeys
   - Monitor and maintain test health with Healer

### Production Usage Recommendations

**Best Practices**:
- Always review AI-generated code before running
- Use AI for repetitive tasks, humans for test strategy
- Maintain the established patterns (baseTest fixture, POM, etc.)
- Keep Service Discovery running to feed AI agents fresh data

**Quality Assurance**:
- AI agents follow your established patterns
- Generated tests include proper assertions and error handling  
- Framework conventions are preserved automatically
- Human oversight ensures test quality and relevance

## Troubleshooting

### Common Issues

**"AI agents not responding"**:
- Ensure `npx playwright init-agents --loop=vscode` was run
- Check that MCP server is properly installed
- Verify Service Discovery has generated fresh artifacts

**"Generated tests don't match my needs"**:
- Update requirements in specs/basic-operations.md
- Ensure seed.spec.ts demonstrates the patterns you want
- Provide more specific requirements to Planner agent

**"Tests are failing after AI generation"**:
- Let Healer agent analyze and fix the failures
- Check that baseTest fixture is being used correctly
- Verify selectors match current application state

## Success Metrics

**You'll know AI testing is working when**:
- ✅ Generator creates tests that run successfully on first try
- ✅ Healer automatically fixes broken tests without manual intervention  
- ✅ Test coverage grows without increasing maintenance burden
- ✅ QA team focuses on test strategy rather than test creation

## Getting Help

**Framework Support**:
- Check existing examples in tests/ directory
- Review specs/basic-operations.md for comprehensive scenarios
- Examine Service Discovery output in src/discovery/

**AI Agent Support**:
- Ensure all agents have access to fresh Service Discovery data
- Verify seed.spec.ts contains the patterns you want AI to learn
- Update specs/ with clear, specific requirements

---

**Remember**: AI agents are tools that amplify human expertise. Use them to handle repetitive tasks while you focus on test strategy and quality assurance. The framework is designed for **human-AI collaboration**, not AI replacement.