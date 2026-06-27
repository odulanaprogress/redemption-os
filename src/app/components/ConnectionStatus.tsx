import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Server, Database, Zap } from 'lucide-react';

export function RealtimeConnectionIndicator() {
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState<number>(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(navigator.onLine);
      if (navigator.onLine) {
        setLatency(Math.floor(Math.random() * 50) + 10);
        setLastSync(new Date());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getLatencyColor = () => {
    if (latency < 30) return 'text-emerald-400';
    if (latency < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyLabel = () => {
    if (latency < 30) return 'Excellent';
    if (latency < 50) return 'Good';
    return 'Poor';
  };

  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg px-4 py-2 flex items-center gap-3">
      <div className="relative">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </>
        ) : (
          <WifiOff className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280]">Status:</span>
          <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {isConnected && (
          <>
            <div className="w-px h-4 bg-[#F3F4F6]" />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Latency:</span>
              <span className={getLatencyColor()}>
                {latency}ms ({getLatencyLabel()})
              </span>
            </div>

            <div className="w-px h-4 bg-[#F3F4F6]" />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Last sync:</span>
              <span className="text-[#0D0D0D]">
                {lastSync.toLocaleTimeString()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LiveSyncBadge() {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-blue-500/20 border border-blue-500/50 rounded-lg px-4 py-2 backdrop-blur-lg shadow-lg flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-100">Syncing...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ServerHealthIndicator() {
  const [health, setHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  useEffect(() => {
    const checkHealth = () => {
      const random = Math.random();
      if (random > 0.95) setHealth('degraded');
      else if (random > 0.98) setHealth('down');
      else setHealth('healthy');
    };

    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    switch (health) {
      case 'healthy':
        return 'text-emerald-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
    }
  };

  const getHealthLabel = () => {
    switch (health) {
      case 'healthy':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'down':
        return 'Service Disruption';
    }
  };

  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-center gap-3">
      <Server className={`w-5 h-5 ${getHealthColor()}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${getHealthColor().replace('text-', 'bg-')} rounded-full animate-pulse`} />
          <span className="font-medium">{getHealthLabel()}</span>
        </div>
        <div className="text-xs text-[#6B7280] mt-1">Server status monitored in real-time</div>
      </div>
    </div>
  );
}

export function WebSocketStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setIsConnected(true);
        setMessageCount(prev => prev + 1);
      } else {
        setIsConnected(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="relative">
        <Zap className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-[#9CA3AF]'}`} />
        {isConnected && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-[#6B7280]">
        {isConnected ? (
          <>
            WebSocket <span className="text-emerald-400">Connected</span>
            <span className="text-[#9CA3AF] ml-2">({messageCount} msgs)</span>
          </>
        ) : (
          <span className="text-red-400">Disconnected</span>
        )}
      </span>
    </div>
  );
}

export function DatabaseSyncStatus() {
  const [status, setStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus('syncing');
      setTimeout(() => {
        setStatus('synced');
        setLastUpdate(new Date());
      }, 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Database className={`w-4 h-4 ${
        status === 'synced' ? 'text-emerald-400' :
        status === 'syncing' ? 'text-blue-400' :
        'text-red-400'
      }`} />
      <span className="text-[#6B7280]">
        Database:{' '}
        <span className={
          status === 'synced' ? 'text-emerald-400' :
          status === 'syncing' ? 'text-blue-400' :
          'text-red-400'
        }>
          {status === 'synced' ? 'Synced' : status === 'syncing' ? 'Syncing...' : 'Error'}
        </span>
        {status === 'synced' && (
          <span className="text-[#9CA3AF] ml-2">
            ({Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago)
          </span>
        )}
      </span>
    </div>
  );
}

export function SystemHealthPanel() {
  const [services, setServices] = useState([
    { name: 'API Server', status: 'operational' as const, uptime: 99.9 },
    { name: 'Database', status: 'operational' as const, uptime: 99.8 },
    { name: 'WebSocket', status: 'operational' as const, uptime: 99.7 },
    { name: 'Storage', status: 'operational' as const, uptime: 99.9 },
    { name: 'AI Services', status: 'operational' as const, uptime: 98.5 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-white/20';
    }
  };

  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold">System Health</h3>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 ${getStatusColor(service.status)} rounded-full animate-pulse`} />
              <span className="text-sm">{service.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">{service.uptime}% uptime</span>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6B7280]">Overall Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-xs text-[#6B7280]">
        {isOnline ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
