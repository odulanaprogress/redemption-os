import { useState, useEffect, useCallback } from 'react';

// Database configurations
const DB_NAME = 'crowd-management-db';
const DB_VERSION = 1;

export interface IncidentReport {
  id?: string;
  zone: string;
  incidentType: string;
  description: string;
  phone: string;
  timestamp: number;
}

export interface SyncResponse {
  lastSyncTime: number;
  venueMaps: { id: string; geojson: any; updatedAt: number }[];
  zones: { id: string; name: string; capacity: number; attendees: number; status: string; updatedAt: number }[];
  snapshots: { id: string; timestamp: number; density: any; updatedAt: number }[];
}

// Native Promise-based IndexedDB Wrapper to replace 'idb' package
export interface IDBPDatabase {
  getAll(storeName: string): Promise<any[]>;
  get(storeName: string, key: string): Promise<any>;
  delete(storeName: string, key: any): Promise<void>;
  add(storeName: string, value: any): Promise<any>;
  put(storeName: string, value: any): Promise<any>;
  transaction(storeNames: string[], mode: 'readonly' | 'readwrite'): {
    objectStore(name: string): {
      put(value: any): Promise<void>;
    };
    done: Promise<void>;
  };
}

class NativeDB implements IDBPDatabase {
  private db: IDBDatabase;
  constructor(db: IDBDatabase) {
    this.db = db;
  }

