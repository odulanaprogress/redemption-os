import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../app/components/ui/button';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OFFLINE] 🌐 Back online');
      setIsOnline(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      console.log('[OFFLINE] 📡 Connection lost');
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline
          ? 'bg-[#10b981] text-white'
          : 'bg-amber-500/95 backdrop-blur-lg text-black'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isOnline && <WifiOff className="h-5 w-5" />}
          <span className="font-medium">
            {isOnline ? '✅ Back online!' : '⚠️ No internet connection'}
          </span>
          {!isOnline && (
            <span className="text-sm opacity-80">
              Some features may be unavailable
            </span>
          )}
        </div>
        {!isOnline && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="text-black hover:bg-black/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
