/**
 * Real-time location sharing service — bounded to Redemption City / RCCG Camp.
 *
 * Attendees opt-in to share their GPS. Positions are written to:
 *   user_locations/{userId}  — one document per user, overwritten in place
 *
 * Admins/security subscribe with onSnapshot to receive all live positions
 * and render a real-time crowd density heatmap.
 */

import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { RCCG_CAMP_BOUNDS, isWithinCampBounds } from '../config/locations';
import type { LatLng } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UserLocationDoc {
  uid: string;
  lat: number;
  lng: number;
  accuracy?: number;          // GPS accuracy in metres
  displayName?: string;
  role?: string;
  updatedAt: Date;
  isActive: boolean;          // false = stopped sharing
}

// Stale threshold — positions older than this are considered inactive (5 minutes)
const STALE_MS = 5 * 60 * 1000;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  return new Date(val);
}

// ─── Service ───────────────────────────────────────────────────────────────────

export class LocationService {
  private watchId: number | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  // ── Attendee: share location ──────────────────────────────────────────────

  /**
   * Start sharing the current user's GPS position.
   * Positions outside the RCCG camp boundary are silently ignored.
   * Calls the watchPosition API so every GPS update writes to Firestore.
   *
   * @returns cleanup function — call it to stop sharing
   */
  startSharing(
    uid: string,
    displayName: string,
    role: string,
    onStatus?: (msg: string) => void
  ): () => void {
    if (!navigator.geolocation) {
      onStatus?.('GPS not supported on this device');
      return () => {};
    }

    const writeLocation = (pos: GeolocationPosition) => {
      const loc: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      // Enforce camp bounds — only write if inside Redemption City
      if (!isWithinCampBounds(loc)) {
        onStatus?.('Outside Redemption City bounds — not sharing');
        return;
      }

      setDoc(doc(db!, 'user_locations', uid), {
        uid,
        lat: loc.lat,
        lng: loc.lng,
        accuracy: pos.coords.accuracy,
        displayName,
        role,
        updatedAt: serverTimestamp(),
        isActive: true,
      }).catch((err) => console.warn('[LocationService] write error:', err));

      onStatus?.('📍 Sharing your location with camp safety team');
    };

    this.watchId = navigator.geolocation.watchPosition(
      writeLocation,
      (err) => onStatus?.(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => this.stopSharing(uid);
  }

  /**
   * Stop sharing — marks the document as inactive and clears the GPS watcher.
   */
  async stopSharing(uid: string): Promise<void> {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    try {
      await setDoc(
        doc(db!, 'user_locations', uid),
        { isActive: false, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (_) {
      // Best-effort
    }
  }

  // ── Admin / Security: subscribe to all live locations ──────────────────────

  /**
   * Subscribe to all active user locations inside Redemption City.
   * Fires immediately with current data then on every change.
   *
   * @returns unsubscribe function
   */
  subscribeToLiveLocations(
    callback: (locations: UserLocationDoc[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db!, 'user_locations'),
      where('isActive', '==', true)
    );

    return onSnapshot(
      q,
      (snap) => {
        const now = Date.now();
        const locations: UserLocationDoc[] = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<UserLocationDoc, 'updatedAt'>),
            updatedAt: toDate(d.data().updatedAt),
          }))
          .filter((loc) => {
            // Filter stale positions (> 5 minutes old)
            if (now - loc.updatedAt.getTime() > STALE_MS) return false;
            // Enforce camp bounds
            return isWithinCampBounds({ lat: loc.lat, lng: loc.lng });
          });

        callback(locations);
      },
      (err) => onError?.(err)
    );
  }
}

export const locationService = new LocationService();
