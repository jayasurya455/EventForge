# EventForge – Architecture Lock & Evolution Contract

## Status
**LOCKED – Phase 2 Complete**  
_Last updated: 2026-02-02_

This document defines the **non-negotiable architectural contract** of EventForge.  
Any future development, refactoring, or optimization **must comply with this document**.

---

## 1. Architectural Goals (Immutable)

EventForge is designed to be:

- **Offline-first**
- **Deterministic**
- **Portable (single-file transfer)**
- **Cross-platform (Windows, macOS, Linux, Android, iOS)**
- **Sync-ready (event-based, future)**
- **UI-agnostic**
- **Failure-tolerant**

These goals **must never be compromised**.

---

## 2. High-Level Architecture (LOCKED)

UI (Angular / Web)
↓
MAUI WebView (OnNavigating Bridge) ← LOCKED
↓
Native Command Router
↓
Application Command / Query Handlers
↓
Domain Events
↓
SQLite (Authoritative Offline Store)

## 3. Source of Truth Rules (LOCKED)

| Component | Role |
|--------|------|
SQLite Database | **Authoritative offline state** |
Event Log (JSON / DB table) | **Sync & audit source** |
Domain Events | State transition contract |
UI State | Derived only from queries |

✅ SQLite **is authoritative offline**  
✅ Event log is **append-only**  
❌ UI is **never authoritative**  
❌ Domain never reads from UI  

---

## 4. Domain Layer Rules (LOCKED)

The Domain layer:

- Contains **only**:
  - Domain events
  - Domain rules
  - Domain invariants
- Has **zero dependencies** on:
  - MAUI
  - Angular
  - SQLite
  - EF Core
  - File system
  - Time
  - Async I/O

### Domain Invariants
- All state change is represented as **events**
- No randomness
- No wall-clock dependency
- Deterministic execution is mandatory

---

## 5. Command vs Query (CQRS – LOCKED)

### Commands
- Change state
- Flow:
UI → OnNavigating → Router → Command Handler → SQLite + Event Log
- Must be **idempotent**
- Return success / failure only

### Queries
- Read-only
- Flow:
UI → OnNavigating → Router → Query Handler → SQLite
- Must never mutate state

Commands and queries **must never be mixed**.

---

## 6. Event Log Rules (LOCKED)

- Append-only
- Immutable
- Serializable (JSON-compatible)
- Never deleted
- Used for:
- Sync
- Audit
- Debugging
- Conflict resolution (future)

⚠️ Events are **not replayed at startup**.

---

## 7. SQLite Rules (LOCKED)

- SQLite is the **offline authority**
- DB file transfer = full app state
- Schema evolution must be **backward compatible**
- No destructive migrations
- `EnsureCreated()` allowed
- Startup must be **O(1)** (no rebuilds)

---

## 8. MAUI Bridge Rules (LOCKED)

- Communication via **custom URL scheme**
eventforge://?method=...&payload=...
- `WebView.OnNavigating` is the **official transport**
- MainPage responsibilities:
- Intercept navigation
- Parse payload
- Delegate to router
- Return JS result

❌ No business logic in MainPage  
❌ No DB access in MainPage  

---

## 9. Routing & SRP (LOCKED)

Responsibilities are strictly separated:

| Component | Responsibility |
|---|---|
MainPage | Transport only |
NativeCommandRouter | Method routing |
HybridBridge | DI + handler invocation |
Command Handlers | State mutation |
Query Handlers | Read-only access |

---

## 10. UI Rules (LOCKED)

- UI is **stateless**
- UI renders **query results only**
- UI never:
- Mutates state directly
- Accesses SQLite
- Contains domain logic

UI can be replaced without touching domain or data layers.

---

## 11. Cross-Platform Guarantee

This architecture works across OS because:

| Layer | Reason |
|---|---|
.NET MAUI | Cross-platform runtime |
Web UI | OS-agnostic |
SQLite | Embedded & portable |
Event Log | Serializable |
No OS APIs in Domain | Deterministic |

Supported:
- ✅ Windows
- ✅ macOS
- ✅ Linux
- ✅ Android
- ✅ iOS

---

## 12. Allowed Improvements (PERMITTED)

✅ Performance optimizations  
✅ UX enhancements  
✅ Sync engine (event-based)  
✅ Compression / batching  
✅ Observability (outside domain)

---

## 13. Forbidden Changes (ABSOLUTE)

❌ UI mutating state directly  
❌ Domain referencing infrastructure  
❌ Non-idempotent commands  
❌ Time-based logic in domain  
❌ Startup rebuilds  
❌ Multiple sources of truth  

---

## 14. Architectural Litmus Test

If you:

- Copy the SQLite DB file to another device
- Launch the app

✅ The app must work immediately.

If not — the change is invalid.

---

## 15. Final Statement

This architecture is **intentionally strict but pragmatic**.

It optimizes for:
- Stability
- Portability
- Developer velocity
- Future sync without rewrites

**All future work must evolve within this boundary.**