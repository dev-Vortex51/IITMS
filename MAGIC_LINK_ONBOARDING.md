# Magic Link Onboarding System

## Overview

The SIWES Management System now uses a modern **Magic Link + First-Time Setup Flow** for user onboarding. This replaces the old manual account creation with default passwords.

## Features

### 1. Role-Based Invitation Permissions

- **Admin** can invite:
  - Coordinators
  - Academic Supervisors
  - Faculty members
- **Coordinator** can invite:
  - Students (automatically assigned to their department)
  - Industrial Supervisors

### 2. Secure Magic Link System

- One-time use tokens
- 7-day expiration period
- Resend capability (with 5-minute cooldown)
- Token verification before account creation

### 3. First-Time Setup Flow

Users complete their profile on first visit:

- Set password (no default passwords)
- Provide full name
- Add contact information
- Role-specific fields (matric number for students, etc.)

## Architecture

### Backend Components

#### Models

**`Invitation` Model** (`backend/src/models/Invitation.js`)

```javascript
{
  email: String,
  role: String (enum),
  token: String (unique, secure),
  expiresAt: Date,
  invitedBy: ObjectId (ref: User),
  invitedByRole: String,
  status: "pending" | "accepted" | "expired" | "cancelled",
  metadata: {
    department: ObjectId,
    // Additional role-specific data
  },
  resendCount: Number,
  lastResentAt: Date
}
```

#### Services

**`invitationService`** (`backend/src/services/invitationService.js`)

- `createInvitation()` - Create and send invitation
- `verifyToken()` - Validate invitation token
- `completeSetup()` - Create user account from invitation
- `resendInvitation()` - Resend magic link
- `cancelInvitation()` - Cancel pending invitation
- `getStatistics()` - Get invitation metrics

**Email Service** (`backend/src/utils/emailService.js`)

- `sendInvitation()` - Send magic link email
- `resendInvitation()` - Resend magic link
- `sendWelcome()` - Send welcome email after setup

#### Routes

**`/api/v1/invitations`** (Protected & Public)

- `POST /` - Create invitation (Admin/Coordinator)
- `GET /` - List invitations (Admin/Coordinator)
- `GET /:id` - Get invitation details
- `GET /verify/:token` - Verify token (Public)
- `POST /complete-setup` - Complete setup (Public)
- `POST /:id/resend` - Resend invitation
- `DELETE /:id` - Cancel invitation
- `GET /stats` - Get statistics

### Frontend Components

#### Admin Pages

**`/admin/invitations`** - Manage all invitations

- Send invitations to Coordinators/Academic Supervisors
- View invitation status
- Resend or cancel invitations
- Statistics dashboard

#### Coordinator Pages

**`/coordinator/invitations`** - Manage student invitations

- Send invitations to Students
- View sent invitations
- Resend or cancel invitations

#### Public Pages

**`/invite/verify?token=XXX`** - Verify magic link

- Validates invitation token
- Redirects to setup page

**`/invite/setup?token=XXX`** - Complete account setup

- First-time user registration
- Role-specific form fields
- Password creation
- Account activation

## Usage Guide

### For Administrators

#### Inviting a Coordinator

1. Navigate to **Admin Dashboard → Invitations**
2. Click **Send Invitation**
3. Enter email and select role (Coordinator)
4. Submit - magic link sent to email
5. Track invitation status in table

#### Inviting an Academic Supervisor

1. Navigate to **Admin Dashboard → Invitations**
2. Click **Send Invitation**
3. Enter email and select role (Academic Supervisor)
4. Submit - magic link sent to email

### For Coordinators

#### Inviting a Student

1. Navigate to **Coordinator Dashboard → Invitations**
2. Click **Send Invitation**
3. Enter student email
4. Submit - magic link sent to email
5. Student automatically assigned to your department

### For Invited Users

#### Completing Setup

