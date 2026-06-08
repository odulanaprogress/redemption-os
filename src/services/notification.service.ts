import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';
import { Notification, NotificationType } from '../types';

// In-memory mock notification store
const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'admin-001',
    type: 'emergency',
    title: 'Child Reunification Alert',
    message: 'Child Timmy Okonkwo (QR: CH-2024-001) has been located at Gate B. Parent David Okonkwo notified.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'notif-002',
    userId: 'admin-001',
    type: 'alert',
    title: 'Incident Update',
    message: 'Medical incident at Zone C has been upgraded to HIGH priority. Emergency team dispatched.',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60000),
  },
  {
    id: 'notif-003',
    userId: 'admin-001',
    type: 'info',
    title: 'Order Update',
    message: 'Order #ORD-2024-0145 has been confirmed and is being prepared by Grace Foods.',
    read: true,
    createdAt: new Date(Date.now() - 30 * 60000),
  },
  {
    id: 'notif-004',
    userId: 'admin-001',
    type: 'success',
    title: 'Delivery Completed',
    message: 'Order #ORD-2024-0142 has been successfully delivered to Section D, Row 12.',
    read: true,
    createdAt: new Date(Date.now() - 60 * 60000),
  },
  {
    id: 'notif-005',
    userId: 'admin-001',
    type: 'warning',
    title: 'Admin Announcement',
    message: 'Parking lot C is now at 90% capacity. Attendees are being directed to overflow lot.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60000),
  },
  {
    id: 'notif-006',
    userId: 'parent-001',
    type: 'success',
    title: 'Child Check-In Confirmed',
    message: 'Timmy Okonkwo has been checked into Children\'s Zone A. QR scan recorded at 10:32 AM.',
    read: false,
    createdAt: new Date(Date.now() - 20 * 60000),
  },
  {
    id: 'notif-007',
    userId: 'parent-001',
    type: 'info',
    title: 'Order Dispatched',
    message: 'Your order #ORD-2024-0147 is out for delivery. ETA: 15 minutes.',
    read: true,
    createdAt: new Date(Date.now() - 45 * 60000),
  },
  {
    id: 'notif-008',
    userId: 'security-001',
    type: 'emergency',
    title: 'Lost Child Report',
    message: 'Child reported missing near Stage Area. Description: Boy, age 6, yellow shirt. Please assist.',
    read: false,
    createdAt: new Date(Date.now() - 8 * 60000),
  },
  {
    id: 'notif-009',
    userId: 'security-001',
    type: 'warning',
    title: 'Incident Assigned',
    message: 'You have been assigned to Incident #INC-2024-003 (Security Breach - Zone A). Report immediately.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60000),
  },
  {
    id: 'notif-010',
    userId: 'vendor-001',
    type: 'info',
    title: 'New Order Received',
    message: 'New order #ORD-2024-0148 received for 2x Holy Bible (Large Print). Please prepare.',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60000),
  },
];

let mockIdCounter = mockNotifications.length + 1;

export class NotificationService {
  private collectionName = 'notifications';

  async createNotification(
    userId: string,
    notificationData: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>
  ) {
    if (isMockMode) {
      const notification: Notification = {
        id: `notif-${String(mockIdCounter++).padStart(3, '0')}`,
        userId,
        ...notificationData,
        read: false,
        createdAt: new Date(),
      };
      mockNotifications.unshift(notification);
      return { success: true, data: notification };
    }
    try {
      const notificationRef = doc(collection(db!, this.collectionName));
      const notification: Notification = {
        id: notificationRef.id,
        userId,
        ...notificationData,
        read: false,
        createdAt: new Date(),
      };
      await setDoc(notificationRef, notification);
      return { success: true, data: notification };
    } catch (error: any) {
      console.error('Create notification error:', error);
      return { success: false, error };
    }
  }

  async getNotification(id: string): Promise<Notification | null> {
    if (isMockMode) return mockNotifications.find((n) => n.id === id) ?? null;
    try {
      const notificationRef = doc(db!, this.collectionName, id);
      const notificationSnap = await getDoc(notificationRef);
      if (notificationSnap.exists()) return { id, ...notificationSnap.data() } as Notification;
      return null;
    } catch (error) {
      console.error('Get notification error:', error);
      return null;
    }
  }

  async getNotificationsByUser(userId: string, limitCount: number = 50): Promise<Notification[]> {
    if (isMockMode) {
      return mockNotifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount);
    }
    try {
      const q = query(
        collection(db!, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      console.error('Get notifications by user error:', error);
      return [];
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    if (isMockMode) {
      return mockNotifications
        .filter((n) => n.userId === userId && !n.read)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    try {
      const q = query(
        collection(db!, this.collectionName),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      console.error('Get unread notifications error:', error);
      return [];
    }
  }

  async markAsRead(id: string) {
    if (isMockMode) {
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.read = true;
      return { success: true };
    }
    try {
      const notificationRef = doc(db!, this.collectionName, id);
      await updateDoc(notificationRef, { read: true });
      return { success: true };
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return { success: false, error };
    }
  }

  async markAllAsRead(userId: string) {
    if (isMockMode) {
      mockNotifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
      return { success: true };
    }
    try {
      const notifications = await this.getUnreadNotifications(userId);
      await Promise.all(notifications.map((n) => this.markAsRead(n.id)));
      return { success: true };
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      return { success: false, error };
    }
  }

  async deleteNotification(id: string) {
    if (isMockMode) {
      const idx = mockNotifications.findIndex((n) => n.id === id);
      if (idx > -1) mockNotifications.splice(idx, 1);
      return { success: true };
    }
    try {
      const notificationRef = doc(db!, this.collectionName, id);
      await deleteDoc(notificationRef);
      return { success: true };
    } catch (error: any) {
      console.error('Delete notification error:', error);
      return { success: false, error };
    }
  }

  async deleteOldNotifications(userId: string, daysOld: number = 30) {
    if (isMockMode) return { success: true, deletedCount: 0 };
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const notifications = await this.getNotificationsByUser(userId);
      const old = notifications.filter((n) => n.createdAt < cutoffDate);
      await Promise.all(old.map((n) => this.deleteNotification(n.id)));
      return { success: true, deletedCount: old.length };
    } catch (error: any) {
      console.error('Delete old notifications error:', error);
      return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
