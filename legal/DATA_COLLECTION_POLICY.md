# Data Collection & Processing Policy

**Redemption OS**  
**Effective Date:** June 25, 2026  
**Last Updated:** June 25, 2026

---

## Purpose

This document provides a detailed breakdown of exactly what data Redemption OS collects, why, how it is processed, who has access, and how long it is retained. It is designed to satisfy GDPR, NDPR (Nigeria Data Protection Regulation), and other applicable data protection frameworks.

---

## 1. Data Controller Information

**Name:** Redemption OS  
**Email:** data@redemptionos.com  
**Role:** Data Controller (determines the purpose and means of processing personal data)

---

## 2. Legal Bases for Processing

We process your data under the following legal bases:

| Basis | When Used |
|-------|-----------|
| **Contractual necessity** | Processing required to provide the Service you signed up for (account creation, login, core features) |
| **Legitimate interests** | Security monitoring, fraud prevention, error tracking, platform improvement |
| **Consent** | Optional features such as SMS notifications, profile photos |
| **Legal obligation** | Compliance with applicable laws (e.g., maintaining order records) |

---

## 3. Complete Data Inventory

### 3.1 Account & Identity Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| Full name | Yes | Profile display, identification | Contract | Firebase Firestore |
| Email address | Yes | Login, notifications | Contract | Firebase Auth + Firestore |
| Password (hashed) | Yes | Authentication | Contract | Firebase Auth (bcrypt hash) |
| Phone number | Optional | SMS alerts, emergency contact | Consent | Firebase Firestore |
| Profile photo | Optional | Identity display | Consent | Cloudinary |
| Role (admin, vendor, etc.) | Yes | Access control | Contract | Firebase Firestore |
| Account creation date | Yes | Record keeping | Legitimate interest | Firebase Firestore |
| Last login timestamp | Yes | Security / account health | Legitimate interest | Firebase Firestore |
| Login count | Yes | Usage analytics | Legitimate interest | Firebase Firestore |
| Theme/language preferences | Optional | UX personalization | Consent | Firebase Firestore |

### 3.2 Family Member & Child Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| Child's full name | Yes | QR identity card | Contract (parental consent) | Firebase Firestore |
| Child's photo | Optional | QR identity card | Parental consent | Cloudinary |
| Date of birth | Yes | Age verification / identification | Contract | Firebase Firestore |
| Allergies / medical notes | Optional | Emergency safety | Parental consent | Firebase Firestore |
| Zone / seat assignment | Optional | Logistics | Contract | Firebase Firestore |
| QR code data | Yes | Check-in/check-out | Contract | Firebase Firestore |
| Emergency contact | Yes | Child safety | Contract | Firebase Firestore |

### 3.3 Communications Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| Messages sent | Yes | Communication service | Contract | Firebase Firestore |
| Broadcast content | Yes | Event operations | Contract | Firebase Firestore |
| Media attachments (images/video) | Optional | Enhanced communication | Consent | Cloudinary |
| Notification records | Yes | User alerting | Contract | Firebase Firestore |

### 3.4 Incident & Operations Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| Incident reports | Yes | Safety operations | Contract + Legitimate interest | Firebase Firestore |
| Incident type/priority | Yes | Triage | Contract | Firebase Firestore |
| Reporter identity | Yes | Follow-up, accountability | Contract | Firebase Firestore |
| Location data (zone/building) | Yes | Emergency response | Contract | Firebase Firestore |

### 3.5 Marketplace & Order Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| Order details (items, quantity) | Yes | Fulfillment | Contract | Firebase Firestore |
| Order status & history | Yes | Customer service, accounting | Legal obligation | Firebase Firestore |
| Vendor product listings | Yes | Marketplace operation | Contract | Firebase Firestore |
| Product images | Yes | Marketplace display | Contract | Cloudinary |

### 3.6 Technical & Analytics Data

| Data Element | Collected | Purpose | Legal Basis | Stored Where |
|-------------|-----------|---------|------------|-------------|
| IP address | Yes | Security, fraud prevention | Legitimate interest | Firebase / Sentry |
| Browser type & version | Yes | Compatibility / error context | Legitimate interest | Sentry |
| Operating system | Yes | Error diagnosis | Legitimate interest | Sentry |
| Error stack traces | Yes | Bug fixing | Legitimate interest | Sentry (90-day retention) |
| Session identifiers | Yes | Login session management | Contract | Browser localStorage |
| App usage events | Yes | Feature improvement | Legitimate interest | Firebase |

---

## 4. Data Sharing & Sub-Processors

