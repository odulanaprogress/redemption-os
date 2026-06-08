import { useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';
import { useNotificationStore } from '../store/notification.store';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { Notification } from '../types';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setLoading,
    setError,
  } = useNotificationStore();

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    if (isMockMode) {
      const load = async () => {
        try {
          const data = await notificationService.getNotificationsByUser(user.uid, 20);
          setNotifications(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      load();
      const interval = setInterval(load, 15000);
      return () => clearInterval(interval);
    }

    // Firebase realtime listener
    const q = query(
      collection(db!, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            createdAt: d.createdAt?.toDate?.() ?? new Date(),
          } as Notification;
        });
        setNotifications(data);
        setLoading(false);
      },
      (err) => {
        console.error('Notification listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotificationsByUser(user.uid);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    markAsRead(id);
    await notificationService.markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    markAllAsRead();
    await notificationService.markAllAsRead(user.uid);
  }, [user?.uid, markAllAsRead]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    const result = await notificationService.deleteNotification(id);
    if (result.success) removeNotification(id);
  }, [removeNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
};
