# Service Discovery

## Service Discovery via Playwright MCP

### Objective
Identify backend services involved in the "Search and View Lot" flow
using Playwright network interception.

### Discovery Method
- Use Playwright's page.on('request') and page.on('response')
- Filter XHR / fetch requests
- Log request URLs, methods, and response status

### Observed Services
| Action | Endpoint Pattern | Purpose |
|------|------------------|---------|
| Search | /api/search | Returns lot summaries |
| Lot open | /api/lots/{id} | Lot details |
| Favorites | /api/favorites | Engagement data |
| Bidding | /api/bids | Current bid |

### Future Use
- API test creation
- Contract validation
- UI-backend data consistency checks
