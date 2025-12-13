# Environment Setup for Magic Link Onboarding

## Required Environment Variables

### Backend Environment (`.env`)

Add these new variables to your `backend/.env` file:

```env
# Email Configuration (Required for Magic Links)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="SIWES Management" <noreply@siwes.edu>

# Frontend URL (for generating magic links)
FRONTEND_URL=http://localhost:3000

# Existing variables (keep these)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siwes_management
JWT_SECRET=your-secret-key
DEFAULT_PASSWORD=Change@123
```

### SMTP Configuration Options

#### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate from Google Account settings
```

#### Outlook/Office365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Frontend Environment (`.env.local`)

No changes required. Existing configuration works:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Installation Steps

### 1. Install Required Dependencies

The email service uses `nodemailer`. Install it:

```bash
cd backend
npm install nodemailer
```

### 2. Update Environment Files

Copy the template and fill in your values:

```bash
# Backend
cp .env.example .env
# Edit .env and add SMTP configuration
```

### 3. Database Migration

The Invitation collection will be created automatically on first use. No migration needed.

### 4. Verify Setup

Start the backend server:

```bash
cd backend
npm run dev
```

Check the logs for:

```
Email service initialized with test account
```

Or if using production SMTP:

```
Email service initialized
```

## Development vs Production

### Development Mode

- Uses Ethereal Email (test account)
- No real emails sent
- Preview URLs in console logs
- Perfect for testing

### Production Mode

Set `NODE_ENV=production` and configure real SMTP:

```env
NODE_ENV=production
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Testing Email Configuration

### Quick Test

Create a test route in `backend/src/app.js`:

```javascript
app.get("/test-email", async (req, res) => {
  const emailService = require("./utils/emailService");

  try {
    const result = await emailService.sendInvitation({
      email: "test@example.com",
      role: "student",
      token: "test-token-123",
      invitedBy: {
        firstName: "Test",
        lastName: "Admin",
      },
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

Visit: `http://localhost:5000/test-email`

### Check Email Logs

Emails are logged to:

```
backend/logs/combined.log
```

Look for lines like:

```
[INFO] Invitation email sent to test@example.com
[INFO] Preview URL: https://ethereal.email/message/...
```

## Troubleshooting

### Gmail App Passwords

If using Gmail, you need an App Password:

1. Go to Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App passwords
4. Generate new app password for "Mail"
5. Use that password in `SMTP_PASS`

### Common Issues

**"Invalid login" error:**

- Check username/password
- Enable "Less secure app access" (Gmail)
- Use app-specific password

**"Connection timeout:**

- Check firewall settings
- Verify SMTP_HOST and SMTP_PORT
- Try different SMTP_PORT (465, 587, 25)

**No emails in development:**

- Check console for Ethereal preview URLs
- Emails not sent to real addresses in dev mode

## Production Deployment

### Recommended Email Services

1. **SendGrid** (Recommended)

   - Free tier: 100 emails/day
   - Easy setup
   - Reliable delivery

2. **AWS SES**

   - Very cheap
   - Requires verification
   - Great for scale

3. **Mailgun**
   - Free tier: 5,000 emails/month
   - Simple API
   - Good documentation

### Security Best Practices

1. **Never commit `.env` files**

   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables in production**

   - Set via hosting platform (Heroku, Vercel, etc.)
   - Don't hardcode credentials

3. **Rotate SMTP passwords regularly**

4. **Monitor email sending**
   - Set up alerts for failures
   - Track delivery rates

## Verification Checklist

- [ ] `.env` file created with SMTP config
- [ ] `nodemailer` package installed
- [ ] Backend server starts without errors
- [ ] Email service initialized (check logs)
- [ ] Test email sent successfully
- [ ] Preview URL accessible (development)
- [ ] Magic link format correct
- [ ] Frontend URL correct in emails

## Next Steps

After environment setup:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Navigate to admin/coordinator dashboard
4. Test sending an invitation
5. Check email (or preview URL in dev)
6. Click magic link
7. Complete setup form

## Support

If you encounter issues:

- Check `backend/logs/error.log`
- Verify all environment variables set
- Test SMTP credentials separately
- Review email service configuration