1. Check email for invitation from SIWES Management
2. Click the magic link (or copy/paste URL)
3. Verify invitation (automatic)
4. Fill out setup form:
   - First name & Last name
   - Phone number (optional)
   - Role-specific fields:
     - **Students**: Matric number, Level, Session
     - **Supervisors**: Specialization
   - Create password (min 8 characters)
5. Submit to create account
6. Redirected to login page

## Security Features

### Token Security

- Cryptographically secure tokens (32-byte hex)
- One-time use only
- Automatic expiration after 7 days
- Verified before any action

### Permission Checks

- RBAC validation on invitation creation
- Department scoping for coordinators
- Token ownership verification

### Email Validation

- Check for existing accounts
- Prevent duplicate invitations
- Validate email format

## Email Templates

### Invitation Email

- Professional design with gradient header
- Clear call-to-action button
- Magic link (clickable + copyable)
- Security notice
- Expiration information

### Welcome Email

- Sent after account creation
- Login link included
- Support contact information

## Environment Variables

### Backend (`.env`)

```env
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM="SIWES Management" <noreply@siwes.edu>

# Frontend URL (for magic links)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Database Collections

### Invitations Collection

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  role: "student",
  token: "abc123...",
  expiresAt: ISODate,
  invitedBy: ObjectId,
  invitedByRole: "coordinator",
  status: "pending",
  metadata: {
    department: ObjectId
  },
  resendCount: 0,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## API Examples

### Create Invitation

```javascript
POST /api/v1/invitations
Authorization: Bearer {token}

{
  "email": "student@example.com",
  "role": "student"
}

Response:
{
  "success": true,
  "message": "Invitation created successfully. Magic link sent to email.",
  "data": {
    "_id": "...",
    "email": "student@example.com",
    "role": "student",
    "status": "pending",
    "expiresAt": "2025-12-17T..."
  }
}
```

### Verify Token

```javascript
GET /api/v1/invitations/verify/{token}

Response:
{
  "success": true,
  "message": "Invitation verified successfully",
  "data": {
    "email": "student@example.com",
    "role": "student",
    "token": "...",
    "expiresAt": "..."
  }
}
```

### Complete Setup

```javascript
POST /api/v1/invitations/complete-setup

{
  "token": "abc123...",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123",
  "phone": "+2348012345678",
  "matricNumber": "CSC/2020/001",
  "level": 400,
  "session": "2023/2024"
}

Response:
{
  "success": true,
  "message": "Account created successfully. You can now login.",
  "data": {
    "_id": "...",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

## Testing

### Development Email Testing

In development, the system uses Ethereal Email for testing:

- All emails are captured (not sent to real addresses)
- Preview URLs logged in console
- Check terminal output for preview links

### Manual Testing Checklist

- [ ] Admin can create coordinator invitation
- [ ] Admin can create academic supervisor invitation
- [ ] Coordinator can create student invitation
- [ ] Magic link verification works
- [ ] Setup form validation works
- [ ] Account created successfully
- [ ] Invitation marked as accepted
- [ ] User can login with new credentials
- [ ] Resend functionality works
- [ ] Cancel functionality works
- [ ] Expired invitations handled correctly

## Migration from Old System

The new system **coexists** with the old system:

- Existing users continue working normally
- Existing login flow unchanged
- New users use magic link flow
- Old manual creation methods still available as fallback

No breaking changes to existing codebase.

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify SMTP configuration
3. Check server logs for email errors
4. Use resend feature (wait 5 minutes between resends)

### Token Expired

1. Request new invitation from admin/coordinator
2. Previous tokens automatically invalidated

### Account Already Exists

1. User may have been created manually
2. Try logging in with email
3. Use password reset if needed

## Support

For issues or questions:

- Email: support@siwes.edu
- Check logs: `backend/logs/combined.log`
- Review invitation status in dashboard

## Future Enhancements

Potential improvements:

- [ ] Bulk invitation upload (CSV)
- [ ] Customizable email templates
- [ ] SMS notifications
- [ ] Invitation scheduling
- [ ] Analytics dashboard
- [ ] Webhook notifications
- [ ] Multi-language support
