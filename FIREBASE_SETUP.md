# Firebase Setup Guide for Redemption OS

## Prerequisites
- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)
- Cloudinary account

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project "Redemption OS" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable other providers as needed

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose your preferred location
5. Click "Enable"

### 4. Deploy Security Rules
```bash
firebase login
firebase init firestore
# Select your project
# Use default filenames (firestore.rules and firestore.indexes.json)
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Enable Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Choose the same location as Firestore
5. Click "Done"

### 6. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (`</>`)
4. Register your app with a nickname
5. Copy the configuration object

### 7. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# App Configuration
VITE_APP_NAME=Redemption OS
VITE_APP_VERSION=1.0.0
```

## Cloudinary Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

### 2. Get Credentials
1. Go to Dashboard
2. Copy your **Cloud Name**, **API Key**, and **API Secret**

### 3. Create Upload Preset
1. Go to **Settings** → **Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Name it "redemption-os"
5. Set Signing Mode to **Unsigned**
6. Configure folder structure (optional): `redemption-os/{folder}`
7. Save

## Firestore Collections Structure

The following collections will be automatically created when data is first written:

### `users`
- User profiles with role-based access
- Fields: uid, email, displayName, role, photoURL, phoneNumber, createdAt, updatedAt

### `family_members`
- Child/family member information
- Fields: id, parentId, firstName, lastName, dateOfBirth, photoURL, qrCode, allergies, medicalNotes, emergencyContact, assignedZone

### `qr_tags`
- QR code data for identity system
- Fields: id, familyMemberId, qrCodeData, qrCodeURL, printable, createdAt

### `incidents`
- Security and safety incidents
- Fields: id, reportedBy, type, priority, status, title, description, location, assignedTo, attachments

### `signals`
- Community feedback and concerns
- Fields: id, userId, type, category, message, anonymous, location, status

### `vendors`
- Marketplace vendor profiles
- Fields: id, userId, businessName, description, logo, category, status, rating, totalSales

### `products`
- Marketplace products
- Fields: id, vendorId, name, description, category, price, images, inStock, stockQuantity, tags, featured, rating

### `orders`
- Customer orders
- Fields: id, userId, items, subtotal, tax, deliveryFee, total, status, deliveryAddress, paymentMethod, paymentStatus

### `deliveries`
- Delivery tracking information
- Fields: id, orderId, deliveryPersonnelId, status, pickupLocation, deliveryLocation, currentLocation, estimatedArrival

### `notifications`
- User notifications
- Fields: id, userId, type, title, message, read, actionUrl, createdAt

## User Roles

The system supports the following roles:
- `admin` - Full system access
- `attendee` - Regular user access
- `parent` - Parent with family management
- `volunteer` - Volunteer features
- `security` - Security and operations access
- `vendor` - Marketplace vendor access
- `delivery_personnel` - Delivery tracking access

## Testing the Setup

### 1. Start the Development Server
```bash
pnpm install
pnpm dev
```

### 2. Test Authentication
1. Navigate to `/register`
2. Create a new account
3. Check your email for verification
4. Login at `/login`
5. Verify role-based redirection works

### 3. Test Firestore
1. After login, check Firebase Console → Firestore
2. Verify a user document was created in `users` collection
3. Test creating data in other features

### 4. Test Cloudinary
1. Upload a profile photo or product image
2. Check Cloudinary Media Library
3. Verify images appear correctly in the app

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Firestore indexes deployed
- [ ] Authentication enabled
- [ ] Environment variables configured
- [ ] `.env` added to `.gitignore`
- [ ] Cloudinary upload preset is unsigned
- [ ] Test user created and can login
- [ ] Role-based access working
- [ ] Protected routes prevent unauthorized access

## Deployment

### Recommended Platforms
- **Vercel** (Recommended for Vite/React)
- **Netlify**
- **Firebase Hosting**

### Environment Variables Setup
Make sure to add all environment variables from `.env` to your deployment platform's environment configuration.

### Build Command
```bash
pnpm build
```

### Deploy to Firebase Hosting (Optional)
```bash
firebase init hosting
# Select your project
# Set public directory to: dist
# Configure as single-page app: Yes
# Set up automatic builds: No

firebase deploy --only hosting
```

## Troubleshooting

### Authentication Errors
- Verify Firebase config in `.env`
- Check email/password auth is enabled in Firebase Console
- Clear browser cache and try again

### Firestore Permission Errors
- Verify security rules are deployed
- Check user role is correctly set in users collection
- Ensure you're authenticated

### Cloudinary Upload Errors
- Verify upload preset is unsigned
- Check cloud name and upload preset name
- Ensure CORS is configured (usually automatic for web)

## Support

For issues or questions:
1. Check Firebase documentation: https://firebase.google.com/docs
2. Check Cloudinary documentation: https://cloudinary.com/documentation
3. Review error messages in browser console
4. Check Firebase Console logs

## Next Steps

1. Customize security rules for your specific needs
2. Set up Firebase Cloud Functions for advanced features
3. Configure Firebase Cloud Messaging for push notifications
4. Set up analytics and monitoring
5. Implement backup strategies for Firestore data
