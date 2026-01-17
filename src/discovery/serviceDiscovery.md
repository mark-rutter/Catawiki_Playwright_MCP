# Service Discovery Report

## Discovery via Playwright MCP

**Date:** January 17, 2026  
**Test Flow:** Search for "train" → View lot details  
**Total API Calls Captured:** 41

---

## Discovery Method

- **Tool:** Playwright network interception (`page.on('request')` / `page.on('response')`)
- **Filter:** XHR / fetch requests only
- **Test:** `tests/discovery.spec.ts`
- **Outputs:** 
  - `api-calls.json` - Full API request/response details
  - `contract-analysis.json` - Schema analysis by endpoint
  - `network-discovery.json` - Request summary

---

## Discovered Services

### Core Search & Browse APIs

| Endpoint | Method | Purpose | Status | Calls |
|----------|--------|---------|--------|-------|
| `/buyer/api/v1/search/suggest` | GET | Search autocomplete suggestions | 200 | 3 |
| `/buyer/api/v1/search/related_terms` | GET | Related search keywords | 200 | 1 |
| `/buyer/api/v1/lots/recently_viewed` | GET | User's recently viewed lots | 200 | 1 |
| `/buyer/api/v1/collections/related` | GET | Related collections/categories | 200 | 1 |

**Schema Example (Search Suggest):**
```json
{
  "query_terms": [
    {
      "highlighted": "<mark>train</mark>",
      "text": "train",
      "entity": { "type": "query_term" }
    }
  ]
}
```

### Analytics & Tracking APIs

| Endpoint | Method | Purpose | Status | Calls |
|----------|--------|---------|--------|-------|
| `/UZlkr2ZV/xhr/api/v2/collector` | POST | Analytics data collection | 200 | 7 |
| `/user_tracking/api/v1/external/visitor` | POST | Visitor tracking | 201 | 1 |
| `/v1/context` | Various | User context/session | 200 | 6 |
| `/buyer/api/v1/itp_forward` | POST | ITP (tracking prevention) forward | 204 | 1 |

### Supporting Services

| Endpoint | Method | Purpose | Status | Calls |
|----------|--------|---------|--------|-------|
| `/wa/` | POST | Web analytics | 204 | 2 |
| `/ns` | POST | Notification service | 200 | 1 |

---

## Contract Analysis Summary

✅ **All Valid:** Yes (no 4xx/5xx errors)  
📊 **Endpoints Discovered:** 10 unique endpoints  
🔄 **Most Called:** `/UZlkr2ZV/xhr/api/v2/collector` (7 calls)

### Schema Validation Findings

| Endpoint | Has Schema | Sample Fields |
|----------|-----------|---------------|
| Search suggest | ✅ | `query_terms` (array) |
| Related terms | ✅ | `terms` (array) |
| Recently viewed | ✅ | `lot_ids` (array) |
| Collections | ✅ | `collections` (array) |
| Analytics collector | ✅ | `do`, `ob` (encrypted data) |

---

## Test Implementation Opportunities

### 1. **API Contract Tests** 
Validate response schemas match expected structure:
- Search suggest returns valid query_terms array
- Related collections returns valid collection objects
- All endpoints return 200/201 status codes

### 2. **UI-Backend Consistency Tests**
Verify UI displays data from API correctly:
- Search suggestions in UI match API response
- Lot counts match between API and displayed results
- Related collections shown match API data

### 3. **Performance Tests**
Monitor API response times:
- Search suggest < 500ms
- Analytics collection < 200ms
- All APIs complete within acceptable thresholds

### 4. **Data-Driven Tests**
Use discovered endpoints to create parameterized tests:
- Multiple search terms → validate suggest API
- Different locales → verify i18n support
- Various user states → test personalization

---

## Next Steps

1. ✅ Create example test for each test type in `/tests/AI/`
2. ✅ Use discovered schemas for contract validation
3. ✅ Build reusable API helper functions
4. ✅ Implement UI-backend consistency checks
5. 📋 Add performance benchmarks
6. 📋 Expand discovery to other user flows (bidding, favorites, etc.)
