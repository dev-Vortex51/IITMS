# ARCHITECTURE.md

# System Architecture Documentation

## Overview

The SIWES Management System backend follows a **layered architecture** with clear separation of concerns, implementing industry-standard design patterns for maintainability, scalability, and testability.

## Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│            (React, Vue, Mobile App, etc.)               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                       │
│  ┌──────────┬──────────┬──────────┬─────────────────┐  │
│  │   Auth   │   CORS   │  Helmet  │  Rate Limiting  │  │
│  └──────────┴──────────┴──────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    ROUTING LAYER                         │
│         Express Router - API Endpoint Mapping           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                        │
│        HTTP Request/Response Handling                   │
│        Input Validation & Response Formatting           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                          │
│            Business Logic & Orchestration               │
│        (Auth, User Management, Notifications)           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                       │
│              Mongoose Models & Schemas                  │
│           Database Operations & Relationships           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│                  MongoDB Database                       │
└─────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. **MVC (Model-View-Controller)**

**Implementation:**

- **Models**: Mongoose schemas (`src/models/`)
- **Views**: JSON responses (no templates)
- **Controllers**: Request handlers (`src/controllers/`)

**Example:**

```javascript
// Model (User.js)
const userSchema = new mongoose.Schema({ ... });

// Controller (authController.js)
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(...);
  res.json(formatResponse(true, 'Success', result));
});

// Route (authRoutes.js)
router.post('/login', validateBody(...), login);
```

### 2. **Service Layer Pattern**

**Purpose:** Separate business logic from HTTP concerns

**Benefits:**

- Reusable business logic
- Easier testing
- Single Responsibility Principle

**Example:**

```javascript
// Service (authService.js)
const login = async (email, password) => {
  const user = await User.findOne({ email });
  // Business logic here
  return { user, tokens };
};

// Controller uses service
const loginController = async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
};
```

### 3. **Repository Pattern** (via Mongoose Models)

**Purpose:** Abstract database operations

**Example:**

```javascript
// Static methods act as repositories
userSchema.statics.findActiveByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Usage
const students = await User.findActiveByRole("student");
```

### 4. **Middleware Chain Pattern**

**Purpose:** Modular request processing

**Example:**

```javascript
router.post(
  "/users",
  authenticate, // Auth check
  adminOnly, // Authorization
  validateBody(userSchema), // Validation
  sanitize, // Sanitization
  userController.createUser // Handler
);
```

### 5. **Factory Pattern** (User Creation)

**Purpose:** Encapsulate object creation logic

**Example:**

```javascript
const createUser = async (userData, creatorUser) => {
  // Different creation logic based on role
  if (role === 'student') {
    await createStudentProfile(...);
  } else if (role === 'supervisor') {
    await createSupervisorProfile(...);
  }
};
```

## Data Flow

### 1. **Authentication Flow**

```
┌─────────┐    Login Request    ┌────────────┐
│ Client  │ ──────────────────▶ │  Express   │
└─────────┘                      │   Router   │
                                 └────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │  Validation    │
                              │  Middleware    │
                              └────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   Auth         │
                              │  Controller    │
                              └────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   Auth         │
                              │   Service      │
                              └────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   User Model   │
                              │   (MongoDB)    │
                              └────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │  JWT Token     │
┌─────────┐    Response       │  Generated     │
│ Client  │ ◀──────────────── │  & Returned    │
└─────────┘                    └────────────────┘
```

### 2. **Placement Approval Flow**

```
Student Submits → Coordinator Reviews → Supervisor Assigned → Notifications Sent
     │                    │                      │                    │
     ▼                    ▼                      ▼                    ▼
Placement Model    Update Status         Create/Assign        Notification
   Created         (Approved/Rejected)   Industrial Sup.      Service
```

## Database Design

### Entity Relationship Diagram

```
┌──────────┐
│   User   │
└─────┬────┘
      │
      ├──────────┬────────────┬─────────────┬──────────────┐
      │          │            │             │              │
      ▼          ▼            ▼             ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐  ┌─────────────┐
│ Student │ │Supervisor│ │Coordinator│ │  Admin   │  │Notification │
└────┬────┘ └────┬─────┘ └──────────┘ └──────────┘  └─────────────┘
     │           │
     │           │
     ├───────────┴────────┬──────────────┬────────────┐
     │                    │              │            │
     ▼                    ▼              ▼            ▼
┌──────────┐      ┌────────────┐  ┌──────────┐  ┌───────────┐
│Placement │      │  Logbook   │  │Assessment│  │Department │
└──────────┘      └────────────┘  └──────────┘  └─────┬─────┘
                                                       │
                                                       ▼
                                                  ┌─────────┐
                                                  │ Faculty │
                                                  └─────────┘
```

### Relationships

