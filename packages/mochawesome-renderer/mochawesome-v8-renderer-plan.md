# Mochawesome v8 HTML Renderer — Architecture & Execution Plan

This document outlines the agreed approach, architectural decisions, and phased execution plan for building the Mochawesome v8 HTML renderer. It is intended to serve as a living reference to keep implementation focused, incremental, and aligned with the v8 schema contract.

---

## 1. Purpose & Non-Goals

### Purpose

- Design and implement a new HTML renderer that consumes the **Mochawesome v8 JSON schema directly**.
- Preserve the structural and semantic improvements introduced in v8.
- Reach practical parity with v7 HTML output **without reintroducing v7 data assumptions**.

### Non-Goals

- No dependency on Mocha runtime objects.
- No implicit inference of legacy v7 fields.
- No attempt to fully replicate v7 internals or schema.
- No premature optimization for CDN/hosted assets.

---

## 2. Core Principles

1. **Schema is the contract**

   - The v8 JSON schema is the single source of truth.
   - Renderer adapts to schema changes explicitly and intentionally.

2. **Renderer is data-only**

   - Input: v8 JSON report.
   - No imports from Mocha or reporter internals.

3. **Determinism everywhere**

   - Stable IDs and stableKeys drive routing, React keys, and permalinks.
   - No UUIDs, no runtime randomness.

4. **Incremental delivery**
   - High-value screens first (summary, failures).
   - Avoid “big bang” UI rewrites.

---

## 3. Renderer Package Structure

Suggested new package:

```
packages/mochawesome-renderer/
├─ src/
│  ├─ domain/          # schema-driven logic (pure)
│  │  ├─ index.ts
│  │  ├─ buildIndex.ts
│  │  ├─ selectors/
│  │  └─ validation/
│  ├─ app/             # app shell, routing, providers
│  ├─ components/      # UI components
│  ├─ styles/          # Tailwind setup
│  └─ entrypoints/     # embed vs linked builds
├─ fixtures/           # v8 JSON reports from integration tests
└─ tests/
```

The reporter package (`packages/mochawesome`) remains unchanged except for optional future hooks to invoke the renderer.

---

## 4. Data Flow Architecture

### High-Level Flow

```
JSON Report
   ↓
Validation
   ↓
Index / Read Model
   ↓
Selectors (derived views)
   ↓
React UI
```

### Index / Read Model (built once per report)

The index layer normalizes the tree into efficient lookup structures:

- `byId: Map<NodeId, Node>`
- `parentById: Map<NodeId, NodeId>`
- `childrenById: Map<NodeId, NodeId[]>`
- `pathById: Map<NodeId, NodeId[]>`
- `stableKeyById: Map<NodeId, string>`
- `failures: NodeId[]`
- `pending: NodeId[]`
- `skipped: NodeId[]`
- `attemptsByTestId: Map<TestId, Attempt[]>`

This layer is:

- Pure
- Deterministic
- Independent of UI concerns

---

## 5. State Model

### Context Separation

**ReportContext**

- Immutable per report load
- Contains:
  - raw report
  - index/read model
  - selector functions

**UIContext**

- Reducer-based
- Contains:
  - filters
  - search query
  - expanded/collapsed state
  - selected node
- URL-synced for shareable state

This avoids global state libraries unless proven necessary later.

---

## 6. Routing Strategy

Stable, shareable routes based on node IDs:

- `/` — summary
- `/suite/:id`
- `/test/:id`
- `/hook/:id`
- `/failures`

IDs are stable across runs when structure is unchanged.

---

## 7. Migration Strategy from v7

### UX Parity, Not Schema Parity

Focus on reproducing **user-visible behavior**, not v7 fields.

Key parity surfaces:

- Summary statistics
- Suite tree navigation
- Failure exploration
- Stack traces and context
- Retries visualization
- Hook visibility and classification

### Compatibility Adapters (Optional, Scoped)

If helpful:

- Adapters produce **screen-specific view models**, not a fake v7 report.
- Example:
  - `toFailureRows(report)`
  - `toSuiteTreeItems(report)`

Adapters must never become an alternate schema.

---

## 8. Phased Delivery Plan

### Phase 0 — Foundations

- Vite + React + TypeScript + Tailwind
- JSON loading (file + dev fixtures)
- Validation + index builder
- Basic routing

**Acceptance**

- Real v8 report loads
- Suite tree renders

---

### Phase 1 — Summary & Navigation

- Summary dashboard (passes, failures, failuresByType, pending, skipped)
- Suite tree with counts
- Breadcrumbs
- Permalinks

**Acceptance**

- Report is navigable end-to-end

---

### Phase 2 — Failure Experience

- Failures list (filterable by test/hook)
- Failure detail view
- Stack traces + context
- Links back to owning nodes

**Acceptance**

- Debugging experience matches v7 expectations

---

### Phase 3 — Node Detail Views

- Test detail view with attempts timeline
- Hook detail view with explicit hook types
- Duration and error presentation

**Acceptance**

- Retries and hook failures are first-class and clear

---

### Phase 4 — Polish & Enhancements

- Search
- “Show only failures”
- Expand/collapse all
- Performance optimizations (virtualization where needed)
- Optional theming

---

## 9. Asset Strategy

### Supported Output Modes

1. **Single-file (default)**

   - Inline JS + CSS
   - Inline JSON
   - Portable, zero setup

2. **Linked assets (optional)**
   - `report.html`
   - `assets/*.js`, `assets/*.css`
   - Optional `report.json`

### Design Implications

- Renderer accepts a generic “report source”
  - inline global
  - fetch
- No hardcoded asset paths
- Build determines asset strategy, not runtime code

---

## 10. Testing Strategy

### A. Renderer Validation Tests

- Validate required schema fields at load
- Clear errors on incompatibility

### B. Fixture-Driven Tests

Use v8 reports generated by reporter integration tests:

- serial / parallel
- retries
- hook failures
- bail
- timeouts
- skips / pending

### C. Selector & Index Unit Tests

- Parent/child/path correctness
- Failure classification
- Stats derivations
- Attempt modeling

### D. E2E (Playwright)

- Smoke tests per fixture
- Navigation assertions
- Optional screenshot tests after UI stabilizes

### E. Contract Guard

CI job:

- reporter → generate fixtures
- renderer → load + validate + smoke render
- prevents silent schema drift

---

## 11. Guiding Question Checklist (use before adding features)

- Does this rely on undocumented schema behavior?
- Is this UI-specific logic leaking into domain code?
- Can this be derived once instead of recomputed per render?
- Would a future schema change break this silently?

If the answer to any is “yes,” stop and refactor before proceeding.
