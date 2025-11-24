# API Endpoints Reference

## Authentication & Authorization

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 409  | Conflict - Resource already exists      |
| 422  | Unprocessable Entity - Validation error |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

## Authentication Endpoints

### POST /api/v1/auth/login

Login user and get JWT token

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response (First Login):**

```json
{
  "success": true,
  "message": "Password reset required",
  "data": {
    "requiresPasswordReset": true,
    "isFirstLogin": true,
    "userId": "60d5ec49f1b2c72b8c8e4f1a",
    "tempToken": "eyJhbGci..."
  }
}
```

**Response (Normal Login):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "student"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### POST /api/v1/auth/reset-password-first-login

Reset password on first login

**Request:**

```json
{
  "userId": "60d5ec49f1b2c72b8c8e4f1a",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### POST /api/v1/auth/change-password

Change password (authenticated users)

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
```

### GET /api/v1/auth/profile

Get current user profile

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "profileData": {
      "matricNumber": "CSC/2020/001",
      "department": {...},
      "level": 300
    }
  }
}
```

## User Management Endpoints

### POST /api/v1/users

Create new user (Admin/Coordinator only)

**Headers:**

```
Authorization: Bearer <token>
```

**Request (Create Student):**

```json
{
  "email": "student@example.com",
  "firstName": "Alice",
  "lastName": "Student",
  "role": "student",
  "department": "60d5ec49f1b2c72b8c8e4f1a",
  "matricNumber": "CSC/2020/003",
  "level": 300,
  "session": "2023/2024",
  "phone": "+2348012345678"
}
```

**Request (Create Coordinator):**

```json
{
  "email": "coordinator@example.com",
  "firstName": "John",
  "lastName": "Coordinator",
  "role": "coordinator",
  "department": "60d5ec49f1b2c72b8c8e4f1a",
  "phone": "+2348012345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "user": {...},
    "defaultPassword": "Change@123"
  }
}
```

### GET /api/v1/users

Get all users with pagination

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name/email

**Example:**

```
GET /api/v1/users?page=1&limit=20&role=student&search=john
```

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### GET /api/v1/users/:id

Get user by ID

### PUT /api/v1/users/:id

Update user

### DELETE /api/v1/users/:id

Deactivate user (Admin only)

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Validation Rules

### Email

- Must be valid email format
- Required for all users
- Must be unique

### Password

- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%\*?&)

### Matric Number

- Format: `XXX/YYYY/NNN` (e.g., CSC/2020/001)
- Required for students
- Must be unique

### Phone Number

- Must be valid phone number format
- Optional for most users

### Role-Based Permissions

| Action                 | Admin | Coordinator | Student | Supervisor |
| ---------------------- | ----- | ----------- | ------- | ---------- |
| Create Faculty/Dept    | ✓     | ✗           | ✗       | ✗          |
| Create Coordinator     | ✓     | ✗           | ✗       | ✗          |
| Create Student         | ✓     | ✓           | ✗       | ✗          |
| Create Dept Supervisor | ✓     | ✓           | ✗       | ✗          |
| Approve Placement      | ✓     | ✓           | ✗       | ✗          |
| Review Logbook         | ✗     | ✗           | ✗       | ✓          |
| Submit Logbook         | ✗     | ✗           | ✓       | ✗          |

## Rate Limits

| Endpoint    | Limit                       |
| ----------- | --------------------------- |
| Login       | 5 requests per 15 minutes   |
| General API | 100 requests per 15 minutes |
| File Upload | 20 requests per hour        |
| Role-based  | Varies by role              |

## Postman Collection

Import the following into Postman for quick testing:

```json
{
  "info": {
    "name": "SIWES Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/v1"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```
