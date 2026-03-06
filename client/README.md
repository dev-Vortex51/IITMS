# IITMS Frontend

Next.js 14 frontend for IITMS role-based dashboards and workflows.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + design-system components
- Mantine (selected layout/UI helpers)
- TanStack Query
- Axios
- Recharts
- Socket.IO client (realtime notifications)

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint
- `npm run lint:design` - design conformance checks
- `npm run lint:all` - run all lint checks

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment configuration

Create `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

`NEXT_PUBLIC_API_URL` can be either:

- `http://host/api/v1` (preferred), or
- `http://host/api` (auto-normalized to `/api/v1` by the client)

### 3. Run

```bash
npm run dev
```

App URL: `http://localhost:3000`

## App Areas

Route groups by role:

- `/admin/*`
- `/coordinator/*`
- `/d-supervisor/*` (academic supervisor)
- `/i-supervisor/*` (industrial supervisor)
- `/student/*`

Auth and onboarding:

- `/login`
- `/forgot-password`
- `/reset-password`
- `/invite/verify`
- `/invite/setup`

## Realtime Notifications

The app connects to backend Socket.IO using JWT from local storage:

- Event: `notification:new`
- Event: `notification:unread_count`

Notification pages are available per role under:

- `/<role>/notification`

## Shared Design System

Reusable primitives live in:

- `src/components/design-system/*`

Includes:

- App shell/page header
- Table system (Atlassian-style table shell + action menu)
- Loading/error/empty states
- Dashboard cards and chart wrappers
- Filter bars and controls

## API Access Layer

Main HTTP client:

- `src/lib/api-client.ts`

Key behavior:

- Reads base URL from `NEXT_PUBLIC_API_URL`
- Auto-attaches bearer token from local storage/cookie
- Redirects to `/login` on unauthorized responses

## Deployment (Vercel)

Recommended settings:

- Root directory: `client`
- Framework: Next.js
- Env var:
  - `NEXT_PUBLIC_API_URL=https://<backend-domain>/api/v1`

After deployment, ensure backend CORS allows the frontend domain.
