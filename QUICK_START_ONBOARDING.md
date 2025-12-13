# Quick Start: Magic Link Onboarding

## 🚀 5-Minute Setup

### Prerequisites

- ✅ Backend running (`cd backend && npm run dev`)
- ✅ Frontend running (`cd client && npm run dev`)
- ✅ MongoDB running
- ✅ Admin account exists

### Step 1: Configure Email (Optional for Testing)

For development testing, **no configuration needed**! The system uses Ethereal Email automatically.

For production, add to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Step 2: Send Your First Invitation

#### As Admin:

1. Login to admin dashboard
2. Navigate to **Invitations** (in sidebar)
3. Click **Send Invitation**
4. Enter email: `test@example.com`
5. Select role: **Coordinator**
6. Click **Send Invitation**

#### Check the Console:

```bash
# Look for this in backend terminal:
[INFO] Invitation email sent to test@example.com
[INFO] Preview URL: https://ethereal.email/message/XXX
```

### Step 3: Complete Setup (As Invited User)

1. Copy the Preview URL from console (in development)
2. Open in browser - see the email
3. Click the **Complete Setup →** button
4. Fill out the form:
   - First Name: John
   - Last Name: Doe
   - Phone: +2348012345678
   - Password: SecurePass123
   - Confirm Password: SecurePass123
5. Click **Create Account**

### Step 4: Login with New Account

1. Go to `http://localhost:3000/login`
2. Email: `test@example.com`
3. Password: `SecurePass123`
4. Click Login
5. 🎉 Success! You're in the coordinator dashboard

## 📧 Testing Flow as Coordinator

Now test student invitation:

1. In coordinator dashboard, go to **Invitations**
2. Click **Send Invitation**
3. Enter email: `student@example.com`
4. Role is auto-set to **Student**
5. Click **Send Invitation**
6. Check backend console for preview URL
7. Complete setup with student-specific fields:
   - Matric Number: CSC/2024/001
   - Level: 400
   - Session: 2023/2024

## 🎯 What Just Happened?

1. **Invitation Created**

   - Secure token generated
   - Saved to database
   - Email sent with magic link

2. **User Clicked Link**

   - Token verified
   - Not expired, not used before
   - Redirected to setup page

3. **Setup Completed**

   - User profile created
   - Password hashed and saved
   - Invitation marked as "accepted"
   - Welcome email sent

4. **Login Successful**
   - User authenticated with new credentials
   - No default password needed
   - Full account access

## 📊 Check Your Work

### View Invitations

**Admin Dashboard**:

- Total invitations sent
- Pending count
- Accepted count
- Full list with status

**Coordinator Dashboard**:

- Only shows their invitations
- Student-focused interface

### Database Check

```javascript
// In MongoDB
db.invitations.find();
// See invitation records with status

db.users.find({ email: "test@example.com" });
// See created user account
```

### Logs Check

```bash
# Backend logs
tail -f backend/logs/combined.log

# Look for:
# - Invitation created
# - Email sent
# - Token verified
# - User account created
```

## 🔄 Resend an Invitation

1. Go to invitations page
2. Find pending invitation
3. Click **resend icon** (↻)
4. Wait 5 minutes before next resend
5. New email sent with same token

## ❌ Cancel an Invitation

1. Go to invitations page
2. Find pending invitation
3. Click **trash icon**
4. Invitation cancelled
5. Token no longer valid

## 🎨 Email Preview (Development)

In development mode, check terminal for:

```
Preview URL: https://ethereal.email/message/WaQKMgKddqTDoX8Y
```

Visit this URL to see exactly what the email looks like!

## 🚨 Common Issues

### "Invitation email sent but no preview URL"

- **Solution**: Check you're in development mode (`NODE_ENV=development`)

### "Token invalid or expired"

- **Solution**: Request a new invitation (tokens expire in 7 days)

### "Email not sending in production"

- **Solution**: Verify SMTP configuration in `.env`

### "User already exists"

- **Solution**: Check if account was created manually before

## 📱 Test on Mobile

The magic link works on mobile too!

1. Send invitation
2. Get preview URL
3. Copy magic link from email
4. Send to phone (SMS, WhatsApp, etc.)
5. Open on mobile browser
6. Complete setup on mobile
7. Mobile-responsive form!

## ✅ Checklist

- [x] Backend running
- [x] Frontend running
- [x] Sent admin invitation to coordinator
- [x] Verified magic link works
- [x] Completed setup form
- [x] Logged in with new account
- [x] Sent coordinator invitation to student
- [x] Tested resend feature
- [x] Tested cancel feature
- [x] Checked invitation statistics

## 🎓 Next Steps

1. **Configure Production Email**

   - Choose provider (SendGrid, Gmail, AWS SES)
   - Add credentials to `.env`
   - Test with real email address

2. **Customize Email Template**

   - Edit `backend/src/utils/emailService.js`
   - Update HTML/CSS
   - Add your branding

3. **Bulk Invitations** (Future Feature)
   - Upload CSV with emails
   - Batch send invitations
   - Track all in dashboard

## 📚 Full Documentation

- **Complete Guide**: `MAGIC_LINK_ONBOARDING.md`
- **Environment Setup**: `ENVIRONMENT_SETUP.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## 💡 Pro Tips

1. **Development Mode**: Always check terminal for email preview URLs
2. **Token Security**: Tokens are one-time use - sharing invalidates them
3. **Expiration**: 7-day window is generous - users have time to respond
4. **Statistics**: Track invitation conversion rates in dashboard
5. **Resend Limit**: 5-minute cooldown prevents spam

## 🎉 You're Ready!

The magic link onboarding system is now fully operational. Start inviting users and enjoy the modern, secure onboarding experience!

---

**Need Help?**

- Check logs: `backend/logs/combined.log`
- Review docs: `MAGIC_LINK_ONBOARDING.md`
- Test endpoints: Use Postman/Thunder Client with API examples
