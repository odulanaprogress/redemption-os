# How Redemption OS Works

> A plain-English guide for everyone — attendees, parents, staff, and organizers.

**Version 1.0 — June 2026**

---

## What is Redemption OS?

**Redemption OS** is a smart event management platform built for large-scale religious gatherings, conventions, and camp meetings. It replaces paper-based processes, manual coordination, and disconnected communication with a single, real-time digital platform.

Whether you are an attendee finding your seat, a parent keeping track of your children, a security officer managing incidents, or a vendor selling goods — Redemption OS gives you exactly what you need, nothing more.

---

## Who Uses Redemption OS?

The platform has **6 distinct roles**, each with their own dedicated dashboard and tools:

| Role | Who They Are | What They Do |
|------|-------------|-------------|
| **Attendee** | Event participants | Browse the event, watch live feed, shop, report issues |
| **Parent / Guardian** | Attendees with children | Register children, manage QR safety tags, shop, stay informed |
| **Security** | Event security staff | Monitor incidents, manage operations, send emergency broadcasts |
| **Vendor** | Marketplace sellers | List products, manage orders, track sales |
| **Delivery** | Logistics team | Fulfill and track marketplace deliveries on-site |
| **Admin** | Event organizers | Full control of everything — users, broadcasts, analytics, settings |

---

## The Registration Flow

```
1. Visit the app → Click "Register"
2. Choose your role: Attendee OR Parent / Guardian
3. Fill in your details (name, email, phone, password)
4. Agree to the Terms of Use and Privacy Policy
5. Click "Create Account"
6. ✅ A confirmation email is sent to verify your address
7. You are logged in and taken to your personalized dashboard
```

> **Parents:** After registering, go to **QR Identity** to register your children and generate their safety QR tags.

---

## Feature Guide

---

### 🏠 Dashboard (Attendee)

Your home screen shows:
- **Live Event Status** — what's happening right now (session name, attendance count, time)
- **Quick Actions** — shortcuts to AI Assistant, Navigation, Gospel Feed, Marketplace, Communications, and Report Issue
- **Live Updates** — real-time notifications from event organizers
- **Crowd Status** — how busy each zone/hall is, so you can find a less crowded area
- **Emergency SOS** — one-tap access to emergency help

---

### 🏠 Dashboard (Parent / Guardian)

Your home screen is focused on your family's safety:
- **QR Identity banner** — quick access to your children's safety tags
- **Family Tools** — QR Tags, Family Members, Navigation, Gospel Feed, Marketplace, Communications
- **Emergency actions** — Report Issue and Emergency SOS always visible
- **Live Updates** — real-time event notifications
- **Bottom navigation** — Home, QR Tags, Market, Alerts, Profile

---

### 🔒 QR Identity System (Parents & Security)

**For Parents:**
1. Go to **QR Identity** from your dashboard
2. Click **"Add Family Member"**
3. Fill in your child's details (name, date of birth, zone, allergies, emergency contact)
4. Optionally upload a photo
5. A unique QR code is generated and saved
6. Download or print the QR tag — attach it to your child at the event

**For Security Staff:**
1. Use the **Scan QR** feature in the Operations Center
2. Point camera at a child's QR tag
3. Instantly see: name, photo, allergies, parent contact, seat/zone
4. Use this for lost-child reunification or health emergencies

---

### 📡 Communication Center

All users can receive broadcasts and updates here:

- **Broadcasts** — one-way messages from Admins and Security (announcements, alerts, emergencies)
- **Channel Messages** — two-way chat in specific channels:
  - `#general` — open to all
  - `#emergency` — security & admin only
  - `#volunteers` — volunteer coordination
  - `#logistics` — delivery coordination
  - `#zone-a`, `#zone-b` — zone-specific updates

Messages update **in real-time** — no need to refresh.

---

### 🛒 Marketplace

**For Attendees & Parents:**
1. Go to **Marketplace** from your dashboard
2. Browse products from verified event vendors
3. Add items to cart → place order
4. Your order is sent to the vendor and delivery team
5. Track delivery status in real-time

