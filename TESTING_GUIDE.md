# Redemption OS - Testing Guide

## Quick Test Scenarios

### Scenario 1: New User Registration (Demo Mode)

**Steps:**
1. Start the app: `pnpm dev`
2. Navigate to registration page
3. Fill in the form:
   ```
   Name: Test User
   Email: test@example.com
   Phone: +1234567890
   Password: test1234
   Confirm Password: test1234
   ```
4. Click "Create Account"

**Expected Results:**
- ✅ Console shows: `[AUTH] 🚀 Starting registration`
- ✅ Console shows: `[AUTH] ✅ Mock registration successful`
- ✅ Console shows: `[useAuth] ✅ Profile loaded | Role: attendee`
- ✅ Redirected to `/dashboard`
- ✅ Dashboard shows your name in header

**If it fails:**
- Check console for red error messages
- Verify you see emoji logs (🚀, ✅, ❌)
- Clear browser cache and try again

---

### Scenario 2: Admin Login (Demo Mode)

**Steps:**
1. Navigate to login page
2. Use demo credentials:
   ```
   Email: admin@redemptionos.com
   Password: demo1234
   ```
3. Click "Sign In"

**Expected Results:**
- ✅ Console shows: `[AUTH] 🔐 Login attempt for: admin@redemptionos.com`
- ✅ Console shows: `[AUTH] ✅ Mock login successful`
- ✅ Console shows: `[LOGIN] 🧭 Redirecting based on role: admin`
- ✅ Console shows: `[LOGIN] ➡️ Redirecting to /admin`
- ✅ Redirected to `/admin` dashboard
- ✅ Admin dashboard loads with charts and widgets

**Common Issues:**
- **Stuck on loading:** Wait 8 seconds for timeout, check console
- **Wrong dashboard:** Check role in console logs
- **Access denied:** Clear cache, try again

---

### Scenario 3: Role-Based Access Control

**Steps:**
1. Login as Attendee: `attendee@redemptionos.com / demo1234`
2. Try to access `/admin` manually in URL bar
3. Observe the Access Denied screen

**Expected Results:**
- ✅ Console shows: `[ProtectedRoute] 🚫 Access denied`
- ✅ See beautiful "Access Denied" screen
- ✅ Shows "Required Role(s): admin"
- ✅ Shows "Your Current Role: attendee"
- ✅ "Go Back" and "Dashboard" buttons work

---

### Scenario 4: Offline Detection

**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Click "Offline" checkbox
4. Observe the banner

**Expected Results:**
- ✅ Orange banner appears at top
- ✅ Shows "⚠️ No internet connection"
- ✅ Shows "Some features may be unavailable"
- ✅ "Retry" button appears
- ✅ When back online, green banner shows briefly

---

### Scenario 5: Role Selection & Update

**Steps:**
1. Register new account or login
2. Navigate to `/role-selection`
3. Click on "Admin" card
4. Wait for update

**Expected Results:**
- ✅ Role card shows loading state
- ✅ Console shows: `[UserService] 📝 Creating user profile`
- ✅ Toast shows "Role updated successfully!"
- ✅ Redirected to appropriate dashboard
- ✅ Can now access admin-only pages

---

## All Demo Accounts

Test different roles by logging in with these accounts:

| Role | Email | Password | Expected Redirect |
|------|-------|----------|-------------------|
| Admin | admin@redemptionos.com | demo1234 | /admin |
| Parent | parent1@redemptionos.com | demo1234 | /dashboard |
| Security | security1@redemptionos.com | demo1234 | /operations |
| Vendor | vendor1@redemptionos.com | demo1234 | /marketplace/vendor |
| Delivery | delivery1@redemptionos.com | demo1234 | /logistics |
| Attendee | attendee@redemptionos.com | demo1234 | /dashboard |

---

## Console Log Verification

### Healthy Application Logs

When everything is working, you should see:

**On App Start:**
```
[APP] 🚀 Redemption OS initializing...
[useAuth] 🎯 Initializing auth state listener
```

**On Login:**
```
[AUTH] 🔐 Login attempt for: email@example.com
[AUTH] ✅ Mock login successful | UID: user-123
[useAuth] 🔔 Auth state changed: User: user-123
[useAuth] 📖 Loading user profile from Firestore...
[useAuth] ✅ Profile loaded | Role: admin
[LOGIN] 🧭 Redirecting based on role: admin
[LOGIN] ➡️  Redirecting to /admin
[ProtectedRoute] 🛡️ Checking access
[ProtectedRoute] ✅ Access granted
```

**On Registration:**
```
[AUTH] 🚀 Starting registration for: email@example.com | Role: attendee
[AUTH] 🎭 Running in DEMO MODE
[AUTH] ✅ Mock registration successful | UID: user-456
[useAuth] ✅ Profile loaded | Role: attendee
```

