# Contact Form Testing Guide

## Quick Test Steps

### 1. Run Database Migration

```bash
cd backend
python run_contact_messages_migration.py
```

Expected output:
```
Running contact messages migration...
✅ Contact messages table created successfully!
✅ Verified: contact_messages table exists
```

### 2. Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 4. Test Public Pages

#### Test About Page
1. Open browser: http://localhost:3000/about
2. Verify page loads with:
   - Mission statement
   - Feature cards (AI Copilot, DSA Practice, etc.)
   - Statistics (2,500+ students, 95% success rate)
   - Values section
   - CTA buttons

#### Test Contact Page
1. Open browser: http://localhost:3000/contact
2. Verify page loads with:
   - Contact form
   - Contact information cards
   - FAQ section

#### Test Contact Form Submission
1. Fill out the form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+91 9876543210" (optional)
   - Subject: "Test Message"
   - Message: "This is a test message from the contact form."

2. Click "Send Message"

3. Expected result:
   - ✅ Success message appears: "Message Sent Successfully!"
   - ✅ Form clears automatically
   - ✅ Green success banner shows

4. Try submitting with missing fields:
   - Leave "Full Name" empty
   - Click "Send Message"
   - Expected: Red error message "Please enter your name"

### 5. Test Admin Panel

#### Login as Admin
1. Go to http://localhost:3000/auth
2. Login with admin credentials
3. Navigate to http://localhost:3000/admin/contact-messages

#### Verify Contact Messages Page
1. Check statistics cards show:
   - Total Messages: 1
   - New: 1
   - Read: 0
   - Archived: 0

2. Verify message appears in list:
   - Shows "Test User"
   - Shows "Test Message" subject
   - Shows email and phone
   - Has green "NEW" badge
   - Shows timestamp

3. Click on the message:
   - Detail view opens on right
   - Shows full message content
   - Shows contact information
   - Status auto-changes to "READ"

4. Test actions:
   - Click "Archive" - status changes to "ARCHIVED"
   - Click "Unarchive" - status changes back to "READ"
   - Click "Delete" - message removed from list

5. Test filtering:
   - Select "New Only" - shows only new messages
   - Select "Read Only" - shows only read messages
   - Select "Archived Only" - shows only archived messages
   - Select "All Messages" - shows all messages

### 6. Test Navigation

#### Header Links
1. Click "About" in navbar - navigates to /about
2. Click "Contact" in navbar - navigates to /contact
3. Test on mobile - hamburger menu shows both links

#### Footer Links
1. Scroll to footer
2. Verify "About" link in Company section
3. Verify "Contact Us" link in Support section

### 7. Test Backend API Directly (Optional)

#### Submit Contact Form
```bash
curl -X POST http://localhost:8000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "API Test User",
    "email": "apitest@example.com",
    "phone": "+91 1234567890",
    "subject": "API Test",
    "message": "Testing the API directly"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you soon.",
  "id": 2
}
```

#### Get All Messages (Admin)
```bash
# First, get admin token by logging in
TOKEN="your_admin_token_here"

curl -X GET http://localhost:8000/api/contact/admin/messages \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Statistics (Admin)
```bash
curl -X GET http://localhost:8000/api/contact/admin/messages/stats \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "total": 2,
  "new": 1,
  "read": 1,
  "archived": 0
}
```

#### Update Message Status (Admin)
```bash
curl -X PATCH http://localhost:8000/api/contact/admin/messages/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
```

#### Delete Message (Admin)
```bash
curl -X DELETE http://localhost:8000/api/contact/admin/messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues & Solutions

### Issue: Migration fails with "relation already exists"
**Solution:** Table already exists. You can skip migration or drop and recreate:
```sql
DROP TABLE IF EXISTS contact_messages CASCADE;
```
Then run migration again.

### Issue: 404 error when submitting form
**Solution:** Check backend is running on port 8000 and VITE_API_URL is set correctly in frontend/.env

### Issue: Admin page shows "Not authorized"
**Solution:** Ensure you're logged in as admin user. Check user.isAdmin is true.

### Issue: Email notifications not working
**Solution:** Email notifications are optional. Check backend logs for email errors. Configure SMTP settings in backend/app/core/email.py if needed.

### Issue: Form doesn't clear after submission
**Solution:** Check browser console for errors. Ensure success response is received from backend.

## Database Verification

Check if messages are being saved:

```sql
-- Connect to your database
psql -U your_user -d your_database

-- Check table exists
\dt contact_messages

-- View all messages
SELECT * FROM contact_messages;

-- Count by status
SELECT status, COUNT(*) FROM contact_messages GROUP BY status;
```

## Success Criteria

✅ About page loads and displays correctly
✅ Contact page loads and displays correctly
✅ Contact form submits successfully
✅ Success message appears after submission
✅ Form clears after submission
✅ Validation works for required fields
✅ Message saved to database
✅ Admin can view messages
✅ Admin can filter by status
✅ Admin can mark as read/archived
✅ Admin can delete messages
✅ Statistics update correctly
✅ Navigation links work in header
✅ Navigation links work in footer
✅ Mobile responsive design works
✅ Email notification sent (optional)

## Performance Checks

- Page load time < 2 seconds
- Form submission < 1 second
- Admin page load < 2 seconds
- No console errors
- No network errors
- Smooth animations and transitions

## Security Checks

✅ Public endpoints don't require authentication
✅ Admin endpoints require authentication
✅ Admin endpoints check isAdmin flag
✅ Input validation on backend
✅ SQL injection protection (using SQLAlchemy ORM)
✅ XSS protection (React escapes by default)
✅ CSRF protection (if enabled)

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Accessibility Checks

- ✅ Form labels properly associated
- ✅ Required fields marked with asterisk
- ✅ Error messages are clear
- ✅ Success messages are clear
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG standards

## Final Checklist

Before marking as complete:

- [ ] Database migration run successfully
- [ ] Backend server running without errors
- [ ] Frontend server running without errors
- [ ] About page accessible and working
- [ ] Contact page accessible and working
- [ ] Contact form submits successfully
- [ ] Admin can view and manage messages
- [ ] Navigation links work correctly
- [ ] Mobile responsive design verified
- [ ] No console errors
- [ ] No network errors
- [ ] Code committed and pushed to Git
- [ ] Documentation updated

## Support

If you encounter any issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all dependencies installed
5. Check environment variables are set correctly

## Next Steps After Testing

Once testing is complete:
1. Deploy to production
2. Configure production email settings
3. Update admin email address
4. Set up monitoring for contact form submissions
5. Create email templates for auto-replies
6. Add analytics tracking