| Model      | Relationship | Related Model | Type        |
| ---------- | ------------ | ------------- | ----------- |
| Student    | belongs to   | User          | One-to-One  |
| Student    | belongs to   | Department    | Many-to-One |
| Student    | has many     | Logbooks      | One-to-Many |
| Student    | has many     | Assessments   | One-to-Many |
| Student    | has many     | Placements    | One-to-Many |
| Placement  | belongs to   | Student       | Many-to-One |
| Logbook    | belongs to   | Student       | Many-to-One |
| Department | belongs to   | Faculty       | Many-to-One |
| Supervisor | supervises   | Students      | One-to-Many |

## Security Architecture

### Defense in Depth Strategy

```
┌─────────────────────────────────────────────────────┐
│              Layer 1: Network Security              │
│         (HTTPS, CORS, Rate Limiting)               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│          Layer 2: Input Validation                  │
│      (Joi Schemas, Sanitization, NoSQL Prevent)    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         Layer 3: Authentication                     │
│         (JWT Tokens, Password Hashing)             │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         Layer 4: Authorization                      │
│         (RBAC, Resource Ownership)                 │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         Layer 5: Data Protection                    │
│      (Encryption at Rest, Secure Sessions)         │
└─────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

**Current Implementation:**

- Stateless API (JWT tokens)
- No session store dependency
- Database connection pooling

**Future Enhancements:**

- Load balancer ready
- Redis for caching
- Database replication

### Vertical Scaling

**Optimizations:**

- Database indexes on frequently queried fields
- Pagination for large datasets
- Lazy loading with populate
- Compression middleware

## Error Handling Architecture

```
Error Occurs
    │
    ▼
┌──────────────────┐
│  Try/Catch or    │
│  Promise Reject  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  asyncHandler    │
│  Wrapper         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Error Handler   │
│  Middleware      │
└────────┬─────────┘
         │
         ├─── Operational Error ──▶ Format & Send to Client
         │
         └─── Programming Error ──▶ Log & Send Generic Message
```

## Testing Strategy

### Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  ← Few (API Integration Tests)
        ├─────────┤
        │  Integration │  ← Some (Service + DB Tests)
        ├──────────────┤
        │  Unit Tests   │  ← Many (Pure Functions)
        └───────────────┘
```

### Coverage Areas

- **Unit Tests**: Services, utilities, helpers
- **Integration Tests**: Controllers + Services + DB
- **E2E Tests**: Full request/response cycle

## Performance Optimization

### 1. **Database Optimization**

- Indexes on common query fields
- Virtual populate instead of nested queries
- Lean queries when full documents not needed
- Aggregation pipeline for complex queries

### 2. **Caching Strategy** (Future)

```javascript
// Redis caching example
const getCachedUser = async (userId) => {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  const user = await User.findById(userId);
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  return user;
};
```

### 3. **Response Optimization**

- Compression middleware
- Pagination for lists
- Field selection (select specific fields only)
- JSON minification in production

## Monitoring & Logging

### Logging Levels

```javascript
logger.error(); // Critical errors, requires attention
logger.warn(); // Warning, potential issues
logger.info(); // Important business events
logger.debug(); // Detailed debugging information
```

### What We Log

- **Auth Events**: Login attempts, password changes
- **Security Events**: Suspicious activity, rate limit hits
- **Business Events**: User creation, placement approvals
- **Errors**: All exceptions with stack traces
- **Performance**: Slow queries, high memory usage

## Deployment Architecture

### Production Setup

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
       ├────────┬────────┬────────┐
       ▼        ▼        ▼        ▼
   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
   │Node │  │Node │  │Node │  │Node │
   │  1  │  │  2  │  │  3  │  │  4  │
   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
      │        │        │        │
      └────────┴────────┴────────┘
                 │
                 ▼
      ┌────────────────────┐
      │  MongoDB Replica   │
      │       Set          │
      └────────────────────┘
```

## API Versioning Strategy

**Current:** `/api/v1/...`

**Future Versions:**

- `/api/v2/...` - Breaking changes
- Maintain v1 for backward compatibility
- Deprecation warnings for old versions

## Design Decisions & Rationale

### 1. **Why MongoDB?**

- Flexible schema for evolving requirements
- Good performance with embedded documents
- Rich query capabilities
- Easy horizontal scaling

### 2. **Why JWT over Sessions?**

- Stateless (easier scaling)
- Mobile-friendly
- Cross-domain support
- No server-side storage needed

### 3. **Why Service Layer?**

- Testability (mock easily)
- Reusability across controllers
- Business logic centralization
- Clean separation of concerns

### 4. **Why Joi for Validation?**

- Declarative schema definition
- Rich validation rules
- Great error messages
- Composable schemas

---

This architecture provides a solid foundation that is:

- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Scalable**: Stateless, horizontally scalable
- ✅ **Secure**: Multiple security layers
- ✅ **Testable**: Isolated components
- ✅ **Extensible**: Easy to add new features
