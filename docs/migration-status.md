# IITMS Design System Migration Status

## Description

This effort is a full frontend design-system migration for IITMS.

We are replacing ad hoc page layouts and UI patterns with shared reusable components from `client/src/components/design-system` so every page follows the same structure, spacing, states, and interaction patterns.

Core standards being enforced on every module:

- `PageHeader` + consistent section composition (`SectionCard`, `StatsGrid`, `StatCard`)
- Consistent state handling (`LoadingPage`, `LoadingTableSkeleton`, `ErrorLocalState`, `ErrorGlobalState`, `EmptyState`, `AlertInline`)
- Shared table/filter patterns (`TableShell`, `FilterBar`, `FilterField*`, `StatusBadge`)
- Shared form patterns (`FormSection`, `FormFieldRow`, `FormActionsBar`)
- File-size discipline to avoid monolith files (target: <= 300 lines where practical)

## Modules Planned

1. Student (`/student/*`)
2. Coordinator (`/coordinator/*`)
3. Department Supervisor (`/d-supervisor/*`)
4. Industry Supervisor (`/i-supervisor/*`)
5. Admin (`/admin/*`)
6. Public/Auth (`/`, `/login`, `/forgot-password`, `/reset-password`, `/invite/*`)

## Implemented Modules

### 1. Student

Status: Completed

Completed pages:

- `/student/dashboard`
- `/student/attendance`
- `/student/placement`
- `/student/logbook`
- `/student/supervisors`
- `/student/settings`

### 2. Coordinator

Status: Completed

Completed pages:

- `/coordinator/dashboard`
- `/coordinator/invitations`
- `/coordinator/placements`
- `/coordinator/reports` (split oversized page into reusable components)
- `/coordinator/settings`
- `/coordinator/students`
- `/coordinator/students/[id]`
- `/coordinator/students/[id]/placement`
- `/coordinator/students/[id]/supervisors`
- `/coordinator/supervisors`
- `/coordinator/supervisors/[id]`

### 3. Department Supervisor

Status: Completed

Completed pages:

- `/d-supervisor/dashboard`
- `/d-supervisor/students`
- `/d-supervisor/students/[id]` (split into reusable section components)
- `/d-supervisor/attendance`
- `/d-supervisor/evaluations`
- `/d-supervisor/settings`
- `/d-supervisor/assessments` (already modular, validated)
- `/d-supervisor/logbooks`

## Remaining Modules

### A. Industry Supervisor

Status: Completed

Completed pages:

- `/i-supervisor/dashboard`
- `/i-supervisor/attendance`
- `/i-supervisor/logbooks` (fully decomposed into hook/components)
- `/i-supervisor/assessments` (decomposed into hook/components)
- `/i-supervisor/students`
- `/i-supervisor/students/[id]`
- `/i-supervisor/settings` (decomposed into hook/components)

### B. Admin

Status: Completed

Completed pages:

- `/admin/dashboard`
- `/admin/invitations` (decomposed into hook/components)
- `/admin/faculties`
- `/admin/faculties/[id]`
- `/admin/departments`
- `/admin/departments/[id]`
- `/admin/coordinators` (decomposed into hook/components)
- `/admin/coordinators/create`
- `/admin/academic-supervisors` (decomposed into hook/components)
- `/admin/academic-supervisors/create`
- `/admin/reports` (decomposed into hook/components)
- `/admin/settings` (decomposed into hook/components)

### C. Public/Auth
Status: Completed

Completed pages:

- `/`
- `/login` (aligned to shared auth shell/components)
- `/forgot-password` (aligned to shared auth shell/components)
- `/reset-password` (aligned to shared auth shell/components)
- `/invite/verify` (aligned to shared auth shell/components)
- `/invite/setup` (decomposed into hook/components and aligned to shared auth-state patterns)

## Current Next Step

Run end-to-end regression checks across all role portals and auth flows, then finalize migration cleanup documentation.

## Cross-Cutting Conformance

Status: Completed

Implemented:

- Refactored `dashboard-shell` to wireframe-compliant app frame:
  - fixed sidebar
  - desktop top bar (`title + search placeholder + alerts + avatar/logout menu`)
  - centered content container (`max-w-7xl`)
- Updated all role `layout.tsx` files to rely on the unified shell contract (notification UI now owned by shell)
- Normalized remaining admin detail pages to strict `PageHeader + SectionCard` composition with standardized loading/error/empty route states
- Added route-level automated conformance checks (`npm run lint:design`, `npm run lint:all`) to enforce design-system/auth composition and token-safe styling guards

<!-- 019cb598-2ace-7a02-a3bb-26e9574bd6fc    -->
