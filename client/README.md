# SIWES Management System - Frontend

Professional Next.js frontend for the Institutional Industrial Training Management System.

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🎨 Design System

### Color Palette

- **Primary**: `#00044B` (Deep Navy)
- **Accent**: `#FFCB70` (Golden Yellow)
- **Background**: Neutral grays
- **Foreground**: White

### Components

All UI components follow shadcn/ui patterns:

- DataTable (TanStack Table)
- Forms with validation
- Modals/Dialogs
- Toast notifications
- Loading skeletons
- Empty states

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── faculties/
│   │   │   │   ├── departments/
│   │   │   │   ├── coordinators/
│   │   │   │   └── reports/
│   │   │   ├── coordinator/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── placements/
│   │   │   │   ├── departmental-supervisors/
│   │   │   │   ├── industrial-supervisors/
│   │   │   │   ├── logbooks/
│   │   │   │   ├── assessments/
│   │   │   │   └── reports/
│   │   │   ├── d-supervisor/          # Academic Supervisor
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── evaluations/
│   │   │   │   └── settings/
│   │   │   ├── i-supervisor/          # Industrial Supervisor
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── assessments/
│   │   │   │   └── settings/
│   │   │   └── student/
│   │   │       ├── dashboard/
│   │   │       ├── placement/
│   │   │       ├── logbook/
│   │   │       ├── supervisors/
│   │   │       ├── reports/
│   │   │       └── settings/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layouts/           # Dashboard layouts
│   │   ├── forms/             # Reusable forms
│   │   ├── tables/            # Data tables
│   │   └── shared/            # Shared components
│   ├── services/              # API services
│   │   ├── auth.service.ts
│   │   ├── student.service.ts
│   │   ├── placement.service.ts
│   │   ├── logbook.service.ts
│   │   ├── assessment.service.ts
│   │   ├── supervisor.service.ts
│   │   ├── faculty.service.ts
│   │   └── department.service.ts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/
└── package.json
```

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

Six user roles with distinct dashboards:

1. **Admin** - System-wide management
2. **Faculty** - Faculty oversight
3. **Coordinator** - Department SIWES coordination
4. **Academic Supervisor** - Academic supervision
5. **Industrial Supervisor** - Workplace supervision
6. **Student** - Placement & logbook management

### Authentication Flow

1. User logs in → JWT token stored in cookie
2. First login → Force password reset
3. Role-based redirect to appropriate dashboard
4. Middleware protects routes based on role

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Key Features by Role

### Admin Dashboard

- Manage faculties and departments
- Create coordinator accounts
- System-wide reports
- User management

### Coordinator Dashboard

- Create student accounts
- Approve/reject placements
- Create and assign supervisors
- Monitor student progress
- Generate reports

### Supervisor Dashboards

- View assigned students
- Grade assessments
- Approve logbook entries
- Submit evaluations

### Student Dashboard

- Register placement
- Upload acceptance letter
- Fill digital logbook
- View supervisors
- Submit reports

## 🔧 Configuration

Environment variables (`.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📚 API Integration

All API calls use TanStack Query for:

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

## 🎯 Development Guidelines

1. **Component Structure**: Follow atomic design principles
2. **Type Safety**: Strict TypeScript throughout
3. **API Calls**: Use React Query hooks
4. **Forms**: React Hook Form + Zod validation
5. **Styling**: Tailwind utility classes
6. **Icons**: Lucide React only
7. **State**: Server state (React Query) + Client state (React hooks)

## 📦 Core Dependencies

- `next`: 14.2.5
- `react`: 18.3.1
- `@tanstack/react-query`: 5.56.2
- `@tanstack/react-table`: 8.20.5
- `axios`: 1.7.7
- `lucide-react`: 0.438.0
- `tailwindcss`: 3.4.10
- `zod`: 3.23.8
- `react-hook-form`: 7.53.0

## 🔒 Security

- JWT token authentication
- HTTP-only cookies (recommended)
- Role-based route protection
- Input validation with Zod
- XSS protection
- CSRF protection

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Responsive navigation
- Touch-friendly UI elements

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📄 License

Proprietary - Institutional Use Only
