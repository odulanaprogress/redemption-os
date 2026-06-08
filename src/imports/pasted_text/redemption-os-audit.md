Perform a complete Redemption OS application audit, debugging pass, Firebase integration review, UI stabilization, and production-readiness implementation.

The application currently has major issues:

* Users cannot successfully reach the dashboard after login.
* Infinite loading/spinner states occur.
* Firebase Authentication and Firestore integration may be incomplete.
* Firestore user profiles may not be created after registration.
* Role loading may be failing.
* Protected routes may be blocking navigation.
* Firestore rules and collections may not be fully connected.
* Some UI actions may not be functional.
* Error handling is insufficient.

DO NOT redesign the UI.

FOCUS ON FUNCTIONALITY, STABILITY, SECURITY, INTEGRATION, AND USER EXPERIENCE.

==================================================
FIREBASE AUTHENTICATION
=======================

Audit and fix:

* Firebase initialization
* Registration
* Login
* Logout
* Password reset
* Session persistence
* Auth state listeners
* Email verification

Ensure:

Register
→ Firebase Auth User Created
→ Firestore User Created
→ Default Role Assigned
→ Redirect

Login
→ Auth Success
→ Firestore Profile Retrieved
→ Role Loaded
→ Zustand Updated
→ Redirect To Correct Dashboard

If Firestore profile does not exist:

* Create automatically
* Assign role "attendee"
* Continue login

==================================================
FIRESTORE DATABASE
==================

Verify and connect:

users
family_members
qr_tags
incidents
signals
vendors
products
orders
deliveries
notifications

Collections should be created automatically when data is first written.

Implement complete CRUD operations through service layer.

Add validation.

Add graceful handling for:

* missing collections
* missing documents
* permission errors
* network failures

==================================================
ROLE MANAGEMENT
===============

Implement and verify:

admin
attendee
parent
volunteer
security
vendor
delivery_personnel

Role-based redirects:

admin → /admin
attendee → /dashboard
parent → /family
volunteer → /volunteer
security → /security
vendor → /vendor
delivery_personnel → /delivery

Unauthorized users should see access denied screens.

==================================================
LOADING STATE FIXES
===================

Audit every loading state.

Fix:

* auth loading
* dashboard loading
* profile loading
* Firestore loading
* marketplace loading
* QR loading

No page should remain on a permanent spinner.

All requests must:

* resolve
* timeout
* show fallback UI
* allow retry

==================================================
ERROR HANDLING
==============

Replace silent failures with visible errors.

Implement:

* Error Boundaries
* Toast Notifications
* Retry Buttons
* Fallback Screens

Display useful messages for:

* login failure
* registration failure
* Firestore failure
* Cloudinary failure
* permission denied
* network errors

==================================================
CHILD SAFETY & QR SYSTEM
========================

Ensure fully functional:

Parent Registration
→ Child Registration
→ Photo Upload
→ QR Generation
→ Firestore Save
→ QR Card Display
→ Download QR
→ Print QR

QR Scan Flow:

Scan QR
→ Retrieve Child
→ Retrieve Guardian
→ Display Emergency Contact
→ Show Assigned Zone
→ Send Notification
→ Child Reunification Workflow

==================================================
CLOUDINARY
==========

Connect image uploads.

Support:

* profile photos
* child photos
* vendor logos
* product images

Store URLs in Firestore.

Implement upload progress and upload error handling.

Use environment variables only.

==================================================
ADMIN COMMAND CENTER
====================

Connect dashboard widgets to Firestore.

Display:

* total users
* incidents
* lost children
* vendors
* products
* orders
* deliveries
* notifications

Use realtime updates where possible.

==================================================
COMMUNITY SIGNALS
=================

Implement:

Report Issue
Admin Review
Status Updates

Categories:

* overcrowding
* sound issues
* emergency
* transport
* facility
* lost child

==================================================
EMERGENCY INCIDENT SYSTEM
=========================

Implement:

Create Incident
Assign Responder
Update Status
Resolve Incident

Display incident timeline.

==================================================
MARKETPLACE
===========

Implement:

Vendor Registration
Vendor Approval
Product Management
Product Listings
Cart
Checkout
Order Creation

Use simulated payment success.

No real payment gateway required.

==================================================
DELIVERY SYSTEM
===============

Implement:

Order
→ Delivery Assignment
→ Status Tracking
→ Delivery Completion

Show delivery progress timeline.

==================================================
NOTIFICATIONS
=============

Implement realtime notifications for:

* child reunification
* incident updates
* order updates
* delivery updates
* announcements

Unread count must update automatically.

==================================================
AI ASSISTANT
============

Integrate OpenAI using environment variable.

Assistant should answer:

* navigation questions
* facility locations
* event information
* emergency guidance
* marketplace support

If API unavailable:

* use fallback responses
* never break UI

==================================================
LIVE GOSPEL FEED
================

Implement:

* live text feed
* bookmarks
* note taking
* offline reading

Use mock realtime data if transcription is unavailable.

==================================================
UI STABILITY AUDIT
==================

Find and fix:

* broken buttons
* broken links
* missing handlers
* duplicate requests
* console errors
* hydration issues
* infinite re-renders
* memory leaks
* stale state

==================================================
OFFLINE SUPPORT
===============

Implement:

* offline detection
* reconnect handling
* cached session
* loading skeletons
* empty states

Display:

No Internet Connection
Reconnecting...
Try Again

==================================================
SECURITY
========

Verify:

* Firestore security rules
* role permissions
* protected routes
* secure service access
* environment variable usage

No secrets should be hardcoded.

All API keys must be loaded from .env.

==================================================
DEBUGGING
=========

Add logs for:

* Firebase initialization
* Authentication success
* Registration success
* Firestore profile creation
* Firestore profile retrieval
* Role loading
* Dashboard redirect
* API failures

==================================================
FINAL GOAL
==========

User can:

Register
→ Appear in Firebase Authentication
→ Appear in Firestore users collection
→ Login successfully
→ Reach correct dashboard
→ Use QR safety system
→ Use marketplace
→ Receive notifications
→ Access role-based features

Application must be stable, secure, scalable, hackathon-demo ready, and free of critical authentication, routing, loading, and UI blockers.
