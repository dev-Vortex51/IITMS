# IITMS Backend API

Express + Prisma API for the Institutional Industrial Training Management System.

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.IO (realtime notifications)
- Nodemailer (email)
- Multer + Cloudinary (uploads)

## Scripts

- `npm run dev` - start in development with nodemon
- `npm start` - start in production mode
- `npm run seed` - seed sample data
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:migrate` - run local dev migration
- `npm run prisma:deploy` - apply migrations (production-safe)
- `npm test` - run tests

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment configuration

```bash
cp .env.example .env
```

Minimum required for startup:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>

JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>

ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### 3. Database migration

```bash
npx prisma migrate deploy
npx prisma generate
```

For development schema sync:

```bash
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

API: `http://localhost:5000/api/v1`

Health endpoint:

```http
GET /api/v1/health
```

## Realtime Notifications

- Socket endpoint: `ws://localhost:5000`
- Auth: JWT token through `socket.handshake.auth.token` or Bearer header
- User joins room: `user:<userId>`
- Emitted events:
  - `notification:new`
  - `notification:unread_count`

## Queue + Cache + Metrics

- Email jobs are processed with BullMQ using Redis
- Report and placement GET routes are Redis-cached (short TTL)
- Prometheus metrics endpoint: `GET /metrics`

## Main Route Groups

- `/auth`
- `/users`
- `/students`
- `/faculties`
- `/departments`
- `/placements`
- `/logbooks`
- `/assessments`
- `/supervisors`
- `/attendance`
- `/invitations`
- `/notifications`
- `/reports`
- `/settings`

## Email Configuration (Gmail SMTP Recommended)

Set Gmail SMTP credentials in environment:

- `EMAIL_PROVIDER=smtp`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=<your-gmail-address>`
- `SMTP_PASS=<gmail-app-password>`
- `EMAIL_FROM=IITMS <your-gmail-address>`

Optional:

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` are alias keys.
- Use Resend only if you set `EMAIL_PROVIDER=resend` and provide:
  - `RESEND_API_KEY`
  - `RESEND_FROM`

## File Uploads

- Local temporary handling via Multer
- Cloudinary integration through:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## Seed

```bash
npm run seed
```

This populates baseline users and sample domain data for testing flows.

## Deployment Notes

- Ensure `DATABASE_URL` points to managed Postgres (e.g., Neon)
- Run `npx prisma migrate deploy` during build/release
- Set production CORS values in `ALLOWED_ORIGINS`
- Set `FRONTEND_URL` to deployed frontend
