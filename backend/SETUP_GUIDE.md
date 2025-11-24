# Quick Setup Guide

This guide will help you get the SIWES Management System backend up and running in minutes.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version

# Check MongoDB (should be running)
mongod --version
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages listed in `package.json`.

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update these critical values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/siwes_management

# Security (IMPORTANT: Change in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email (Optional - for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Start MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB with Docker**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: MongoDB Atlas** (Cloud)

- Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Seed Database (Optional but Recommended)

```bash
npm run seed
```

This creates sample data including:

- 1 Admin user
- 1 Coordinator
- 2 Students
- 1 Departmental Supervisor
- 2 Faculties
- 2 Departments

**Default Login Credentials:**

- **Admin**: `admin@siwes.edu` / `Admin@123`
- **Coordinator**: `coordinator.csc@siwes.edu` / `Coord@123`
- **Student**: `student1@siwes.edu` / `Student@123`

### 5. Start the Server

**Development Mode** (with auto-reload):

```bash
npm run dev
```

**Production Mode**:

```bash
npm start
```

You should see:

```
╔════════════════════════════════════════════════════════════╗
║  SIWES Management System API Server                       ║
╠════════════════════════════════════════════════════════════╣
║  Environment: development                                  ║
║  Port:        5000                                         ║
║  API Version: v1                                           ║
║  URL:         http://localhost:5000/api/v1                ║
╚════════════════════════════════════════════════════════════╝
```

### 6. Test the API

**Option A: Browser**
Visit: http://localhost:5000/api/v1/health

**Option B: cURL**

```bash
curl http://localhost:5000/api/v1/health
```

**Option C: Postman**
Import the API collection and test endpoints.

### 7. Login Test

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@siwes.edu",
    "password": "Admin@123"
  }'
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data/db
```

### Issue: Port 5000 Already in Use

**Solution:**

```bash
# Change port in .env
PORT=3000

# Or kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### Issue: JWT Secret Warning

**Solution:**
Update `.env` with a strong secret:

```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output to JWT_SECRET in .env
```

### Issue: Email Notifications Not Working

**Solution:**
Email is optional. To enable:

1. Use Gmail App Password (not regular password)
2. Update EMAIL_USER and EMAIL_PASSWORD in `.env`
3. Enable "Less secure app access" in Gmail settings

## Development Workflow

### 1. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode (auto-run on file changes)
npm run test:watch
```

### 2. Code Linting

```bash
npm run lint
```

### 3. Check Logs

```bash
# View logs in real-time
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

## Next Steps

1. **Explore API Documentation**: Check `API_REFERENCE.md`
2. **Test Endpoints**: Use Postman or cURL
3. **Create Users**: Login as admin and create test users
4. **Customize**: Modify models, routes, and business logic as needed

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET` (64+ characters)
- [ ] Configure production MongoDB (MongoDB Atlas recommended)
- [ ] Set up email service (Gmail, SendGrid, etc.)
- [ ] Configure CORS for your frontend domain
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Enable logging to external service (Loggly, Papertrail)

## Getting Help

- **Issues**: Check existing issues in repository
- **Documentation**: See README.md and API_REFERENCE.md
- **Logs**: Check `logs/app.log` for errors
- **Email**: Contact support team

## Project Structure Overview

```
backend/
├── src/
│   ├── config/         # Configuration & database
│   ├── models/         # MongoDB schemas (9 models)
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API route definitions
│   ├── middleware/     # Auth, validation, errors
│   ├── utils/          # Helpers, constants, validators
│   ├── scripts/        # Seeding and utility scripts
│   └── tests/          # Unit and integration tests
├── logs/               # Application logs
├── uploads/            # File uploads
├── .env                # Environment variables
├── package.json        # Dependencies
└── README.md           # Full documentation
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database
npm run seed

# Lint code
npm run lint
```

## Success! 🎉

Your SIWES Management System backend is now running!

Access the API at: **http://localhost:5000/api/v1**

---

For detailed API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)
For full project details, see [README.md](./README.md)
