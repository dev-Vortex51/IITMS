# IITMS (Institutional Industrial Training Management System)

Full-stack SIWES/IT management platform for institutions, coordinators, supervisors, and students.

## Overview

IITMS manages the end-to-end industrial training lifecycle:

- Role-based access for `admin`, `coordinator`, `academic_supervisor`, `industrial_supervisor`, and `student`
- Invitation-driven account onboarding
- Placement submission and approval workflow
- Weekly logbook workflow (student -> industrial review -> departmental approval)
- Attendance check-in/absence handling
- Assessments and reporting
- In-app notifications with realtime delivery (Socket.IO)

## Repository Structure

```text
IITMS/
├─ backend/   # Node.js + Express + Prisma + PostgreSQL API
├─ client/    # Next.js 14 frontend
└─ docs/      # Design and migration documentation
```

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind, Mantine, TanStack Query, Recharts
- Backend: Node.js, Express, Prisma, PostgreSQL, Socket.IO, Nodemailer, Multer
- Storage: PostgreSQL (primary data), Cloudinary (file uploads)

## Quick Start (Local)

### 1. Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### 2. Clone and install

```bash
git clone <your-repo-url>
cd IITMS

cd backend && npm install
cd ../client && npm install
```

### 3. Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Client (`client/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Run database migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

For fresh local schema sync during development:

```bash
npx prisma db push
```

### 5. Start services

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

Backend:

- `npm run dev` - start API with nodemon
- `npm start` - start API in production mode
- `npm run seed` - seed sample data
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:deploy` - apply production migrations

Frontend:

- `npm run dev` - start Next.js app
- `npm run build` - production build
- `npm run lint` - lint app

## API and Realtime

- API base URL: `http://localhost:5000/api/v1`
- Health check: `GET /api/v1/health`
- Socket.IO endpoint: `ws://localhost:5000`
- Socket auth: JWT token in `auth.token` or `Authorization: Bearer <token>`

## Deployment (Free-Friendly)

Recommended:

- Database: Neon (PostgreSQL)
- Backend: Render Web Service
- Frontend: Vercel

High-level:

1. Deploy backend from `backend/` root with migration command in build step.
2. Set backend env vars (`DATABASE_URL`, JWT secrets, CORS, Cloudinary, SMTP).
3. Deploy frontend from `client/` root and set `NEXT_PUBLIC_API_URL` to backend URL.
4. Update backend `FRONTEND_URL` and `ALLOWED_ORIGINS` to the deployed frontend domain.

## Environment Variables (Core)

Backend (required):

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ALLOWED_ORIGINS`
- `FRONTEND_URL`

Backend (feature-specific):

- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email: `SMTP_*` and/or `EMAIL_*` variables (see backend README for details)

Frontend:

- `NEXT_PUBLIC_API_URL`

## Documentation

- Backend setup and API notes: [backend/README.md](/home/bello/Desktop/projects/IITMS/backend/README.md)
- Frontend setup and app structure: [client/README.md](/home/bello/Desktop/projects/IITMS/client/README.md)
- Additional notes: `docs/`

## License

Proprietary / Institutional use.
