Complete the Redemption OS implementation and convert the existing frontend and generated backend architecture into a fully functional hackathon-ready MVP.

The UI, architecture, services, stores, collections, documentation, and folder structure already exist.

DO NOT redesign the UI.

DO NOT generate placeholder architecture.

FOCUS ONLY ON IMPLEMENTATION, INTEGRATION, SECURITY, AND FUNCTIONALITY.

==================================================
ENVIRONMENT CONFIGURATION
==================================================

Use environment variables for ALL external services.

Do NOT hardcode secrets.

Read values from:

Firebase:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Cloudinary:
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

OpenAI:
- OPENAI_API_KEY

==================================================
FIREBASE INTEGRATION
==================================================

Complete and verify:

- Firebase initialization
- Authentication
- Firestore integration
- Session persistence
- User profile creation
- Email/password authentication
- Password reset
- Logout
- Role assignment
- Route protection

Ensure user documents are automatically created in Firestore after registration.

==================================================
ROLE BASED ACCESS CONTROL
==================================================

Implement and verify:

Roles:
- admin
- attendee
- parent
- volunteer
- security
- vendor
- delivery_personnel

Protect routes and pages.

Unauthorized users must be redirected appropriately.

==================================================
FIRESTORE COLLECTIONS
==================================================

Connect all collections:

- users
- family_members
- qr_tags
- incidents
- signals
- vendors
- products
- orders
- deliveries
- notifications

Implement CRUD operations through service layer.

==================================================
CHILD SAFETY & QR IDENTITY SYSTEM
==================================================

Make fully functional:

Parent Registration
→ Child Registration
→ Upload Child Photo
→ Store Family Member
→ Generate QR Identity
→ Save QR Data
→ Display QR Card
→ Download QR
→ Print QR

Implement QR scanning workflow:

Scan QR
→ Retrieve Child
→ Retrieve Guardian
→ Show Emergency Contact
→ Show Assigned Zone
→ Trigger Notification
→ Display Reunification Flow

This must be demo-ready.

==================================================
CLOUDINARY INTEGRATION
==================================================

Implement image uploads for:

- User profile photos
- Child photos
- Vendor logos
- Product images

Store URLs in Firestore.

Implement upload progress indicators and error handling.

==================================================
ADMIN COMMAND CENTER
==================================================

Connect dashboard widgets to Firestore.

Display:

- total users
- active incidents
- family registrations
- marketplace statistics
- orders
- notifications
- vendors
- deliveries

Use realtime listeners.

==================================================
COMMUNITY SIGNALS
==================================================

Implement:

Report Issue
→ Save Signal
→ Admin View
→ Status Update

Categories:

- overcrowding
- sound issues
- emergency
- transport
- facility issues
- lost child

==================================================
EMERGENCY INCIDENT SYSTEM
==================================================

Implement:

Create Incident
Assign Responder
Update Status
Close Incident

Display incident timeline.

==================================================
MARKETPLACE
==================================================

Implement:

Vendor Registration
Vendor Approval Status
Product Management
Product Listings
Cart
Order Creation

Simulate payment success.

No real payment gateway required.

==================================================
DELIVERY SYSTEM
==================================================

Implement:

Order
→ Delivery Assignment
→ Tracking Status
→ Delivery Completion

Display delivery timeline and status.

==================================================
NOTIFICATIONS
==================================================

Implement realtime notifications.

Support:

- child reunification alerts
- incident updates
- order updates
- delivery updates
- admin announcements

Unread count must update automatically.

==================================================
AI ASSISTANT
==================================================

Integrate OpenAI using OPENAI_API_KEY.

Assistant should answer:

- navigation questions
- facility locations
- event information
- emergency guidance
- marketplace help

Create fallback responses when API is unavailable.

==================================================
LIVE GOSPEL FEED
==================================================

Implement:

- live text feed
- note taking
- bookmarks
- offline viewing

Use mock realtime data if live transcription is unavailable.

==================================================
ERROR HANDLING
==================================================

Implement:

- global error boundaries
- network error handling
- Firestore error handling
- upload failures
- authentication failures

Provide retry functionality.

==================================================
OFFLINE SUPPORT
==================================================

Implement:

- offline detection
- reconnect handling
- cached user session
- loading skeletons
- empty states

==================================================
SECURITY
==================================================

Verify:

- Firestore security rules
- role permissions
- protected routes
- secure service access
- environment variable usage

No secrets should exist inside frontend code.

==================================================
DEMO DATA
==================================================

Create seed/demo data:

- 1 admin
- 2 parents
- 4 children
- 2 security personnel
- 3 vendors
- 10 products
- 5 incidents
- 10 notifications

==================================================
FINAL GOAL
==================================================

Deliver a fully functional, hackathon-ready Redemption OS MVP demonstrating:

- Authentication
- Role Management
- QR Child Safety System
- Family Reunification
- Community Signals
- Emergency Coordination
- Marketplace
- Delivery Tracking
- Realtime Notifications
- AI Assistant
- Live Gospel Feed
- Admin Command Center

All features should use Firebase and Cloudinary integrations through environment variables and be production-structured, scalable, secure, and demo-ready.