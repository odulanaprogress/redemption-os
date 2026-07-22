# Redemption OS — Developer Documentation

> **Version:** 1.1.0  
> **Last Updated:** June 2026  
> **Stack:** React 18 + TypeScript + Vite + Firebase (redemption-os) + Cloudinary + Sentry  
> **Firebase Project:** `redemption-os` (https://redemption-os.firebaseapp.com)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Firebase Setup](#4-firebase-setup)
5. [Cloudinary Setup](#5-cloudinary-setup)
6. [State Management (Zustand)](#6-state-management-zustand)
7. [Services API Reference](#7-services-api-reference)
8. [Real-Time Patterns](#8-real-time-patterns)
9. [Authentication Flow](#9-authentication-flow)
10. [User Roles & Permissions](#10-user-roles--permissions)
11. [Demo Accounts (Live Firebase)](#11-demo-accounts-live-firebase)
12. [Media Upload Guide](#12-media-upload-guide)
13. [Routing](#13-routing)
14. [Firestore Collections](#14-firestore-collections)
15. [Feature: Messaging & Broadcasts](#15-feature-messaging--broadcasts)
16. [Feature: Marketplace](#16-feature-marketplace)
17. [Feature: QR Identity System](#17-feature-qr-identity-system)
18. [Feature: Incident Reporting](#18-feature-incident-reporting)
19. [Feature: Notifications](#19-feature-notifications)
20. [Seeding the Database](#20-seeding-the-database)
21. [Error Monitoring (Sentry)](#21-error-monitoring-sentry)
22. [Adding a New Feature — Checklist](#22-adding-a-new-feature--checklist)
23. [Known Limitations & Gotchas](#23-known-limitations--gotchas)

---

## 1. Architecture Overview

```
Browser
  ├── React 18 (Vite 6) Frontend
  │     ├── Zustand stores (client state)
  │     ├── React Router v7 (routing)
  │     ├── Pages & Components (with Mapbox maps)
  │     ├── useOfflineSync (IndexedDB local cache & sync queue)
  │     └── Services layer
  │           ├── Firebase Firestore & Auth (real-time DB & user auth)
  │           ├── Cloudinary (media upload & storage)
  │           └── Sentry (telemetry & error tracking)
  │
  ├── Service Worker (Workbox)
  │     ├── Static assets cache (Stale-While-Revalidate)
  │     └── API caching & Background Sync queue (NetworkFirst, JSON-only)
  │
  └── Node.js & Express Fallback Backend
        ├── Compression (gzip) & Cors middlewares
        ├── Delta sync engine (/api/sync)
        ├── USSD session webhook handler (/api/ussd)
        └── SMS dispatcher (Termii & Africa's Talking integrations)
```

### Key Design Decisions

- **No Redux** — Zustand handles all global state (lightweight, hook-based).
- **Live mode always on** — `VITE_USE_MOCK_DATA=false` in `.env`; the app connects directly to the live `redemption-os` Firebase project.
- **Cloudinary for Media** — Images and videos are stored on Cloudinary with unsigned upload presets.
- **OpenStreetMap & Esri Satellite Dual Engine** — Renders vector map tiles and high-resolution aerial satellite imagery of Redemption City (28 mapped locations) with turn-by-turn OSRM walking routes and real-time GPS tracking.
- **Geofenced Telemetry & Satellite Estimator** — Tracks live attendee GPS signals bounded strictly within Redemption City coordinates (`6.79°N–6.83°N, 3.44°E–3.47°E`) to compute real-time crowd density.
- **Offline-First Synchronization** — Leverages IndexedDB (`idb`) and Service Workers (`Workbox`) to cache static resources and core API responses. If an operator reports an incident while offline, it is queued and synchronized automatically on reconnection.
- **USSD & SMS Fallbacks** — Integrated with Termii and Africa's Talking to allow low-bandwidth SMS dispatch and offline feature access via standard USSD dial codes (`*384#`).
- **Sentry** — All frontend and backend runtime errors are reported to Sentry.

---

## 2. Project Structure

```
src/
├── app/
│   ├── components/          # Shared UI components
│   │   ├── ui/              # Shadcn/ui primitives (Button, Card, etc.)
│   │   ├── MarketplaceHome.tsx
│   │   ├── VendorDashboard.tsx
│   │   └── NotificationBell.tsx
│   ├── data/
│   │   └── marketplace.ts   # Marketplace product/vendor/order types
│   └── pages/               # One file per route/page
│       ├── login-page.tsx
│       ├── register-page.tsx
│       ├── dashboard.tsx
│       ├── admin-dashboard.tsx
│       ├── operations-center.tsx
│       ├── communication-center.tsx
│       ├── qr-identity-page.tsx
│       ├── settings-profile.tsx
│       ├── community-signal.tsx
│       ├── pre-registration-page.tsx
│       └── ...
├── config/
│   ├── firebase.config.ts   # Firebase init + isMockMode flag
│   ├── cloudinary.config.ts # Cloudinary env vars
│   ├── mock-data.ts         # Demo user definitions (used for seeding only)
│   └── sentry.config.ts     # Sentry init
├── hooks/
│   ├── useAuth.ts           # Auth listener + actions
│   └── useNotifications.ts  # Real-time notification listener
├── services/
│   ├── auth.service.ts
│   ├── cloudinary.service.ts
│   ├── family.service.ts
│   ├── incident.service.ts
│   ├── message.service.ts
│   ├── notification.service.ts
│   ├── order.service.ts
│   ├── qr.service.ts
│   ├── user.service.ts
│   └── vendor.service.ts
├── store/
│   ├── auth.store.ts
│   ├── session.store.ts
│   └── notification.store.ts
├── styles/
│   ├── index.css
│   └── theme.css
├── types/
│   └── index.ts             # All TypeScript interfaces
└── routes.tsx               # React Router route definitions

scripts/
├── seed-firebase.cjs        # One-time DB seeder (Admin SDK)
└── serviceAccountKey.json   # ← NOT committed to git
```

---

## 3. Environment Setup

The `.env` file at the project root (already configured for the live `redemption-os` project):

```env
# Firebase Configuration — Redemption OS Project
VITE_FIREBASE_API_KEY=AIzaSyDWKrczLJ31U2MeiFDiuzFZmxq-kKxUPEM
VITE_FIREBASE_AUTH_DOMAIN=redemption-os.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=redemption-os
VITE_FIREBASE_STORAGE_BUCKET=redemption-os.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=871961708944
VITE_FIREBASE_APP_ID=1:871961708944:web:cc54f1b98e6c021e828b15
VITE_FIREBASE_MEASUREMENT_ID=G-N26WMDSFB7
VITE_FIREBASE_MESSAGING_PRIVATE_KEY=_bSqkAw_27tasN8UDBuY5_MofozxaPSqiOz9ayEXmnA

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dlxnaefxk
VITE_CLOUDINARY_API_KEY=982543269676827
VITE_CLOUDINARY_API_SECRET=uVe-woYAAtxuyb6G_169a4lbDBE
VITE_CLOUDINARY_UPLOAD_PRESET=redemption_os

# Sentry Error Monitoring
VITE_SENTRY_DSN=https://13ebdee1d35758a2d157501a82c3553a@o4511622023544832.ingest.de.sentry.io/4511622086262864

# App Configuration
VITE_APP_NAME=Redemption OS
VITE_APP_VERSION=1.0.0

# Mock Data (always false in production)
VITE_USE_MOCK_DATA=false
```

> ⚠️ **Never commit `.env` or `scripts/serviceAccountKey.json` to Git.** Both are in `.gitignore`.

### Run locally

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # Production build → dist/
```

---

## 4. Firebase Setup

### Project Details

| Key | Value |
|-----|-------|
| **Project ID** | `redemption-os` |
| **Auth Domain** | `redemption-os.firebaseapp.com` |
| **Console URL** | https://console.firebase.google.com/project/redemption-os |

### Collections Required

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles + role assignments |
| `families` | Family member records |
| `qr_tags` | QR code records linked to family members |
| `incidents` | Community signal reports |
| `notifications` | Per-user notification records |
| `broadcasts` | Admin announcements |
| `messages` | Channel messages |
| `vendors` | Vendor profiles |
| `products` | Marketplace products |
| `orders` | Order records |

### Firestore Security Rules

See `firestore.rules` in the project root. Deploy with:

```bash
firebase deploy --only firestore:rules
```

### Auth Providers Enabled

- ✅ Email/Password

---

## 5. Cloudinary Setup

| Key | Value |
|-----|-------|
| **Cloud Name** | `dlxnaefxk` |
| **Upload Preset** | `redemption_os` (unsigned) |

### Folder Structure (auto-created on first upload)

```
redemption-os/
├── avatars/          # User profile photos
├── products/         # Marketplace product images
├── family-members/   # Child photos for QR identity
├── broadcasts/       # Media attachments in broadcasts
├── messages/         # Images/videos sent in channels
└── images/           # Generic images
```

---

## 6. State Management (Zustand)

### Auth Store (`src/store/auth.store.ts`)

```typescript
const { user, userProfile, isAuthenticated, isLoading } = useAuthStore();
```

### Notification Store (`src/store/notification.store.ts`)

```typescript
const { notifications, unreadCount, addNotification, markAsRead } = useNotificationStore();
```

### Session Store (`src/store/session.store.ts`)

```typescript
const { activeSessionId, activeSessionName, setSession, clearSession } = useSessionStore();
```

### Usage Pattern

Always use stores via the custom hooks, not directly:

```typescript
// ✅ Correct
const { user, login, logout } = useAuth();

// ❌ Avoid accessing store directly in components
const user = useAuthStore((s) => s.user);
```

---

## 7. Services API Reference

### CloudinaryService

```typescript
const result = await cloudinaryService.uploadImage(file, 'redemption-os/products');
if (result.success) {
  const imageUrl = result.data.secureUrl;
}

const result = await cloudinaryService.uploadVideo(file, 'redemption-os/messages');
const result = await cloudinaryService.uploadFile(file);
const thumbUrl = cloudinaryService.getThumbnailUrl(publicId, 150);
```

### MessageService

```typescript
// Subscribe to live broadcasts
const unsub = messageService.subscribeToBroadcasts((broadcasts) => setBroadcasts(broadcasts));
return () => unsub(); // Always clean up on unmount

// Create a broadcast (admin/security)
await messageService.createBroadcast({
  type: 'operational',
  title: 'Service Starting',
  message: 'Please find your seats.',
  zone: 'All Zones',
  createdBy: user.uid,
  createdByName: 'Admin',
});

// Subscribe to channel messages
const unsub = messageService.subscribeToChannel('general', (messages) => setMessages(messages));

// Send a message
await messageService.sendMessage({
  channelId: 'general',
  senderId: user.uid,
  senderName: 'John',
  type: 'image',
  text: 'Check this out!',
  mediaUrl: 'https://res.cloudinary.com/...',
  mediaType: 'image/jpeg',
});
```

### IncidentService

```typescript
await incidentService.createIncident({
  reportedBy: user.uid,
  type: 'medical',
  priority: 'high',
  status: 'reported',
  title: 'Medical Emergency',
  description: '...',
  location: { zone: 'Zone C', building: 'Main Hall' },
});

const incidents = await incidentService.getIncidents({
  reportedBy: user.uid,
  status: 'reported',
  type: 'medical',
});
```

### NotificationService

```typescript
await notificationService.createNotification(userId, {
  type: 'info',
  title: 'Order Confirmed',
  message: 'Your order has been accepted.',
});
```

---

## 8. Real-Time Patterns

Every real-time subscription follows this pattern:

```typescript
useEffect(() => {
  const unsubscribe = someService.subscribeToSomething((data) => {
    setState(data);
  });
  return () => unsubscribe(); // ← Always clean up
}, [/* dependencies */]);
```

### Active Real-Time Listeners

| Feature | Collection | Hook/Component |
|---------|-----------|---------------|
| Notifications | `notifications` | `useNotifications` |
| Broadcasts | `broadcasts` | `CommunicationCenter` |
| Messages | `messages` | `CommunicationCenter` |

---

## 9. Authentication Flow

```
User opens app
    ↓
App.tsx → useAuthInit() registers onAuthStateChanged listener
    ↓
Firebase emits auth state (live redemption-os project)
    ↓
If signed in → fetch UserProfile from Firestore
    ↓
If no profile → create default profile (role: 'attendee')
    ↓
Auth store updated → all components re-render
    ↓
Login page → redirectBasedOnRole() → route to correct dashboard
```

### Register new user

```typescript
const { register } = useAuth();
const result = await register(email, password, displayName, 'attendee');
```

### Login

```typescript
const { login } = useAuth();
const result = await login(email, password);
if (!result.success) toast.error(result.error?.message);
```

---

## 10. User Roles & Permissions

| Role | Route | Access |
|------|-------|--------|
| `admin` | `/admin` | Full access — all dashboards, create broadcasts, manage incidents, manage users |
| `security` | `/operations` | Operations center, incident management, create emergency broadcasts |
| `vendor` | `/marketplace/vendor` | Vendor dashboard, manage own products and orders |
| `delivery_personnel` | `/logistics` | Logistics and delivery tracking |
| `parent` | `/dashboard` | QR identity, family management, marketplace |
| `attendee` | `/dashboard` | Dashboard, marketplace, community signal, communication center (read) |
| `volunteer` | `/dashboard` | Basic dashboard + volunteer-specific features |

Role is set at registration and stored in Firestore `users` collection. It controls routing in `login-page.tsx → redirectBasedOnRole()`.

---

## 11. Demo Accounts (Live Firebase)

All accounts below are **permanently seeded** into the live `redemption-os` Firebase project.  
Run `node scripts/seed-firebase.cjs` again anytime to re-seed (idempotent — won't duplicate).

| Role | Email | Password |
|------|-------|----------|
| **Admin** | redemptionosadmin01@gmail.com | Redemptionos12@ |
| **Parent** | parent1@redemptionos.com | demo1234 |
| **Parent** | parent2@redemptionos.com | demo1234 |
| **Security** | security1@redemptionos.com | demo1234 |
| **Security** | security2@redemptionos.com | demo1234 |
| **Vendor** | vendor1@redemptionos.com | demo1234 |
| **Vendor** | vendor2@redemptionos.com | demo1234 |
| **Vendor** | vendor3@redemptionos.com | demo1234 |
| **Delivery** | delivery1@redemptionos.com | demo1234 |
| **Attendee** | attendee@redemptionos.com | demo1234 |

---

## 12. Media Upload Guide

### Image Upload in a Component

```tsx
const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploading(true);
  const result = await cloudinaryService.uploadImage(file, 'redemption-os/products');
  setUploading(false);
  if (result.success && result.data) {
    setImageUrl(result.data.secureUrl);
    toast.success('Uploaded!');
  } else {
    toast.error(result.error ?? 'Upload failed');
  }
};
```

### Optimized Image URLs

```typescript
const thumbUrl = cloudinaryService.getThumbnailUrl(publicId, 300);
const url = cloudinaryService.getOptimizedUrl(publicId, {
  width: 800, height: 600, crop: 'fill', quality: 80, format: 'webp',
});
```

---

## 13. Routing

Routes defined in `src/routes.tsx`. All protected routes require `isAuthenticated`.

| Path | Component | Access |
|------|-----------|--------|
| `/` | `LoginPage` | Public |
| `/register` | `RegistrationPage` | Public |
| `/dashboard` | `Dashboard` | Authenticated |
| `/marketplace` | `MarketplaceHome` | Authenticated |
| `/marketplace/vendor/:id` | `VendorPage` | Authenticated |
| `/marketplace/product/:id` | `ProductDetailPage` | Authenticated |
| `/communication` | `CommunicationCenter` | Authenticated |
| `/qr-identity` | `QRIdentityPage` | Authenticated |
| `/community-signal` | `CommunitySignal` | Authenticated |
| `/settings` | `SettingsProfile` | Authenticated |
| `/admin` | `AdminDashboard` | Admin only |
| `/operations` | `OperationsCenter` | Admin/Security |
| `/marketplace/vendor` | `VendorDashboard` | Vendor |
| `/logistics` | `LogisticsDashboard` | Delivery Personnel |

---

## 14. Firestore Collections

### `users`

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;       // Cloudinary avatar URL
  role: UserRole;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: { loginCount: number; lastLogin: Timestamp; };
  preferences: { notifications: boolean; emailAlerts: boolean; smsAlerts: boolean; language: string; theme: string; };
  emergencyContact?: { name: string; relationship: string; phoneNumber: string; };
}
```

### `broadcasts`

```typescript
{
  id: string;
  type: 'operational' | 'alert' | 'emergency' | 'info';
  title: string;
  message: string;
  zone: string;
  createdBy: string;
  createdByName: string;
  mediaUrl?: string;       // Cloudinary URL
  createdAt: Timestamp;
  pinned?: boolean;
}
```

### `messages`

```typescript
{
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'video' | 'file';
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Timestamp;
  deleted?: boolean;
}
```

---

## 15. Feature: Messaging & Broadcasts

- **Broadcasts** — one-way, admin/security → all users; stored in `broadcasts` collection
- **Channel Messages** — two-way; stored in `messages` by `channelId`
- Channels: `general`, `emergency`, `volunteers`, `logistics`, `zone-a`, `zone-b`
- Media support: text + image + video (via Cloudinary)
- Soft-delete sets `deleted: true` in Firestore

---

## 16. Feature: Marketplace

1. Vendor uploads product image → Cloudinary → `secureUrl` stored as `product.image`
2. Product saved to Firestore `products` collection via `vendorService`
3. `MarketplaceHome` reads products from Firestore in real-time

---

## 17. Feature: QR Identity System

1. Parent registers a child → optional photo upload
2. Photo → Cloudinary → `photoURL` stored with `FamilyMember` in Firestore
3. QR code generated + stored in `qr_tags` collection
4. Security staff scan QR → see child details (name, zone, allergies, emergency contact, photo)

---

## 18. Feature: Incident Reporting

Via **Community Signal** page.

1. User selects category (Medical, Sound, Traffic, etc.)
2. Sets severity level + description
3. Auto-detects location
4. Report saved to `incidents` Firestore collection
5. Admin/Security see it in Operations Center

---

## 19. Feature: Notifications

- `useNotifications` hook registers Firestore `onSnapshot` on `notifications` collection
- Filtered to `where('userId', '==', user.uid)`
- `NotificationBell` reads from Zustand `notificationStore`
- Badge auto-updates in real-time

---

## 20. Seeding the Database

The seeder script (`scripts/seed-firebase.cjs`) uses the Firebase Admin SDK to create all demo accounts directly in the live Firebase project. It is **idempotent** — safe to run multiple times.

### Requirements

1. Place your service account key at `scripts/serviceAccountKey.json`  
   *(Download from Firebase Console → Project Settings → Service accounts → Generate new private key)*

### Run

```bash
npm install firebase-admin --save-dev  # (already installed)
node scripts/seed-firebase.cjs
```

---

## 21. Error Monitoring (Sentry)

Sentry is initialized in `src/config/sentry.config.ts` and called from `src/main.tsx`.

- **DSN:** Configured via `VITE_SENTRY_DSN` in `.env`
- **Environment:** `production` in built app, `development` in dev mode
- All unhandled React errors and Promise rejections are captured automatically

---

## 22. Adding a New Feature — Checklist

1. **Types** → Add interfaces to `src/types/index.ts`
2. **Service** → Create `src/services/my-feature.service.ts` with Firestore logic
3. **Store (optional)** → Create `src/store/my-feature.store.ts` with Zustand
4. **Hook (optional)** → Create `src/hooks/useMyFeature.ts` with real-time listener
5. **Component/Page** → Create in `src/app/pages/` or `src/app/components/`
6. **Route** → Add to `src/routes.tsx`
7. **Dashboard tile (optional)** → Add shortcut card in `dashboard.tsx`

---

## 23. Known Limitations & Gotchas

| Issue | Notes |
|-------|-------|
| **Mock Mode** | Always set `VITE_USE_MOCK_DATA=false` in production. The app should always connect to the live Firebase project. |
| **Cloudinary unsigned uploads** | The upload preset must be set to "Unsigned" in the Cloudinary dashboard. Signed uploads require a backend proxy. |
| **Video size limits** | Cloudinary free tier has a 100MB file size limit. |
| **Firestore indexes** | Compound queries (e.g., `where + orderBy`) require composite indexes. Create them in the Firebase Console when you see index errors in the console. |
| **Real-time message backfill** | `subscribeToChannel` loads last 100 messages. Implement cursor-based pagination for older messages. |
| **serviceAccountKey.json** | Never commit this file. It is in `.gitignore`. Rotate the key from Firebase Console if it is ever exposed. |
| **Auth token expiry** | Firebase Auth tokens auto-refresh. If you see 401s on Firestore queries, the session may have expired — logout and log back in. |

---

## 24. Flutter Mobile App Build & Deployment

The cross-platform native mobile application is located in the `/flutter_app` directory.

### Structure
```
flutter_app/
├── lib/
│   ├── main.dart                 # Application entrypoint & Material3 theme
│   ├── models/
│   │   └── location_model.dart   # 28 Redemption City mapped locations
│   └── screens/
│       ├── home_screen.dart      # Bottom navigation & quick actions dashboard
│       ├── navigation_screen.dart# Satellite telemetry & location search
│       ├── messages_screen.dart  # Communication center & live broadcasts
│       └── qr_identity_screen.dart# Child safety QR badge generator & scanner
└── pubspec.yaml                  # Dependencies (Firebase, QR, FlutterBluePlus)
```

### Build Commands
```bash
cd flutter_app

# Fetch dependencies
flutter pub get

# Debug run on connected Android/iOS device
flutter run

# Build release APK for Android distribution
flutter build apk --release
```
Output APK location: `flutter_app/build/app/outputs/flutter-apk/app-release.apk`

