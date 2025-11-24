# SIWES/IT Management System - Backend API

A comprehensive, secure, and scalable backend API for managing Institutional Industrial Training (SIWES/IT) programs. Built with Node.js, Express.js, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Contributing](#contributing)

## ✨ Features

### User Management

- **Role-based access control (RBAC)** with 7 user roles
- **Secure authentication** with JWT tokens
- **Forced password reset** on first login
- **User creation flow**: Admin → Coordinators → Students/Supervisors

### Placement Management

- Student placement registration with acceptance letters
- Coordinator approval/rejection workflow
- Industrial supervisor assignment after approval
- Placement tracking and reporting

### Logbook Management

- Weekly logbook entry submission by students
- Dual supervisor review system (Departmental & Industrial)
- Evidence attachment support
- Rating and feedback system

### Assessment System

- Multi-criteria student evaluation
- Departmental and Industrial assessments
- Automated grading based on scores
- Coordinator verification workflow

### Notifications

- In-app notification system
- Email notifications (optional via NodeMailer)
- Priority-based notifications
- Real-time notification delivery

### Reporting

- Student progress reports
- Logbook export functionality
- Assessment reports
- Department-wise analytics

## 🏗 System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Express API │────▶│   MongoDB   │
│ (Frontend)  │     │   (Backend)  │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  NodeMailer  │
                    │ (Email Srv)  │
                    └──────────────┘
```

### Design Patterns

- **MVC Architecture**: Separation of concerns with Models, Controllers, Services
- **Service Layer**: Business logic abstraction for reusability
- **Middleware Pattern**: Authentication, validation, error handling
- **Repository Pattern**: Database operations encapsulated in models

## 🛠 Tech Stack

### Core

- **Node.js** (v16+)
- **Express.js** (v4.18+)
- **MongoDB** (v6+) with Mongoose ODM

### Security

- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

### Validation & Quality

- **Joi** - Schema validation
- **express-validator** - Request validation
- **ESLint** - Code linting
- **Jest** - Testing framework

### Utilities

- **Winston** - Logging
- **Morgan** - HTTP request logging
- **NodeMailer** - Email notifications
- **PDFKit** - PDF generation
- **Multer** - File uploads

## 📦 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 6.0.0
- npm >= 8.0.0

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siwes_management
JWT_SECRET=your_super_secret_jwt_key
DEFAULT_PASSWORD=Change@123
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Setup MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas:

```bash
# Local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## ⚙️ Configuration

All configuration is managed through environment variables in `.env`:

| Variable           | Description                          | Default                         |
| ------------------ | ------------------------------------ | ------------------------------- |
| `NODE_ENV`         | Environment (development/production) | development                     |
| `PORT`             | Server port                          | 5000                            |
| `MONGODB_URI`      | MongoDB connection string            | mongodb://localhost:27017/siwes |
| `JWT_SECRET`       | Secret key for JWT                   | Required                        |
| `JWT_EXPIRE`       | JWT expiration time                  | 7d                              |
| `DEFAULT_PASSWORD` | Default password for new users       | Change@123                      |
| `BCRYPT_ROUNDS`    | BCrypt hashing rounds                | 12                              |
| `ALLOWED_ORIGINS`  | CORS allowed origins                 | http://localhost:3000           |

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Seed Database with Sample Data

```bash
npm run seed
```

This creates:

- Admin user: `admin@siwes.edu` / `Admin@123`
- Coordinator: `coordinator.csc@siwes.edu` / `Coord@123`
- Students, Supervisors, and sample data

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                           | Description                   | Access  |
| ------ | ---------------------------------- | ----------------------------- | ------- |
| POST   | `/auth/login`                      | User login                    | Public  |
| POST   | `/auth/reset-password-first-login` | Reset password on first login | Public  |
| POST   | `/auth/change-password`            | Change password               | Private |
| POST   | `/auth/refresh-token`              | Refresh access token          | Public  |
| GET    | `/auth/profile`                    | Get user profile              | Private |
| PUT    | `/auth/profile`                    | Update profile                | Private |
| POST   | `/auth/logout`                     | Logout user                   | Private |

### User Management Endpoints

| Method | Endpoint     | Description     | Access            |
| ------ | ------------ | --------------- | ----------------- |
| POST   | `/users`     | Create user     | Admin/Coordinator |
| GET    | `/users`     | Get all users   | Admin/Coordinator |
| GET    | `/users/:id` | Get user by ID  | Admin/Coordinator |
| PUT    | `/users/:id` | Update user     | Admin/Coordinator |
| DELETE | `/users/:id` | Deactivate user | Admin             |

### Example Request

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@siwes.edu",
    "password": "Admin@123"
  }'

