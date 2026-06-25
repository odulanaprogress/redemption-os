import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  NextOrObserver,
} from 'firebase/auth';
import { auth, isMockMode } from '../config/firebase.config';
import { MOCK_USERS, MOCK_PROFILES, MOCK_SESSION_KEY } from '../config/mock-data';
import { UserRole, UserProfile } from '../types';
import { userService } from './user.service';

// In-memory mock auth listeners
const mockAuthListeners: Array<(user: FirebaseUser | null) => void> = [];
let mockCurrentUser: FirebaseUser | null = null;

function buildMockFirebaseUser(uid: string, email: string, displayName: string): FirebaseUser {
  return {
    uid,
    email,
    displayName,
    emailVerified: true,
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
    providerData: [],
    providerId: 'mock',
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as FirebaseUser;
}

function notifyMockListeners(user: FirebaseUser | null) {
  mockCurrentUser = user;
  mockAuthListeners.forEach((cb) => cb(user));
}

function loadMockSession() {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    const { uid, email, displayName } = JSON.parse(raw);
    return buildMockFirebaseUser(uid, email, displayName);
  } catch {
    return null;
  }
}

function saveMockSession(uid: string, email: string, displayName: string) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ uid, email, displayName }));
}

function clearMockSession() {
  localStorage.removeItem(MOCK_SESSION_KEY);
}

