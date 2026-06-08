import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Offline Context
interface OfflineContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  retryConnection: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      setIsSyncing(true);

      setTimeout(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date());
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = () => {
    if (!isOnline) {
      setIsReconnecting(true);

      setTimeout(() => {
        if (navigator.onLine) {
          setIsOnline(true);
          setIsReconnecting(false);
          setIsSyncing(true);
          setTimeout(() => {
            setIsSyncing(false);
            setLastSyncTime(new Date());
          }, 2000);
        } else {
          setIsReconnecting(false);
        }
      }, 1500);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isReconnecting,
        isSyncing,
        lastSyncTime,
        retryConnection
      }}
    >
      {children}
      <OfflineBanner />
    </OfflineContext.Provider>
  );
}

export function OfflineBanner() {
  const { isOnline, isReconnecting, isSyncing, retryConnection } = useOffline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-6 py-4 backdrop-blur-lg shadow-lg shadow-red-500/20 min-w-[320px]">
            <div className="flex items-center gap-3">
              <WifiOff className="w-6 h-6 text-red-400" />
              <div className="flex-1">
                <div className="font-semibold text-red-100">You are offline</div>
                <div className="text-sm text-red-200/80">
                  {isReconnecting ? 'Attempting to reconnect...' : 'Check your internet connection'}
                </div>
              </div>
              {!isReconnecting && (
                <button
                  onClick={retryConnection}
                  className="bg-red-500/30 hover:bg-red-500/40 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-red-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
              {isReconnecting && (
                <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {isSyncing && (
        <motion.div
          key="syncing-banner"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl px-6 py-4 backdrop-blur-lg shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div>
                <div className="font-semibold text-blue-100">Syncing latest updates</div>
                <div className="text-sm text-blue-200/80">Fetching real-time data...</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ReconnectBanner() {
  const { isOnline } = useOffline();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-6 py-4 backdrop-blur-lg shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="font-semibold text-emerald-100">Back online</div>
                <div className="text-sm text-emerald-200/80">Connection restored successfully</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OfflineFallback({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isOnline } = useOffline();

  if (!isOnline && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function CachedContentIndicator() {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-400" />
      <div className="flex-1">
        <div className="font-medium text-yellow-100">Viewing cached content</div>
        <div className="text-sm text-yellow-200/80">Some features may be limited while offline</div>
      </div>
    </div>
  );
}

export function ConnectionStatus() {
  const { isOnline, lastSyncTime } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/60">
            {lastSyncTime
              ? `Synced ${new Date(lastSyncTime).toLocaleTimeString()}`
              : 'Connected'}
          </span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-red-400 rounded-full" />
          <span className="text-sm text-white/60">Offline</span>
        </>
      )}
    </div>
  );
}

export function SyncIndicator() {
  const { isSyncing } = useOffline();

  if (!isSyncing) return null;

  return (
    <div className="flex items-center gap-2 text-blue-400">
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span className="text-sm">Syncing...</span>
    </div>
  );
}

// Hook to use cached data when offline
export function useCachedData<T>(key: string, fetcher: () => Promise<T>, fallbackData?: T) {
  const { isOnline } = useOffline();
  const [data, setData] = useState<T | undefined>(fallbackData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isOnline) {
        setIsLoading(true);
        try {
          const result = await fetcher();
          setData(result);
          localStorage.setItem(`cached_${key}`, JSON.stringify(result));
          setError(null);
        } catch (err) {
          setError(err as Error);
          const cached = localStorage.getItem(`cached_${key}`);
          if (cached) {
            setData(JSON.parse(cached));
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        const cached = localStorage.getItem(`cached_${key}`);
        if (cached) {
          setData(JSON.parse(cached));
        }
      }
    };

    loadData();
  }, [key, isOnline]);

  return { data, isLoading, error, isOffline: !isOnline };
}