# Get Profile (with JWT token)
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🗄 Database Models

### User Roles Hierarchy

```
Admin
  ├── Faculty
  ├── Department
  └── Coordinator
        ├── Student
        ├── Departmental Supervisor
        └── Industrial Supervisor (created after placement approval)
```

### Core Models

1. **User** - Base user model with authentication
2. **Faculty** - Academic faculties
3. **Department** - Departments within faculties
4. **Student** - Student profiles and training info
5. **Supervisor** - Departmental and Industrial supervisors
6. **Placement** - Student placement applications
7. **Logbook** - Weekly training logbooks
8. **Assessment** - Student assessments
9. **Notification** - In-app notifications

### Relationships

- Student → Department (Many-to-One)
- Department → Faculty (Many-to-One)
- Placement → Student (Many-to-One)
- Logbook → Student (Many-to-One)
- Assessment → Student & Supervisor (Many-to-One)
- Supervisor → Students (One-to-Many)

## 🧪 Testing

### Test Structure

```
src/tests/
├── setup.js                 # Test configuration
├── services/
│   └── authService.test.js  # Service tests
├── controllers/             # Controller tests
└── integration/             # Integration tests
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- authService.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Test Coverage Goals

- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

## 🚢 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set up email service credentials
5. Configure CORS for production domain

### Deployment Platforms

#### Heroku

```bash
# Install Heroku CLI
heroku login
heroku create siwes-management-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

#### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### AWS EC2

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# Clone and setup
git clone <repo-url>
cd backend
npm install
npm start
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name siwes-api

# Auto-restart on server reboot
pm2 startup
pm2 save
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.js         # Environment config
│   │   └── database.js      # Database connection
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Placement.js
│   │   └── ...
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   └── userService.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── authorization.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── security.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── logger.js
│   ├── scripts/             # Utility scripts
│   │   └── seed.js
│   ├── tests/               # Test files
│   ├── app.js               # Express app
│   └── server.js            # Server entry point
├── logs/                    # Log files
├── uploads/                 # Uploaded files
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── jest.config.js
└── README.md
```

## 🔒 Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 rounds)
- Forced password reset on first login
- Token expiration and refresh mechanism

### Input Validation

- Joi schema validation
- Express-validator for request validation
- XSS prevention through input sanitization
- NoSQL injection prevention

### Security Headers

- Helmet.js for security headers
- CORS configuration
- Content Security Policy (CSP)
- HSTS enabled

### Rate Limiting

- General rate limiting (100 req/15min)
- Authentication rate limiting (5 req/15min)
- Role-based rate limits
- Upload rate limiting

### Additional Security

- IP filtering/blacklisting
- Suspicious activity detection
- Parameter pollution prevention
- Request logging and monitoring

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Push changes: `git push origin feature/new-feature`
6. Create Pull Request

### Code Style

- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Write unit tests for new features

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions:

- Create an issue in the repository
- Contact: admin@siwes.edu

## 🎯 Future Enhancements

- [ ] GraphQL API support
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app API endpoints
- [ ] Automated report generation
- [ ] Integration with external placement platforms
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Audit logging system
- [ ] Two-factor authentication

---

**Built with ❤️ for Institutional Industrial Training Management**