  getAll(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  get(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  delete(storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  add(storeName: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.add(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  put(storeName: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  transaction(storeNames: string[], mode: 'readonly' | 'readwrite') {
    const tx = this.db.transaction(storeNames, mode);
    return {
      objectStore: (name: string) => {
        const store = tx.objectStore(name);
        return {
          put: (value: any) => {
            return new Promise<void>((resolve, reject) => {
              const req = store.put(value);
              req.onsuccess = () => resolve();
              req.onerror = () => reject(req.error);
            });
          }
        };
      },
      done: new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(new Error('Transaction aborted'));
      })
    };
  }
}

// Helper to initialize the DB using native window.indexedDB
async function initDB(): Promise<IDBPDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('venue-maps')) {
        db.createObjectStore('venue-maps', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('zone-definitions')) {
        db.createObjectStore('zone-definitions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('density-snapshots')) {
        db.createObjectStore('density-snapshots', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('incident-reports-queue')) {
        db.createObjectStore('incident-reports-queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sync-metadata')) {
        db.createObjectStore('sync-metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(new NativeDB(request.result));
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Cached state to expose to the UI
  const [cachedVenueMaps, setCachedVenueMaps] = useState<any[]>([]);
  const [cachedZones, setCachedZones] = useState<any[]>([]);
  const [cachedSnapshots, setCachedSnapshots] = useState<any[]>([]);

  // Load cached data from IndexedDB
  const loadCachedData = useCallback(async () => {
    try {
      const db = await initDB();
      
      const maps = await db.getAll('venue-maps');
      const zones = await db.getAll('zone-definitions');
      const snapshots = await db.getAll('density-snapshots');
      const meta = await db.get('sync-metadata', 'lastSyncTime');
      
      setCachedVenueMaps(maps);
      setCachedZones(zones);
      setCachedSnapshots(snapshots);
      if (meta?.value) {
        setLastSyncTime(new Date(meta.value));
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to load cache from IndexedDB:', error);
    }
  }, []);

  // Sync queued incident reports to the server (Local wins)
  const syncQueuedIncidents = useCallback(async (db: IDBPDatabase) => {
    const queue = await db.getAll('incident-reports-queue');
    if (queue.length === 0) return;

    console.log(`[OfflineSync] Syncing ${queue.length} queued incident report(s)...`);
    
    for (const incident of queue) {
      try {
        const response = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incident),
        });

        if (response.ok || response.status === 201 || response.status === 202) {
          // Remove from queue on successful sync
          await db.delete('incident-reports-queue', incident.id);
          console.log(`[OfflineSync] Successfully synced queued incident:`, incident);
        } else {
          console.error(`[OfflineSync] Failed to sync incident ${incident.id}. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`[OfflineSync] Error sending queued incident ${incident.id}:`, error);
        break; // Stop syncing remainder if network error occurs again
      }
    }
  }, []);

  // Sync delta changes from server (Server wins)
  const syncDeltaFromServer = useCallback(async (db: IDBPDatabase) => {
    setIsSyncing(true);
    setSyncProgress(10);

    try {
      const meta = await db.get('sync-metadata', 'lastSyncTime');
      const sinceParam = meta?.value ? `?since=${meta.value}` : '';
      
      setSyncProgress(30);
      const response = await fetch(`/api/sync${sinceParam}`);
      if (!response.ok) {
        throw new Error(`Sync API responded with status ${response.status}`);
      }

      setSyncProgress(60);
      const data: SyncResponse = await response.json();
      
      // Update IndexedDB (Server wins - overwrite existing items with updated ones)
      const tx = db.transaction(['venue-maps', 'zone-definitions', 'density-snapshots', 'sync-metadata'], 'readwrite');
      
      for (const map of data.venueMaps) {
        await tx.objectStore('venue-maps').put(map);
      }
      for (const zone of data.zones) {
        await tx.objectStore('zone-definitions').put(zone);
      }
      for (const snapshot of data.snapshots) {
        await tx.objectStore('density-snapshots').put(snapshot);
      }

      const syncTime = data.lastSyncTime || Date.now();
      await tx.objectStore('sync-metadata').put({ key: 'lastSyncTime', value: syncTime });
      
      await tx.done;

      setSyncProgress(100);
      setLastSyncTime(new Date(syncTime));
      
      // Reload UI cached states
      await loadCachedData();
      console.log('[OfflineSync] Delta sync complete. Synced at:', new Date(syncTime));
    } catch (error) {
      console.error('[OfflineSync] Delta sync failed:', error);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  }, [loadCachedData]);

  // Run full sync process
  const triggerSync = useCallback(async () => {
    try {
      const db = await initDB();
      // 1. Sync local queued incidents first (Local wins)
      await syncQueuedIncidents(db);
      // 2. Fetch server updates (Server wins for zone/map data)
      await syncDeltaFromServer(db);
    } catch (error) {
      console.error('[OfflineSync] Sync execution failed:', error);
    }
  }, [syncQueuedIncidents, syncDeltaFromServer]);

  // Handle local incident report queueing or sending
  const queueIncidentReport = useCallback(async (incident: Omit<IncidentReport, 'timestamp'>) => {
    const db = await initDB();
    const incidentData: IncidentReport = {
      ...incident,
      timestamp: Date.now(),
    };

    if (!navigator.onLine) {
      // Offline: Queue locally
      await db.add('incident-reports-queue', incidentData);
      console.log('[OfflineSync] Incident report queued locally (Offline):', incidentData);
      return { success: true, queued: true, message: 'Offline mode. Report queued locally.' };
    } else {
      // Online: Attempt immediate submission
      try {
        const response = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incidentData),
        });

        if (response.ok) {
          const result = await response.json();
          // Keep a log of last-known locally or trigger sync
          triggerSync();
          return { success: true, queued: false, data: result };
        } else {
          // If server fails, fallback to queue
          await db.add('incident-reports-queue', incidentData);
          console.warn('[OfflineSync] Server error, incident report queued locally instead:', incidentData);
          return { success: true, queued: true, message: 'Server unavailable. Report queued.' };
        }
      } catch (error) {
        // Network error, queue it
        await db.add('incident-reports-queue', incidentData);
        console.warn('[OfflineSync] Fetch failed, queued incident report locally:', incidentData);
        return { success: true, queued: true, message: 'Connection failed. Report queued.' };
      }
    }
  }, [triggerSync]);

  // Listen to network status events and postMessages from Service Worker
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[OfflineSync] Connection restored. Triggering sync...');
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[OfflineSync] Browser went offline.');
    };

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        console.log('[OfflineSync] SW background sync completed, refreshing caches.');
        loadCachedData();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Initial load and sync on startup if online
    loadCachedData().then(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [loadCachedData, triggerSync]);

  return {
    isOnline,
    lastSyncTime,
    isSyncing,
    syncProgress,
    queueIncidentReport,
    cachedVenueMaps,
    cachedZones,
    cachedSnapshots,
    triggerSync,
  };
}
