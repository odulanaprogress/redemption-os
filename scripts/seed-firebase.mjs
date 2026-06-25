/**
 * seed-firebase.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to seed all demo/role accounts directly into Firebase
 * Authentication + Firestore using the Admin SDK.
 *
 * Run with:
 *   node scripts/seed-firebase.mjs
 *
 * Requirements:
 *   • firebase-admin must be installed (this script installs it if missing)
 *   • A service account key JSON placed at: scripts/serviceAccountKey.json
 *     (Download from Firebase Console → Project Settings → Service accounts)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin   = require('firebase-admin');

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, 'serviceAccountKey.json');

// ── Guard: service account key must exist ────────────────────────────────────
if (!existsSync(keyPath)) {
  console.error(`
❌  Service account key not found at:
    ${keyPath}

👉  To fix:
    1. Go to https://console.firebase.google.com/
    2. Select your project → Project Settings → Service accounts
    3. Click "Generate new private key"
    4. Save the downloaded JSON as: scripts/serviceAccountKey.json
    5. Re-run: node scripts/seed-firebase.mjs
`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db   = admin.firestore();

// ── User data to seed ────────────────────────────────────────────────────────
const USERS = [
  {
    email: 'redemptionosadmin01@gmail.com',
    password: 'Redemptionos12@',
    displayName: 'Admin Grace',
    role: 'admin',
    phoneNumber: null,
  },
  {
    email: 'parent1@redemptionos.com',
    password: 'demo1234',
    displayName: 'David Okonkwo',
    role: 'parent',
    phoneNumber: '+2348001112233',
  },
  {
    email: 'parent2@redemptionos.com',
    password: 'demo1234',
    displayName: 'Sarah Mensah',
    role: 'parent',
    phoneNumber: '+2332005556677',
  },
  {
    email: 'security1@redemptionos.com',
    password: 'demo1234',
    displayName: 'Officer James Nkrumah',
    role: 'security',
    phoneNumber: null,
  },
  {
    email: 'security2@redemptionos.com',
    password: 'demo1234',
    displayName: 'Officer Amara Diallo',
    role: 'security',
    phoneNumber: null,
  },
  {
    email: 'vendor1@redemptionos.com',
    password: 'demo1234',
    displayName: 'Emmanuel Stores',
    role: 'vendor',
    phoneNumber: null,
  },
  {
    email: 'vendor2@redemptionos.com',
    password: 'demo1234',
    displayName: 'Grace Foods',
    role: 'vendor',
    phoneNumber: null,
  },
  {
    email: 'vendor3@redemptionos.com',
    password: 'demo1234',
    displayName: 'Holy Wares',
    role: 'vendor',
    phoneNumber: null,
  },
  {
    email: 'delivery1@redemptionos.com',
    password: 'demo1234',
    displayName: 'Kwame Rider',
    role: 'delivery_personnel',
    phoneNumber: '+2332447778899',
  },
  {
    email: 'attendee@redemptionos.com',
    password: 'demo1234',
    displayName: 'Faith Adeyemi',
    role: 'attendee',
    phoneNumber: null,
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedUser(user) {
  const { email, password, displayName, role, phoneNumber } = user;

  let firebaseUser;

  // 1. Create or update in Firebase Auth
  try {
    // Try to get existing user first
    firebaseUser = await auth.getUserByEmail(email);
    console.log(`  ⏭️  Auth user already exists — updating password: ${email}`);
    await auth.updateUser(firebaseUser.uid, {
      password,
      displayName,
      emailVerified: true,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`  ✨ Creating Auth user: ${email}`);
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
    } else {
      throw err;
    }
  }

  const uid = firebaseUser.uid;

  // 2. Create or merge Firestore profile
  const profileRef = db.collection('users').doc(uid);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await profileRef.set(
    {
      uid,
      email,
      displayName,
      role,
      ...(phoneNumber && { phoneNumber }),
      photoURL: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      metadata: {
        loginCount: 0,
        lastLogin: now,
      },
      preferences: {
        notifications: true,
        emailAlerts: true,
        smsAlerts: role === 'parent' || role === 'security',
        language: 'en',
        theme: 'dark',
      },
    },
    { merge: true }
  );

  console.log(`  ✅ Firestore profile upserted | uid: ${uid} | role: ${role}`);
  return uid;
}

async function main() {
  console.log('\n🚀 Redemption OS — Firebase Seeder\n');
  console.log(`📦 Seeding ${USERS.length} users into Firebase...\n`);

  let successCount = 0;
  let errorCount   = 0;

  for (const user of USERS) {
    console.log(`👤 ${user.displayName} (${user.role})`);
    try {
      await seedUser(user);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      errorCount++;
    }
    console.log('');
  }

  console.log('─────────────────────────────────────────────────');
  console.log(`✅ Success: ${successCount} users`);
  if (errorCount > 0) console.log(`❌ Errors:  ${errorCount} users`);
  console.log('\n🎉 Done! You can now log in with any of these accounts on the live app.\n');

  console.log('📋 Credentials Summary:');
  console.log('─────────────────────────────────────────────────');
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(20)} ${u.email.padEnd(40)} ${u.password}`);
  }
  console.log('─────────────────────────────────────────────────\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n💥 Seeder crashed:', err);
  process.exit(1);
});
