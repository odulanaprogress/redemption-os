import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, MapPin, AlertTriangle, Radio, RefreshCw,
  WifiOff, Wifi, Clock, CheckCircle2, XCircle, Loader2,
  Send, Database, Activity, Shield, PhoneCall,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useOfflineSync } from '../../hooks/useOfflineSync';

function getDensityColor(density: number) {
  if (density >= 0.9) return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (density >= 0.7) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
}
function getDensityLabel(density: number) {
  if (density >= 0.9) return 'Critical';
  if (density >= 0.7) return 'High';
  if (density >= 0.5) return 'Moderate';
  return 'Normal';
}
function getDensityBarColor(density: number) {
  if (density >= 0.9) return 'bg-red-500';
  if (density >= 0.7) return 'bg-amber-500';
  return 'bg-emerald-500';
}

const FALLBACK_ZONES = [
  { id: 'zone-main', name: 'Main Sanctuary', capacity: 15000, attendees: 10850, status: 'operational' },
  { id: 'zone-north', name: 'North Wing', capacity: 8000, attendees: 4960, status: 'operational' },
  { id: 'zone-south', name: 'South Wing', capacity: 8000, attendees: 3840, status: 'operational' },
  { id: 'zone-parking', name: 'Parking Lot A', capacity: 1000, attendees: 980, status: 'full' },
];
const FALLBACK_DENSITY: Record<string, number> = {
  'zone-main': 0.72,
  'zone-north': 0.62,
  'zone-south': 0.48,
  'zone-parking': 0.98,
};
const INCIDENT_TYPES = [
  'Medical Emergency', 'Crowd Overcrowding', 'Fire Hazard',
  'Security Issue', 'Unauthorized Access', 'Lost & Found', 'Technical Failure',
];

