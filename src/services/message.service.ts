/**
 * Real-time messaging + broadcast service backed by Firebase Firestore.
 *
 * Collections:
 *   broadcasts  — admin-created one-way announcements (visible to all)
 *   messages    — per-channel two-way messages (subcollection or flat collection)
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'video' | 'file';
export type BroadcastType = 'operational' | 'alert' | 'emergency' | 'info';

export interface Message {
  id: string;
  channelId: string;        // e.g. 'general', 'emergency', 'zone-a'
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  text: string;
  mediaUrl?: string;        // Cloudinary secure_url for image/video/file
  mediaPublicId?: string;   // Cloudinary public_id
  mediaType?: string;       // MIME type
  createdAt: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

export interface Broadcast {
  id: string;
  type: BroadcastType;
  title: string;
  message: string;
  zone: string;
  createdBy: string;
  createdByName: string;
  mediaUrl?: string;
  createdAt: Date;
  pinned?: boolean;
}

// ─── In-memory mocks ─────────────────────────────────────────────────────────

const mockBroadcasts: Broadcast[] = [
  {
    id: 'bc-001',
    type: 'operational',
    title: 'Service Starting Soon',
    message: 'Main service will begin in 10 minutes. Please find your seats.',
    zone: 'All Zones',
    createdBy: 'admin-001',
    createdByName: 'Admin',
    createdAt: new Date(Date.now() - 2 * 60000),
    pinned: true,
  },
  {
    id: 'bc-002',
    type: 'alert',
    title: 'Parking Update',
    message: 'Lot B is now at capacity. Please use Lot C or D.',
    zone: 'Parking',
    createdBy: 'admin-001',
    createdByName: 'Admin',
    createdAt: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'bc-003',
    type: 'info',
    title: 'Volunteer Coordination',
    message: 'All volunteers report to check-in stations for assignment updates.',
    zone: 'Volunteers',
    createdBy: 'admin-001',
    createdByName: 'Admin',
    createdAt: new Date(Date.now() - 25 * 60000),
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    channelId: 'general',
    senderId: 'admin-001',
    senderName: 'Admin',
    type: 'text',
    text: 'Welcome to the Redemption OS Communication Center!',
    createdAt: new Date(Date.now() - 30 * 60000),
  },
  {
    id: 'msg-002',
    channelId: 'general',
    senderId: 'security-001',
    senderName: 'Security Team',
    type: 'text',
    text: 'All gates are open and operational.',
    createdAt: new Date(Date.now() - 20 * 60000),
  },
];

let mockIdCounter = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  return new Date(val);
}

// ─── Service class ────────────────────────────────────────────────────────────

export class MessageService {
  // ── Broadcasts ─────────────────────────────────────────────────────────────

  /** Subscribe to live broadcasts (newest first) */
  subscribeToBroadcasts(
    callback: (broadcasts: Broadcast[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (isMockMode) {
      callback([...mockBroadcasts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      const interval = setInterval(() => {
        callback([...mockBroadcasts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }, 8000);
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db!, 'broadcasts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      q,
      (snap) => {
        const data: Broadcast[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toDate(d.data().createdAt),
        })) as Broadcast[];
        callback(data);
      },
      (err) => onError?.(err)
    );
  }

  /** Create a new broadcast (admin only) */
  async createBroadcast(
    data: Omit<Broadcast, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; data?: Broadcast; error?: string }> {
    if (isMockMode) {
      const b: Broadcast = {
        id: `bc-${++mockIdCounter}`,
        ...data,
        createdAt: new Date(),
      };
      mockBroadcasts.unshift(b);
      return { success: true, data: b };
    }

    try {
      const ref = await addDoc(collection(db!, 'broadcasts'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return {
        success: true,
        data: { id: ref.id, ...data, createdAt: new Date() },
      };
    } catch (err: any) {
      console.error('[MessageService] createBroadcast error:', err);
      return { success: false, error: err.message };
    }
  }

  /** Delete a broadcast */
  async deleteBroadcast(id: string): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const idx = mockBroadcasts.findIndex((b) => b.id === id);
      if (idx > -1) mockBroadcasts.splice(idx, 1);
      return { success: true };
    }
    try {
      await deleteDoc(doc(db!, 'broadcasts', id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ── Channel Messages ────────────────────────────────────────────────────────

  /** Subscribe to live messages in a channel (newest last) */
  subscribeToChannel(
    channelId: string,
    callback: (messages: Message[]) => void,
    onError?: (err: Error) => void,
    maxMessages = 100
  ): () => void {
    if (isMockMode) {
      const filtered = () =>
        [...mockMessages]
          .filter((m) => m.channelId === channelId && !m.deleted)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      callback(filtered());
      const interval = setInterval(() => callback(filtered()), 5000);
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db!, 'messages'),
      where('channelId', '==', channelId),
      orderBy('createdAt', 'asc'),
      limit(maxMessages)
    );

    return onSnapshot(
      q,
      (snap) => {
        const data: Message[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: toDate(d.data().createdAt),
            updatedAt: d.data().updatedAt ? toDate(d.data().updatedAt) : undefined,
          }))
          .filter((m) => !m.deleted) as Message[];
        callback(data);
      },
      (err) => onError?.(err)
    );
  }

  /** Send a message to a channel */
  async sendMessage(
    payload: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>
  ): Promise<{ success: boolean; data?: Message; error?: string }> {
    if (isMockMode) {
      const m: Message = {
        id: `msg-${++mockIdCounter}`,
        ...payload,
        createdAt: new Date(),
      };
      mockMessages.push(m);
      return { success: true, data: m };
    }

    try {
      const ref = await addDoc(collection(db!, 'messages'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      return {
        success: true,
        data: { id: ref.id, ...payload, createdAt: new Date() },
      };
    } catch (err: any) {
      console.error('[MessageService] sendMessage error:', err);
      return { success: false, error: err.message };
    }
  }

  /** Soft-delete a message */
  async deleteMessage(id: string): Promise<{ success: boolean; error?: string }> {
    if (isMockMode) {
      const m = mockMessages.find((x) => x.id === id);
      if (m) m.deleted = true;
      return { success: true };
    }
    try {
      await updateDoc(doc(db!, 'messages', id), { deleted: true, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /** Get available channels (static list – extend for dynamic channels) */
  getChannels() {
    return [
      { id: 'general', label: 'General', icon: '💬' },
      { id: 'emergency', label: 'Emergency', icon: '🚨' },
      { id: 'volunteers', label: 'Volunteers', icon: '🙋' },
      { id: 'logistics', label: 'Logistics', icon: '📦' },
      { id: 'zone-a', label: 'Zone A', icon: '📍' },
      { id: 'zone-b', label: 'Zone B', icon: '📍' },
    ];
  }
}

export const messageService = new MessageService();