### Error Logs to Watch For

**❌ BAD - Profile Not Found:**
```
[useAuth] ⚠️ Profile not found, creating default...
```
*Should auto-fix, but check if it persists*

**❌ BAD - Login Failed:**
```
[AUTH] ❌ Login error: auth/invalid-credential
```
*Check credentials, verify mock mode is active*

**❌ BAD - Access Denied:**
```
[ProtectedRoute] 🚫 Access denied - insufficient permissions
```
*Expected if trying to access restricted page*

---

## Browser DevTools Checklist

### Console Tab
- [ ] No red errors on page load
- [ ] Emoji logs visible (🚀, ✅, etc.)
- [ ] Auth state changes logged
- [ ] Navigation logged

### Network Tab
- [ ] No failed requests (if in demo mode)
- [ ] Firebase requests (if in live mode)
- [ ] Cloudinary requests (if uploading images)

### Application Tab
- [ ] localStorage has `redemption_mock_session` (demo mode)
- [ ] localStorage has `auth-storage` (Zustand persist)

---

## Feature-Specific Tests

### QR Identity System
1. Login as Parent
2. Navigate to `/qr-identity`
3. Click "Register Child"
4. Fill form and upload photo
5. Click "Generate QR"
6. Verify QR code appears

### Marketplace
1. Login as any user
2. Navigate to `/marketplace`
3. Browse products
4. Add to cart
5. View cart (top right)
6. Proceed to checkout

### Notifications
1. Login as any user
2. Check bell icon in header
3. Should show unread count badge
4. Click bell to see notifications
5. Mark as read
6. Badge should update

### AI Assistant
1. Navigate to `/ai-assistant`
2. Type a question
3. If OpenAI key configured: See response
4. If no key: See fallback message

---

## Common Issues & Fixes

### Issue: "Stuck on loading screen after login"
**Fix:**
1. Wait 8 seconds (timeout)
2. Check console for errors
3. Verify role in logs
4. Clear browser cache
5. Hard refresh (Ctrl+Shift+R)

### Issue: "Can't access admin dashboard"
**Fix:**
1. Check your role in console logs
2. Navigate to `/role-selection`
3. Click "Admin" to update role
4. Try accessing `/admin` again

### Issue: "Page keeps redirecting"
**Fix:**
1. Clear localStorage
2. Logout completely
3. Login again
4. Check console for redirect loops

### Issue: "No logs in console"
**Fix:**
1. Open DevTools console
2. Refresh page
3. Verify console level is "All Levels"
4. Check you're not in production mode

### Issue: "Infinite spinner on protected route"
**Fix:**
1. Wait for 8-second timeout
2. Should redirect to login
3. Login again
4. Report if persists

---

## Performance Benchmarks

### Target Metrics
- Page load: < 3 seconds
- Login: < 2 seconds (demo mode)
- Navigation: < 500ms
- Dashboard render: < 1 second

### How to Measure
1. Open DevTools → Performance tab
2. Record page load
3. Check main thread time
4. Look for layout shifts

---

## Debugging Tips

### Enable Verbose Logging
All logs are already enabled. Just open console!

### Track State Changes
- Zustand DevTools (if installed)
- React DevTools
- Console logs show all state changes

### Network Debugging
- DevTools → Network tab
- Filter by "XHR" to see API calls
- Check response codes
- Inspect payloads

### Component Debugging
- React DevTools
- Check component props
- Verify state values
- Track re-renders

---

## Automated Testing (Future)

### Recommended Tools
- Vitest (unit tests)
- Playwright (e2e tests)
- React Testing Library (component tests)

### Priority Test Cases
1. Auth flow (register, login, logout)
2. Protected routes
3. Role-based access
4. Form submissions
5. Navigation

---

## Production Testing

Before deploying to production:

### Checklist
- [ ] All console errors fixed
- [ ] All features tested manually
- [ ] All roles tested
- [ ] Offline mode works
- [ ] Error screens tested
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Firebase credentials configured
- [ ] Environment variables set
- [ ] Build succeeds (`pnpm build`)

---

## Getting Help

### Debug Information to Collect
1. Browser console logs (copy all)
2. Network tab screenshot
3. Steps to reproduce
4. Expected vs actual behavior
5. Environment (dev/prod, demo/live mode)

### Where to Report
- Check `AUDIT_FIXES_SUMMARY.md` for known issues
- Review `QUICKSTART.md` for setup issues
- See `README.md` for general documentation

---

**Happy Testing! 🎉**

The app is stable and ready for your hackathon demo. Most critical bugs are fixed!
