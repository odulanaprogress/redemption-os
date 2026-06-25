/**
 * seed-firebase.cjs — CommonJS seed script for Firebase Admin SDK
 * Run: node scripts/seed-firebase.cjs
 */

'use strict';

const path  = require('path');
const fs    = require('fs');
const {
  initializeApp,
  cert,
  getAuth,
  getFirestore,
  FieldValue,
} = require('firebase-admin/app');
const { getAuth: getAuthModule }      = require('firebase-admin/auth');
const { getFirestore: getFirestoreModule, FieldValue: FV } = require('firebase-admin/firestore');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('\n❌  serviceAccountKey.json not found at: ' + keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuthModule();
const db   = getFirestoreModule();


// ── All accounts to seed ─────────────────────────────────────────────────────
const USERS = [
  { email: 'redemptionosadmin01@gmail.com', password: 'Redemptionos12@', displayName: 'Admin Grace',             role: 'admin',             phoneNumber: null },
  { email: 'parent1@redemptionos.com',      password: 'demo1234',        displayName: 'David Okonkwo',           role: 'parent',            phoneNumber: '+2348001112233' },
  { email: 'parent2@redemptionos.com',      password: 'demo1234',        displayName: 'Sarah Mensah',            role: 'parent',            phoneNumber: '+2332005556677' },
  { email: 'security1@redemptionos.com',    password: 'demo1234',        displayName: 'Officer James Nkrumah',  role: 'security',          phoneNumber: null },
  { email: 'security2@redemptionos.com',    password: 'demo1234',        displayName: 'Officer Amara Diallo',   role: 'security',          phoneNumber: null },
  { email: 'vendor1@redemptionos.com',      password: 'demo1234',        displayName: 'Emmanuel Stores',        role: 'vendor',            phoneNumber: null },
  { email: 'vendor2@redemptionos.com',      password: 'demo1234',        displayName: 'Grace Foods',            role: 'vendor',            phoneNumber: null },
  { email: 'vendor3@redemptionos.com',      password: 'demo1234',        displayName: 'Holy Wares',             role: 'vendor',            phoneNumber: null },
  { email: 'delivery1@redemptionos.com',    password: 'demo1234',        displayName: 'Kwame Rider',            role: 'delivery_personnel',phoneNumber: '+2332447778899' },
  { email: 'attendee@redemptionos.com',     password: 'demo1234',        displayName: 'Faith Adeyemi',          role: 'attendee',          phoneNumber: null },
];

async function seedUser(user) {
  const { email, password, displayName, role, phoneNumber } = user;
  let firebaseUser;

  try {
    firebaseUser = await auth.getUserByEmail(email);
    console.log('  ⏭️  Already exists — updating: ' + email);
    await auth.updateUser(firebaseUser.uid, { password, displayName, emailVerified: true });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log('  ✨ Creating: ' + email);
      firebaseUser = await auth.createUser({ email, password, displayName, emailVerified: true });
    } else {
      throw err;
    }
  }

  const uid = firebaseUser.uid;
  const { FieldValue } = require('firebase-admin/firestore');
  const now = FieldValue.serverTimestamp();

  await db.collection('users').doc(uid).set({
    uid,
    email,
    displayName,
    role,
    ...(phoneNumber && { phoneNumber }),
    photoURL: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    metadata: { loginCount: 0, lastLogin: now },
    preferences: {
      notifications: true,
      emailAlerts: true,
      smsAlerts: role === 'parent' || role === 'security',
      language: 'en',
      theme: 'dark',
    },
  }, { merge: true });

  console.log('  ✅ Firestore profile saved | uid: ' + uid + ' | role: ' + role);
  return uid;
}

async function main() {
  console.log('\n🚀 Redemption OS — Firebase Seeder');
  console.log('📦 Seeding ' + USERS.length + ' users into redemption-os Firebase...\n');

  let success = 0;
  let errors  = 0;

  for (const user of USERS) {
    console.log('👤 ' + user.displayName + ' (' + user.role + ')');
    try {
      await seedUser(user);
      success++;
    } catch (err) {
      console.error('  ❌ Failed: ' + err.message);
      errors++;
    }
    console.log('');
  }

  console.log('─────────────────────────────────────────────────');
  console.log('✅ Success: ' + success + ' users');
  if (errors > 0) console.log('❌ Errors: ' + errors);
  console.log('\n🎉 Done! All accounts are now live in Firebase.\n');
  console.log('📋 Credentials:');
  console.log('─────────────────────────────────────────────────');
  for (const u of USERS) {
    console.log('  ' + u.role.padEnd(20) + u.email.padEnd(42) + u.password);
  }
  console.log('─────────────────────────────────────────────────\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Seeder crashed:', err.message);
  process.exit(1);
});