export class AuthService {
  async register(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) {
    console.log('[AUTH] 🚀 Starting registration for:', email, '| Role:', role);

    if (isMockMode) {
      console.log('[AUTH] 🎭 Running in DEMO MODE');
      const existing = MOCK_USERS.find((u) => u.email === email);
      if (existing) {
        console.warn('[AUTH] ❌ Mock registration failed - email already exists');
        return { success: false, error: { code: 'auth/email-already-in-use', message: 'This email is already registered.' } };
      }
      const uid = `user-${Date.now()}`;
      const mockUser = buildMockFirebaseUser(uid, email, displayName);
      MOCK_USERS.push({ uid, email, password, displayName, emailVerified: true });
      MOCK_PROFILES[uid] = {
        uid, email, displayName, role,
        createdAt: new Date(), updatedAt: new Date(), isActive: true,
        metadata: { lastLogin: new Date(), loginCount: 1 },
        ...additionalData,
      } as UserProfile;
      saveMockSession(uid, email, displayName);
      notifyMockListeners(mockUser);
      console.log('[AUTH] ✅ Mock registration successful | UID:', uid);
      return { success: true, user: mockUser };
    }

    try {
      console.log('[AUTH] 📝 Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;
      console.log('[AUTH] ✅ Firebase Auth user created | UID:', user.uid);

      console.log('[AUTH] 👤 Updating profile display name...');
      await updateProfile(user, { displayName });
      console.log('[AUTH] ✅ Profile updated');

      console.log('[AUTH] 💾 Creating Firestore user profile...');
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: user.email!,
        displayName,
        role,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        metadata: { lastLogin: new Date(), loginCount: 1 },
        ...additionalData,
      };

      const profileResult = await userService.createUser(user.uid, userProfile);
      if (!profileResult.success) {
        console.error('[AUTH] ❌ Failed to create Firestore profile:', profileResult.error);
        throw new Error('Failed to create user profile in Firestore');
      }
      console.log('[AUTH] ✅ Firestore profile created successfully');

      // Send email verification (free Firebase feature)
      console.log('[AUTH] 📧 Sending email verification...');
      await sendEmailVerification(user);
      console.log('[AUTH] ✅ Email verification sent to:', user.email);

      console.log('[AUTH] 🎉 Registration complete for:', user.uid);
      return { success: true, user };
    } catch (error: any) {
      console.error('[AUTH] ❌ Registration error:', error.code, error.message);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  async login(email: string, password: string) {
    console.log('[AUTH] 🔐 Login attempt for:', email);

    if (isMockMode) {
      console.log('[AUTH] 🎭 Running in DEMO MODE');
      const mockUser = MOCK_USERS.find((u) => u.email === email && u.password === password);
      if (!mockUser) {
        console.warn('[AUTH] ❌ Invalid credentials');
        return { success: false, error: { code: 'auth/invalid-credential', message: 'Invalid email or password.' } };
      }
      const firebaseUser = buildMockFirebaseUser(mockUser.uid, mockUser.email, mockUser.displayName);
      saveMockSession(mockUser.uid, mockUser.email, mockUser.displayName);
      notifyMockListeners(firebaseUser);
      console.log('[AUTH] ✅ Mock login successful | UID:', mockUser.uid);
      return { success: true, user: firebaseUser };
    }

    try {
      console.log('[AUTH] 🔑 Authenticating with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;
      console.log('[AUTH] ✅ Firebase authentication successful | UID:', user.uid);

      // Check if Firestore profile exists, create if missing
      console.log('[AUTH] 📖 Checking Firestore profile...');
      let profile = await userService.getUser(user.uid);

      if (!profile) {
        console.warn('[AUTH] ⚠️ Firestore profile not found, creating default profile...');
        const defaultProfile: Omit<UserProfile, 'uid'> = {
          email: user.email!,
          displayName: user.displayName || 'User',
          role: 'attendee',
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          metadata: { lastLogin: new Date(), loginCount: 1 },
        };
        await userService.createUser(user.uid, defaultProfile);
        console.log('[AUTH] ✅ Default Firestore profile created');
      } else {
        console.log('[AUTH] ✅ Firestore profile found | Role:', profile.role);
        // Update login metadata
        await userService.updateUserMetadata(user.uid, {
          'metadata.lastLogin': new Date(),
          'metadata.loginCount': (profile.metadata?.loginCount ?? 0) + 1,
        });
        console.log('[AUTH] ✅ Login metadata updated');
      }

      console.log('[AUTH] 🎉 Login complete for:', user.uid);
      return { success: true, user };
    } catch (error: any) {
      console.error('[AUTH] ❌ Login error:', error.code, error.message);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  async logout() {
    if (isMockMode) {
      clearMockSession();
      notifyMockListeners(null);
      return { success: true };
    }
    try {
      await signOut(auth!);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  async resetPassword(email: string) {
    if (isMockMode) {
      const exists = MOCK_USERS.some((u) => u.email === email);
      if (!exists) return { success: false, error: { code: 'auth/user-not-found', message: 'No account found with this email.' } };
      return { success: true };
    }
    try {
      await sendPasswordResetEmail(auth!, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string) {
    if (isMockMode) {
      if (mockCurrentUser) {
        const u = MOCK_USERS.find((m) => m.uid === mockCurrentUser!.uid);
        if (u && u.password === currentPassword) { u.password = newPassword; return { success: true }; }
        return { success: false, error: { code: 'auth/wrong-password', message: 'Incorrect password.' } };
      }
      return { success: false, error: { code: 'auth/no-user', message: 'No user logged in.' } };
    }
    try {
      const user = auth!.currentUser;
      if (!user || !user.email) throw new Error('No user logged in');
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }) {
    if (isMockMode) {
      if (!mockCurrentUser) return { success: false, error: { code: 'auth/no-user', message: 'No user logged in.' } };
      const profile = MOCK_PROFILES[mockCurrentUser.uid];
      if (profile) {
        if (updates.displayName) profile.displayName = updates.displayName;
        if (updates.photoURL) profile.photoURL = updates.photoURL;
        profile.updatedAt = new Date();
      }
      return { success: true };
    }
    try {
      const user = auth!.currentUser;
      if (!user) throw new Error('No user logged in');
      await updateProfile(user, updates);
      if (updates.displayName || updates.photoURL) {
        await userService.updateUser(user.uid, {
          ...(updates.displayName && { displayName: updates.displayName }),
          ...(updates.photoURL && { photoURL: updates.photoURL }),
          updatedAt: new Date(),
        });
      }
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: { code: error.code, message: this.getErrorMessage(error.code) } };
    }
  }

  getCurrentUser(): FirebaseUser | null {
    if (isMockMode) return mockCurrentUser;
    return auth?.currentUser ?? null;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (isMockMode) {
      mockAuthListeners.push(callback);
      // Immediately fire with current mock session
      const sessionUser = loadMockSession();
      setTimeout(() => callback(sessionUser), 0);
      return () => {
        const idx = mockAuthListeners.indexOf(callback);
        if (idx > -1) mockAuthListeners.splice(idx, 1);
      };
    }
    return auth!.onAuthStateChanged(callback);
  }

  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/requires-recent-login': 'Please log in again to complete this action.',
    };
    return errorMessages[code] || 'An error occurred. Please try again.';
  }
}

export const authService = new AuthService();
