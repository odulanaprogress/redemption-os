import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { useOfflineSync } from '../hooks/useOfflineSync';

export function OfflineDetector() {
  const { isOnline, lastSyncTime, isSyncing, syncProgress, triggerSync } = useOfflineSync();
  const [showBanner, setShowBanner] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // Keep online banner visible for 3 seconds after reconnecting
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showBanner && !isSyncing) return null;

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Never';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-500 text-[#0D0D0D] shadow-md'
          : 'bg-amber-500 text-slate-950 shadow-md font-semibold'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {!isOnline && <WifiOff className="h-5 w-5 animate-pulse text-slate-900" />}
          {isOnline ? (
            <span className="text-sm font-medium">🌐 Back online! Resync completed.</span>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-sm font-bold">Offline Mode</span>
              <span className="text-xs opacity-90 font-normal">
                Last synced: {formattedTime}
              </span>
            </div>
          )}
        </div>

        {/* Sync Progress Indicator */}
        {isSyncing && (
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full text-xs font-mono">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Syncing database ({syncProgress}%)</span>
            <div className="w-16 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300" 
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {!isOnline && !isSyncing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={triggerSync}
            className="text-slate-950 hover:bg-black/10 h-8 font-semibold text-xs border border-slate-950/20"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
}
