# Redemption OS - Intelligent Real-Time Coordination Platform

A comprehensive intelligent real-time coordination platform for large religious environments that combines worship accessibility, AI assistance, emergency response, smart logistics, and live communication infrastructure.

## Features

### Core Modules

- **AI Assistant** - Intelligent chatbot for worship assistance
- **Live Gospel Feed** - Real-time sermon transcription and sharing
- **Community Signal** - Incident reporting and feedback system
- **Smart Navigation** - Crowd-aware routing and wayfinding
- **Emergency Response** - SOS system with real-time tracking
- **Communication Center** - Live announcements and messaging
- **Smart Logistics** - Resource tracking and management
- **Verified Smart Marketplace** - Internal marketplace with vendor management
- **QR Identity System** - Child safety and family management
- **Operations Center** - Security and operations dashboard
- **Admin Dashboard** - Comprehensive system administration

### Technical Features

- ✅ Firebase Authentication with role-based access control
- ✅ Firestore Database with security rules and indexes
- ✅ Cloudinary image upload and optimization
- ✅ QR code generation and scanning
- ✅ Real-time notifications
- ✅ Offline mode support
- ✅ Shopping cart system
- ✅ Delivery tracking
- ✅ Error handling and retry logic
- ✅ Protected routes
- ✅ Responsive design
- ✅ Dark theme by default
- ✅ Smooth animations with Framer Motion

## Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Styling
- **Vite 6** - Build tool
- **Motion (Framer Motion)** - Animations

### Backend
- **Firebase Authentication** - User auth
- **Firestore Database** - NoSQL database
- **Cloudinary** - Image hosting

### State Management
- **Zustand** - Global state
- **React Context** - Local state

### UI Components
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Firebase account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd redemption-os
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - Firebase credentials (from Firebase Console)
   - Cloudinary credentials (from Cloudinary Dashboard)

4. **Set up Firebase**
   
   Follow the detailed guide in `FIREBASE_SETUP.md`:
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Deploy security rules and indexes
   - Get Firebase config