export function CrowdManagementDashboard() {
  const navigate = useNavigate();
  const { isOnline, lastSyncTime, isSyncing, syncProgress, cachedZones, cachedSnapshots, triggerSync, queueIncidentReport } = useOfflineSync();

  const zones = cachedZones.length > 0 ? cachedZones : FALLBACK_ZONES;
  const latestSnapshot = cachedSnapshots.length > 0 ? cachedSnapshots[cachedSnapshots.length - 1] : { density: FALLBACK_DENSITY };
  const densityMap: Record<string, number> = latestSnapshot?.density ?? FALLBACK_DENSITY;

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentZone, setIncidentZone] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentPhone, setIncidentPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; queued: boolean; message: string } | null>(null);

  async function handleIncidentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incidentZone || !incidentType) return;
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const result = await queueIncidentReport({ zone: incidentZone, incidentType, description: incidentDesc, phone: incidentPhone });
      setSubmissionResult({
        success: result.success, queued: result.queued,
        message: result.queued ? '📥 Report queued locally — will auto-sync when online.' : '✅ Report submitted to server successfully.',
      });
      setTimeout(() => { setIncidentZone(''); setIncidentType(''); setIncidentDesc(''); setIncidentPhone(''); setShowIncidentForm(false); setSubmissionResult(null); }, 3000);
    } catch {
      setSubmissionResult({ success: false, queued: false, message: '❌ Failed to queue report. Please try again.' });
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080f] via-[#0a0e1a] to-[#060d1a]">
      <div className="sticky top-0 z-30 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="text-white/60 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Crowd Management</h1>
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />Live
                </Badge>
              </div>
              <p className="text-xs text-white/50">Offline-first crowd density monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 animate-pulse" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <Button size="sm" variant="ghost" onClick={triggerSync} disabled={isSyncing || !isOnline} className="text-white/60 hover:text-white h-8 w-8 p-0">
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {isSyncing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-sky-300 mb-1">
                <Loader2 className="h-3 w-3 animate-spin" />Syncing data from server... {syncProgress}%
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" animate={{ width: `${syncProgress}%` }} transition={{ duration: 0.3 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
        <AnimatePresence>
          {!isOnline && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-amber-200 text-sm">Offline Mode Active</p>
                <p className="text-xs text-amber-300/70 mt-0.5">Showing last-known crowd data from local IndexedDB cache. Incident reports will be queued and auto-synced when connectivity returns.</p>
                {lastSyncTime && <p className="text-xs text-amber-400/60 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Last synced: {lastSyncTime.toLocaleString()}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 text-xs text-white/40 px-1">
          <Database className="h-3.5 w-3.5" />
          <span>{cachedZones.length > 0 ? `Serving ${cachedZones.length} zones from IndexedDB cache` : 'Serving seeded fallback data — sync to load live data'}</span>
          {lastSyncTime && (<><span className="text-white/20">·</span><Clock className="h-3.5 w-3.5" /><span>Synced {lastSyncTime.toLocaleTimeString()}</span></>)}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-base">Zone Density Heatmap</h2>
            <Badge className="bg-white/5 border-white/10 text-white/60 text-xs">{zones.length} zones</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {zones.map((zone, i) => {
              const density = densityMap[zone.id] ?? (zone.attendees / zone.capacity);
              const pct = Math.round(density * 100);
              return (
                <motion.div key={zone.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                  <Card className="bg-[#0f1520]/80 backdrop-blur border-white/10 p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border ${getDensityColor(density)}`}><MapPin className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-medium text-white leading-tight">{zone.name}</p>
                          <p className="text-xs text-white/40">{zone.attendees?.toLocaleString() ?? '—'} people</p>
                        </div>
                      </div>
                      <Badge className={`text-xs border ${getDensityColor(density)}`}>{getDensityLabel(density)}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-white/40">Occupancy</span><span className="text-white font-mono">{pct}%</span></div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full ${getDensityBarColor(density)}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} />
                      </div>
                      <div className="flex justify-between text-xs text-white/30"><span>0</span><span>{zone.capacity?.toLocaleString() ?? '—'} cap.</span></div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: AlertTriangle, label: 'Report Incident', sublabel: 'Works offline', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40', onClick: () => setShowIncidentForm(true) },
            { icon: Radio, label: 'Broadcast Alert', sublabel: 'Notify all zones', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40', onClick: () => navigate('/admin?tab=broadcast') },
            { icon: Shield, label: 'Emergency Protocol', sublabel: 'Activate evacuation', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40', onClick: () => navigate('/emergency') },
            { icon: PhoneCall, label: 'USSD Fallback', sublabel: 'No-data channel', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40', onClick: () => navigate('/admin?tab=system') },
          ].map((action, i) => (
            <motion.div key={i} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
              <Card onClick={action.onClick} className={`cursor-pointer border p-4 ${action.bg} transition-all`}>
                <div className="flex flex-col items-center text-center gap-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <div><p className="text-sm font-medium text-white">{action.label}</p><p className="text-xs text-white/40">{action.sublabel}</p></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-[#0f1520]/60 border-white/10 p-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-sky-400" />Density Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            {[{ label: 'Normal (0–50%)', dot: 'bg-emerald-400' }, { label: 'Moderate (50–70%)', dot: 'bg-emerald-400' }, { label: 'High (70–90%)', dot: 'bg-amber-400' }, { label: 'Critical (90%+)', dot: 'bg-red-400' }].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-white/60"><div className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />{item.label}</div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/20 to-[#0f1520] border-indigo-500/20 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Database className="h-4 w-4 text-indigo-400" />Offline System Status</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'IndexedDB Cache', value: cachedZones.length > 0 ? 'Active' : 'Empty', icon: Database, ok: cachedZones.length > 0 },
              { label: 'Service Worker', value: 'serviceWorker' in navigator ? 'Registered' : 'Unavailable', icon: Shield, ok: 'serviceWorker' in navigator },
              { label: 'Connectivity', value: isOnline ? 'Online' : 'Offline', icon: isOnline ? Wifi : WifiOff, ok: isOnline },
              { label: 'Last Sync', value: lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never', icon: Clock, ok: !!lastSyncTime },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1"><item.icon className="h-3.5 w-3.5 text-white/40" /><span className="text-xs text-white/40">{item.label}</span></div>
                <div className="flex items-center gap-1.5">
                  {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-amber-400" />}
                  <span className={`text-sm font-medium ${item.ok ? 'text-white' : 'text-amber-300'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showIncidentForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowIncidentForm(false)} />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1219] border-t border-white/10 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" />Report Incident</h2>
                  <p className="text-xs text-white/50 mt-0.5">{isOnline ? 'Report will be sent to server immediately.' : '⚡ Offline: report will be saved locally and auto-synced.'}</p>
                </div>
                <Badge className={isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}>{isOnline ? 'Online' : 'Queued'}</Badge>
              </div>
              <AnimatePresence>
                {submissionResult && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-4 p-3 rounded-lg border text-sm ${submissionResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                    {submissionResult.message}
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Zone <span className="text-red-400">*</span></label>
                  <select value={incidentZone} onChange={e => setIncidentZone(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none">
                    <option value="" className="bg-[#0d1219]">Select a zone...</option>
                    {zones.map(z => (<option key={z.id} value={z.name} className="bg-[#0d1219]">{z.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Incident Type <span className="text-red-400">*</span></label>
                  <select value={incidentType} onChange={e => setIncidentType(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none">
                    <option value="" className="bg-[#0d1219]">Select type...</option>
                    {INCIDENT_TYPES.map(t => (<option key={t} value={t} className="bg-[#0d1219]">{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Description</label>
                  <textarea value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)} rows={3} placeholder="Brief description of the incident..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Reporter Phone (for SMS confirmation)</label>
                  <input type="tel" value={incidentPhone} onChange={e => setIncidentPhone(e.target.value)} placeholder="+234 xxx xxx xxxx" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="ghost" onClick={() => setShowIncidentForm(false)} className="flex-1 text-white/60 border border-white/10">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !incidentZone || !incidentType} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {isSubmitting ? 'Submitting...' : isOnline ? 'Submit Report' : 'Queue Report'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
