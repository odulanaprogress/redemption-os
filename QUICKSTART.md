# Quick Start Guide - Redemption OS

## Fastest Way to Get Started (Demo Mode)

**No configuration needed!** Just run:

```bash
pnpm install
pnpm dev
```

The app runs in **DEMO MODE** automatically when no credentials are configured.

## Demo Login Credentials

Use these accounts to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@redemptionos.com | demo1234 |
| **Parent** | parent1@redemptionos.com | demo1234 |
| **Security** | security1@redemptionos.com | demo1234 |
| **Vendor** | vendor1@redemptionos.com | demo1234 |
| **Delivery** | delivery1@redemptionos.com | demo1234 |
| **Attendee** | attendee@redemptionos.com | demo1234 |

## What Works in Demo Mode?

✅ All UI features and navigation
✅ Mock authentication
✅ Sample data for all modules
✅ QR code generation
✅ Shopping cart
✅ Notifications
✅ All dashboards

❌ No real Firebase sync
❌ No actual image uploads
❌ No AI features (requires OpenAI key)

## Upgrade to Live Mode

1. **Create .env file** (copy from .env.example)
2. **Add Firebase credentials** (get from Firebase Console)
3. **Add Cloudinary credentials** (optional, for image uploads)
4. **Add OpenAI API key** (optional, for AI assistant)
5. **Restart dev server**

### Firebase Setup (5 minutes)

1. Go to https://console.firebase.google.com
2. Create new project
3. Enable **Email/Password** in Authentication
4. Create **Firestore Database** (test mode)
5. Get config: Project Settings → Your apps → Web app
6. Copy values to `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

## Common Issues & Fixes

### Issue: "Stuck on loading after login"
**Fix**: The app automatically redirects based on your role. Wait 5 seconds or clear browser cache.

### Issue: "Can't access admin dashboard"
**Fix**: Make sure you logged in with `admin@redemptionos.com` or use the role-selection page to change your role.

### Issue: "Images not uploading"
**Fix**: Add Cloudinary credentials to `.env` or continue in demo mode (images won't persist).

### Issue: "AI assistant not working"
**Fix**: Add `VITE_OPENAI_API_KEY` to `.env` or skip AI features.

## Pages & Routes

| Path | Description | Access |
|------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Login page | Public |
| `/register` | Registration | Public |
| `/role-selection` | Choose role | Authenticated |
| `/dashboard` | Attendee dashboard | Authenticated |
| `/admin` | Admin dashboard | Admin only |
| `/marketplace` | Marketplace | Authenticated |
| `/qr-identity` | QR system | Parent/Admin |
| `/operations` | Operations center | Security/Admin |
| `/logistics` | Logistics | Delivery/Admin |

## Changing Your Role

After login, you can change roles:
1. Navigate to `/role-selection`
2. Click on any role card
3. You'll be redirected to the appropriate dashboard

## Next Steps

1. ✅ **Test demo mode** - Explore all features
2. ✅ **Set up Firebase** - For real data persistence
3. ✅ **Add Cloudinary** - For image uploads
4. ✅ **Add OpenAI** - For AI features
5. ✅ **Deploy** - Use Vercel, Netlify, or Firebase Hosting

## Need Help?

- Check `README.md` for detailed documentation
- Review `FIREBASE_SETUP.md` for Firebase guide
- See `IMPLEMENTATION.md` for technical details
- Check browser console for error messages

---

**Ready to go!** Start with demo mode and upgrade when needed.