5. **Set up Cloudinary**
   - Create account at [cloudinary.com](https://cloudinary.com)
   - Create unsigned upload preset named "redemption-os"
   - Add credentials to `.env`

6. **Start development server**
   ```bash
   pnpm dev
   ```

7. **Open in browser**
   - Navigate to the local development URL shown in terminal
   - Default route: `/` (Landing page)

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── components/        # UI components
│   ├── pages/            # Page components
│   ├── context/          # React contexts
│   ├── routes.tsx        # Route definitions
│   └── App.tsx           # App entry point
├── components/           # Shared components
│   ├── ErrorBoundary.tsx
│   └── ProtectedRoute.tsx
├── config/              # Configuration
│   ├── firebase.config.ts
│   └── cloudinary.config.ts
├── features/            # Feature modules
│   └── qr-identity/     # QR system
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   └── useNotifications.ts
├── services/            # Backend services
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── family.service.ts
│   ├── qr.service.ts
│   ├── incident.service.ts
│   ├── vendor.service.ts
│   ├── order.service.ts
│   ├── notification.service.ts
│   ├── cloudinary.service.ts
│   └── index.ts
├── store/               # State management
│   ├── auth.store.ts
│   ├── notification.store.ts
│   ├── marketplace.store.ts
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
└── utils/               # Utilities
    └── error-handler.ts
```

## User Roles

- **Admin** - Full system access, user management, vendor approval
- **Attendee** - Regular user access to all features
- **Parent** - Family management and QR identity system
- **Volunteer** - Volunteer-specific features
- **Security** - Operations center and incident management
- **Vendor** - Marketplace vendor dashboard
- **Delivery Personnel** - Delivery tracking and logistics

## Key Features Explained

### Authentication & Authorization

- Email/password authentication via Firebase
- Role-based access control with protected routes
- Automatic role-based redirection after login
- User profile management
- Password reset functionality

### QR Identity System

- Register family members (children)
- Generate unique QR codes
- Store emergency contact information
- Medical information (allergies, notes)
- Zone assignment for safety
- Print QR tags
- Scan QR codes to retrieve information

### Marketplace

- Product catalog with search and filters
- Vendor registration and approval workflow
- Shopping cart with persistent state
- Order management
- Delivery tracking with live updates
- Admin controls for vendor approval
- AI-powered product recommendations

### Incident Management

- Report security, medical, and facility incidents
- Priority levels (low, medium, high, critical)
- Status tracking (reported, acknowledged, in_progress, resolved)
- Assignment to personnel
- Location tracking
- Attachment support

### Notifications

- Real-time notification system
- Unread count tracking
- Mark as read functionality
- Different notification types (info, warning, alert, success, emergency)
- Auto-cleanup of old notifications

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

See `.env.example` for all required variables:
- Firebase configuration (6 variables)
- Cloudinary configuration (4 variables)
- App configuration (2 variables)

### Firebase Deployment

```bash
# Login to Firebase
firebase login

# Initialize Firestore
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Documentation

- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Complete Firebase setup guide
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Technical implementation details
- **[firestore.rules](firestore.rules)** - Security rules
- **[firestore.indexes.json](firestore.indexes.json)** - Database indexes

## API Services

All backend operations are handled through service classes:

```typescript
import { authService, userService, familyService } from '@/services';

// Authentication
await authService.login(email, password);
await authService.register(email, password, name, role);

// User management
const user = await userService.getUser(uid);
await userService.updateUser(uid, updates);

// Family management
await familyService.createFamilyMember(parentId, memberData);
const members = await familyService.getFamilyMembersByParent(parentId);
```

## State Management

Using Zustand for global state:

```typescript
import { useAuthStore, useNotificationStore } from '@/store';

// Auth state
const { user, userProfile, isAuthenticated } = useAuthStore();

// Notifications
const { notifications, unreadCount, markAsRead } = useNotificationStore();
```

## Custom Hooks

```typescript
import { useAuth, useNotifications } from '@/hooks';

// Authentication hook
const { login, logout, register, isLoading } = useAuth();

// Notifications hook
const { notifications, markAsRead, markAllAsRead } = useNotifications();
```

## Security

- Firestore security rules enforce role-based access
- Protected routes prevent unauthorized access
- Authentication required for all features
- Input validation and sanitization
- Environment variables for sensitive data
- Error handling with user-friendly messages

## Deployment

### Recommended Platforms
- **Vercel** (Recommended)
- **Netlify**
- **Firebase Hosting**

### Deployment Steps

1. Build the application
   ```bash
   pnpm build
   ```

2. Configure environment variables on your platform

3. Deploy the `dist` folder

### Firebase Hosting (Optional)

```bash
firebase init hosting
firebase deploy --only hosting
```

## Troubleshooting

### Authentication Issues
- Verify Firebase config in `.env`
- Check email/password auth is enabled
- Clear browser cache

### Permission Errors
- Check security rules are deployed
- Verify user role in Firestore
- Ensure user is authenticated

### Image Upload Issues
- Verify Cloudinary config
- Check upload preset is unsigned
- Ensure file size is within limits

## Design System

- **Primary Colors**
  - Electric Blue: `#0ea5e9`
  - Emerald Green: `#10b981`
  - Soft Purple: `#a78bfa`

- **Theme**: Dark by default
- **Aesthetic**: Futuristic operational combined with spiritual calm
- **Typography**: System fonts with clean, modern styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions:
1. Check the documentation
2. Review Firebase/Cloudinary docs
3. Check browser console for errors
4. Review error messages

## Acknowledgments

- Firebase for backend infrastructure
- Cloudinary for image management
- Radix UI for accessible components
- The React and TypeScript communities

---

**Built with ❤️ for worship communities worldwide**