We use the following sub-processors (third-party data processors):

| Sub-Processor | Data Shared | Purpose | Location | DPA/Compliance |
|--------------|------------|---------|----------|----------------|
| **Google Firebase** | Account data, messages, all Firestore data | Database + Auth | Global (Google Cloud) | GDPR compliant, SCCs in place |
| **Cloudinary** | Media files (photos, videos) | Media storage & CDN | USA + Global CDN | GDPR compliant |
| **Sentry** | Error logs, IP addresses, device info | Error monitoring | USA | GDPR compliant |

We do **not** share data with:
- Advertising networks
- Data brokers
- Analytics platforms (e.g., Google Analytics)
- Social media platforms

---

## 5. Data Retention Schedule

| Category | Retention Period | Deletion Method |
|----------|-----------------|----------------|
| Active user accounts | Until deletion + 30 days | Automated Firebase deletion |
| Deleted account data | 30 days after deletion request | Hard delete from Firestore + Auth |
| Family member records | Until deleted by parent/guardian | On-demand deletion |
| Messages | 12 months | Automated Firestore TTL |
| Broadcast records | 12 months | Automated Firestore TTL |
| Incident reports | 24 months | Manual review + deletion |
| Order records | 36 months | Legal requirement (accounting) |
| Error logs (Sentry) | 90 days | Sentry automated deletion |
| Media files (Cloudinary) | Until account/content deletion | Cloudinary API deletion |
| Session tokens (localStorage) | Until logout or browser clear | Browser-controlled |

---

## 6. Data Subject Rights & Procedures

### How to Submit a Request

Email: **data@redemptionos.com**  
Subject line: `DATA REQUEST: [Right you are exercising]`  
Include: Full name, registered email address, type of request

### Response Timeline

We will acknowledge your request within **72 hours** and fulfill it within **30 days**.

### Rights Available

| Right | Description | How We Fulfill It |
|-------|-------------|------------------|
| **Access (Article 15 GDPR)** | Request a copy of your data | We export your Firestore record + Cloudinary media list |
| **Rectification (Article 16)** | Correct inaccurate data | Available self-service in Settings; or via email request |
| **Erasure (Article 17)** | Delete your data | Account deletion removes all Firestore data; we delete Cloudinary media |
| **Portability (Article 20)** | Receive your data in JSON format | We export your user profile and data on request |
| **Restriction (Article 18)** | Limit how we use your data | We can flag your account for restricted processing |
| **Objection (Article 21)** | Object to legitimate interest processing | Reviewed case-by-case |

---

## 7. Security Measures

### Technical Safeguards

- All data in transit encrypted with **TLS 1.2+**
- Firebase Authentication uses industry-standard password hashing
- Firestore security rules enforce **role-based access** (users can only access their own data)
- Cloudinary media URLs are unique and non-guessable
- Error monitoring via Sentry does **not** log passwords or payment information
- Service account keys stored **outside of version control**

### Organizational Safeguards

- Only authorized event administrators have elevated database access
- Service account keys are rotated regularly
- Developer access to production data is logged
- `.env` files and service keys are in `.gitignore`

### Incident Response

In the event of a data breach:
- Affected users will be notified within **72 hours** of discovery
- Relevant supervisory authorities will be notified as required by law
- Breach details and remediation steps will be documented

---

## 8. Sensitive Data

Redemption OS may process the following categories of sensitive data:

| Sensitive Category | Context | Safeguards |
|-------------------|---------|-----------|
| **Children's personal data** | Family member registration | Parental consent required; restricted to authorized security staff |
| **Health/medical information** | Allergy notes for family members | Optional; access restricted to parent + event security only |

We do **not** collect:
- Financial or payment card data
- Government ID numbers
- Biometric data
- Location tracking (GPS) without explicit request during incident reporting

---

## 9. Automated Decision-Making

Redemption OS does **not** use automated decision-making or profiling that produces legal or similarly significant effects on users.

---

## 10. Cross-Border Data Transfers

Data stored in Google Firebase may be processed in data centers outside your country. Google operates under the EU Standard Contractual Clauses (SCCs) for GDPR compliance. Cloudinary similarly provides GDPR-compliant data processing agreements.

---

## 11. Contact & Complaints

**Data Controller Contact:**  
Email: data@redemptionos.com

If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local data protection authority:
- **Nigeria:** NITDA — https://nitda.gov.ng
- **EU/EEA:** Your national Data Protection Authority
- **UK:** ICO — https://ico.org.uk

---

## 12. Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 25, 2026 | Initial release |
