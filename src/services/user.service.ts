import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';
import { MOCK_PROFILES } from '../config/mock-data';
import { UserProfile, UserRole, PaginatedResponse } from '../types';
import { useSessionStore } from '../store/session.store';

export class UserService {
  private collectionName = 'users';

  async createUser(uid: string, userData: Omit<UserProfile, 'uid'>) {
    const sessionId = useSessionStore.getState().activeSessionId || 'DEFAULT_SESSION';
    if (isMockMode) {
      MOCK_PROFILES[uid] = { uid, sessionId, ...userData } as UserProfile;
      return { success: true };
    }
    try {
      const userRef = doc(db!, this.collectionName, uid);
      await setDoc(userRef, { ...userData, uid, sessionId, createdAt: userData.createdAt || new Date(), updatedAt: new Date() });
      return { success: true };
    } catch (error: any) {
      console.error('Create user error:', error);
      return { success: false, error };
    }
  }

  async getUser(uid: string): Promise<UserProfile | null> {
    if (isMockMode) {
      return MOCK_PROFILES[uid] ?? null;
    }
    try {
      const userRef = doc(db!, this.collectionName, uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) return { uid, ...userSnap.data() } as UserProfile;
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updateUser(uid: string, updates: Partial<UserProfile>) {
    if (isMockMode) {
      if (MOCK_PROFILES[uid]) Object.assign(MOCK_PROFILES[uid], { ...updates, updatedAt: new Date() });
      return { success: true };
    }
    try {
      const userRef = doc(db!, this.collectionName, uid);
      await updateDoc(userRef, { ...updates, updatedAt: new Date() });
      return { success: true };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { success: false, error };
    }
  }

  async updateUserMetadata(uid: string, metadata: Record<string, any>) {
    if (isMockMode) {
      if (MOCK_PROFILES[uid]) {
        if (!MOCK_PROFILES[uid].metadata) MOCK_PROFILES[uid].metadata = {};
        Object.assign(MOCK_PROFILES[uid].metadata!, metadata);
      }
      return { success: true };
    }
    try {
      const userRef = doc(db!, this.collectionName, uid);
      await updateDoc(userRef, metadata);
      return { success: true };
    } catch (error: any) {
      console.error('Update user metadata error:', error);
      return { success: false, error };
    }
  }

  async deleteUser(uid: string) {
    if (isMockMode) {
      delete MOCK_PROFILES[uid];
      return { success: true };
    }
    try {
      const userRef = doc(db!, this.collectionName, uid);
      await deleteDoc(userRef);
      return { success: true };
    } catch (error: any) {
      console.error('Delete user error:', error);
      return { success: false, error };
    }
  }

  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const sessionId = useSessionStore.getState().activeSessionId;
    if (isMockMode) {
      return Object.values(MOCK_PROFILES).filter((p) => p.role === role && p.isActive && (!sessionId || p.sessionId === sessionId || !p.sessionId));
    }
    try {
      const q = query(
        collection(db!, this.collectionName),
        where('role', '==', role),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      console.error('Get users by role error:', error);
      return [];
    }
  }

  async searchUsers(searchTerm: string, role?: UserRole): Promise<UserProfile[]> {
    if (isMockMode) {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(MOCK_PROFILES).filter((p) => {
        const matchesRole = role ? p.role === role : true;
        const matchesSearch =
          p.displayName.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower);
        return matchesRole && matchesSearch;
      });
    }
    try {
      let q = query(collection(db!, this.collectionName));
      if (role) q = query(q, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
      const searchLower = searchTerm.toLowerCase();
      return users.filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }

  async getPaginatedUsers(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<PaginatedResponse<UserProfile>> {
    if (isMockMode) {
      const all = Object.values(MOCK_PROFILES);
      return {
        data: all.slice(0, pageSize),
        pagination: { currentPage: 1, totalPages: 1, totalItems: all.length, hasNext: false, hasPrevious: false },
      };
    }
    try {
      let q = query(collection(db!, this.collectionName), orderBy('createdAt', 'desc'), limit(pageSize + 1));
      if (lastDoc) q = query(q, startAfter(lastDoc));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.slice(0, pageSize).map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
      return {
        data: users,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: users.length,
          hasNext: querySnapshot.docs.length > pageSize,
          hasPrevious: !!lastDoc,
        },
      };
    } catch (error) {
      console.error('Get paginated users error:', error);
      return {
        data: [],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false },
      };
    }
  }
}

export const userService = new UserService();
