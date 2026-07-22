import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { UserRole, UserProfile } from '../types';

// Module-level flag ensures only one listener is ever registered, regardless
// of how many times useAuth or useAuthInit is called in the component tree.
let authListenerActive = false;

function startAuthListener(
  setUser: (u: any) => void,
  setUserProfile: (p: any) => void,
  setLoading: (l: boolean) => void
) {
  if (authListenerActive) return () => {};
  authListenerActive = true;

  setLoading(true);

  const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
    if (!firebaseUser) {
      // Genuine logout / no session
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    // Firebase Auth succeeded — set the user immediately
    setUser(firebaseUser);

    // Build a safe fallback profile in case Firestore is unavailable
    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0] || 'User',
      role: 'attendee' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      metadata: { lastLogin: new Date(), loginCount: 1 },
    };

    try {
      // Try to load the Firestore profile
      const profile = await userService.getUser(firebaseUser.uid);

      if (profile) {
        // Profile exists — use it
        setUserProfile(profile);
      } else {
        // First login — create the profile in Firestore
        try {
          const { uid, ...profileWithoutUid } = fallbackProfile;
          await userService.createUser(uid, profileWithoutUid);
          const created = await userService.getUser(firebaseUser.uid);
          setUserProfile(created ?? fallbackProfile);
        } catch (createErr) {
          // Firestore create failed (rules, network, etc.)
          // Still allow the user in with the in-memory fallback
          console.warn('[useAuth] Firestore createUser failed — using fallback profile', createErr);
          setUserProfile(fallbackProfile);
        }
      }
    } catch (profileErr) {
      // Firestore read failed entirely — still let the user in
      console.warn('[useAuth] Firestore getUser failed — using fallback profile', profileErr);
      setUserProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  });

  return () => {
    authListenerActive = false;
    unsubscribe();
  };
}

// Called once at the top of the app tree to initialize the auth listener.
export const useAuthInit = () => {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    return startAuthListener(setUser, setUserProfile, setLoading);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

// Used by pages and components to get auth state + actions.
export const useAuth = () => {
  const {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setUserProfile,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: any,
    additionalData?: any
  ) => {
    setLoading(true);
    const result = await authService.register(email, password, displayName, role, additionalData);
    if (!result.success && result.error) setError(result.error.message);
    setLoading(false);
    return result;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.login(email, password);
    if (!result.success && result.error) setError(result.error.message);
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    logoutStore();
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const result = await authService.resetPassword(email);
    if (!result.success && result.error) setError(result.error.message);
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    setLoading(true);
    const result = await authService.updateUserProfile(updates);
    if (result.success && user) {
      const updatedProfile = await userService.getUser(user.uid);
      if (updatedProfile) setUserProfile(updatedProfile);
    } else if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
    return result;
  };

  return {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
  };
};
