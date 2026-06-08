## Angular ↔ MAUI Communication Strategy

EventForge uses a hybrid MAUI + Angular architecture.  
To ensure deterministic UI updates and long-term maintainability, the following rules apply:

### Use Promises for:
- Native MAUI commands
- CRUD operations
- Auction actions (CreateLeague, AddTeam, PlaceBid, etc.)
- Database access
- One-time request/response calls

These are implemented via the centralized `NativeBridgeService`.

### Use Observables for:
- Live auction updates
- Timers and countdowns
- Sync progress indicators
- Push-style or streaming events

Observables should be layered on top of Promises when streaming behavior is required.

### Important Rules
- Components must NOT call native APIs directly
- Components must NOT handle change detection manually
- All MAUI calls go through `NativeBridgeService`
- UI synchronization is centralized via `UiSyncService`

This separation is intentional and must be preserved.