**For Vendors:**
1. Log in with your vendor account
2. You are automatically taken to the **Vendor Dashboard**
3. Add products (name, price, stock, image)
4. View incoming orders and update their status (received → preparing → ready → delivered)

**For Delivery Personnel:**
1. Log in with your delivery account → go to **Smart Logistics**
2. View assigned deliveries
3. Update delivery status as you move through the event

---

### 🚨 Community Signal (Incident Reporting)

Any authenticated user can report an issue:

1. Go to **Community Signal**
2. Choose a category: Medical, Security, Sound/Audio, Crowd, Traffic, Facility, Other
3. Set severity level (Low / Medium / High / Critical)
4. Describe the issue
5. Your location (zone/building) is captured automatically
6. Submit — the report goes live immediately in the **Operations Center**

Security staff and Admins see all reports in real-time and can assign, update, and resolve them.

---

### 🛡️ Operations Center (Security & Admin only)

A dedicated command view for event security:
- Live feed of all reported incidents
- Ability to assign incidents to staff members
- Update incident status (Reported → In Progress → Resolved)
- Create emergency broadcasts to all users
- View real-time crowd data and zone status

---

### 📊 Admin Dashboard (Admin only)

Full control panel:
- **User Management** — view, edit, activate/deactivate all user accounts
- **Analytics** — attendance data, incident summary, marketplace stats
- **Broadcast Center** — send announcements to all roles or specific groups
- **Session Management** — create and manage event sessions
- **Marketplace Admin** — view all vendor listings and orders
- **Settings** — app-wide configuration

---

### 🤖 AI Assistant

Available to all roles:
- Ask any question about the event (schedule, venues, FAQs)
- Get directions and navigation help
- Request support

---

### 🗺️ Smart Navigation

- Interactive venue map
- Find specific zones, halls, gates, restrooms, and first aid stations
- Real-time crowd density guidance ("Hall B is less crowded right now")

---

### 📻 Live Gospel Feed

- Live-streamed audio and video of the main session
- Sermon notes and timestamps
- Chat alongside the stream (attendees)

---

## Email Verification

After you register, **Redemption OS** sends a confirmation email to your registered address. Click the link in that email to verify your account. Verifying your email:
- Confirms your identity
- Allows you to reset your password if you forget it
- Is required for certain sensitive features

> The verification email comes from Firebase (Google) on behalf of Redemption OS.

---

## Data & Privacy

Redemption OS takes your privacy seriously:
- Your data is stored securely on **Google Firebase** (encrypted)
- Media you upload is stored on **Cloudinary**
- We never sell your data
- You can request deletion of your data at any time: **data@redemptionos.com**
- Children's data (QR Identity) is only visible to the registering parent and authorized security staff

For full details, see our [Privacy Policy](./legal/PRIVACY_POLICY.md) and [Terms of Use](./legal/TERMS_OF_USE.md).

---

## Getting Help

| Issue | Contact |
|-------|---------|
| Can't log in / forgot password | Use "Forgot Password?" on the login screen |
| Account issues | Email: support@redemptionos.com |
| Privacy / data requests | Email: data@redemptionos.com |
| Report abuse | Email: abuse@redemptionos.com |
| Emergency at the event | Use **Emergency SOS** in the app OR call your local emergency number |

---

## Quick Reference — Who Can Access What

| Feature | Attendee | Parent | Security | Vendor | Delivery | Admin |
|---------|:--------:|:------:|:--------:|:------:|:--------:|:-----:|
| Live Gospel Feed | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Smart Navigation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Marketplace (browse/buy) | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Vendor Dashboard | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Community Signal (report) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Emergency SOS | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| QR Identity (manage) | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| QR Identity (scan) | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Communication Center | 📖 read | 📖 read | ✅ full | ❌ | ❌ | ✅ full |
| Smart Logistics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Operations Center | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

*Redemption OS — Intelligent Worship. Seamless Operations.*
