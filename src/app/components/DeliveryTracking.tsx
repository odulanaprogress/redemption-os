import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Package, Truck, CheckCircle, Clock, Phone, Navigation, ArrowLeft, Star, Zap } from 'lucide-react';
import { mockOrders, type Order } from '../data/marketplace';

export default function DeliveryTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driverProgress, setDriverProgress] = useState(0.35);
  const [eta, setEta] = useState(7);
  const [liveActivity, setLiveActivity] = useState<string[]>([]);

  const order = id ? mockOrders.find(o => o.id === id) : undefined;

  useEffect(() => {
    if (order?.status !== 'in_transit') return;
    const interval = setInterval(() => {
      setDriverProgress(prev => {
        const next = Math.min(prev + 0.02, 0.95);
        return next;
      });
      setEta(prev => Math.max(1, prev - 1));
    }, 3000);

    const activityMessages = [
      'Driver confirmed pickup ✓',
      'Route optimized by AI',
      'Driver approaching your building',
      'ETA updated',
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      if (msgIdx < activityMessages.length) {
        setLiveActivity(prev => [activityMessages[msgIdx], ...prev].slice(0, 4));
        msgIdx++;
      }
    }, 6000);

    return () => { clearInterval(interval); clearInterval(msgInterval); };
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-white/60">This delivery doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/marketplace')} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl transition-colors font-medium">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { id: 'preparing', label: 'Preparing', icon: Package },
    { id: 'in_transit', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const statusOrder = ['confirmed', 'preparing', 'in_transit', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Nav */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Live Delivery Tracking</h1>
          <p className="text-white/50">Order #{order.id} · {order.productName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="space-y-4">
            {/* Live Map */}
            <div className="relative aspect-square bg-gradient-to-br from-emerald-950/80 to-blue-950/80 border border-white/10 rounded-2xl overflow-hidden">
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Road paths */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                {/* Roads */}
                <path d="M 0 200 L 400 200" stroke="#ffffff08" strokeWidth="16" fill="none" />
                <path d="M 200 0 L 200 400" stroke="#ffffff08" strokeWidth="16" fill="none" />
                <path d="M 0 300 L 400 100" stroke="#ffffff05" strokeWidth="10" fill="none" />
                <path d="M 100 0 L 300 400" stroke="#ffffff05" strokeWidth="10" fill="none" />

                {/* Route line */}
                {order.status === 'in_transit' && (
                  <motion.path
                    d={`M 80 320 Q 150 180 ${80 + driverProgress * 260} ${320 - driverProgress * 240} 340 80`}
                    stroke="#10b981"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="8 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                )}
              </svg>

              {/* Vendor pin */}
              <motion.div
                className="absolute"
                style={{ left: '20%', top: '80%', transform: 'translate(-50%, -100%)' }}
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
              >
                <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-white/20">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="mt-1 text-xs font-semibold bg-black/80 px-2 py-0.5 rounded whitespace-nowrap text-center">
                  {order.vendorName}
                </div>
              </motion.div>

              {/* Destination pin */}
              <motion.div
                className="absolute"
                style={{ left: '85%', top: '20%', transform: 'translate(-50%, -100%)' }}
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-2 border-white/20"
                >
                  <MapPin className="w-5 h-5 text-white" />
                </motion.div>
                <div className="mt-1 text-xs font-semibold bg-black/80 px-2 py-0.5 rounded whitespace-nowrap text-center">
                  Your Location
                </div>
              </motion.div>

              {/* Driver marker */}
              {order.status === 'in_transit' && (
                <motion.div
                  className="absolute"
                  style={{
                    left: `${20 + driverProgress * 65}%`,
                    top: `${80 - driverProgress * 60}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/50 border-2 border-emerald-300/30 z-10"
                  >
                    <Truck className="w-6 h-6 text-white" />
                  </motion.div>
                  {order.driverName && (
                    <div className="mt-1 text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded whitespace-nowrap text-emerald-300 text-center">
                      {order.driverName}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Live badge */}
              {order.status === 'in_transit' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">LIVE</span>
                </div>
              )}

              {/* ETA badge */}
              {order.status === 'in_transit' && (
                <motion.div
                  key={eta}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-emerald-500 px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/40 text-center"
                >
                  <div className="text-xs text-emerald-100 mb-0.5">Estimated Arrival</div>
                  <div className="text-2xl font-bold">{eta} min</div>
                </motion.div>
              )}

              {/* AI optimization badge */}
              {order.status === 'in_transit' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-purple-400">AI Routed</span>
                </div>
              )}
            </div>

            {/* Driver Info */}
            {order.status === 'in_transit' && order.driverName && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-3">Your Driver</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
                      {order.driverName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{order.driverName}</div>
                      <div className="flex items-center gap-1 text-sm text-white/50">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        4.9 rating
                      </div>
                    </div>
                  </div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 p-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Live activity feed */}
            {liveActivity.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live Activity
                </div>
                <AnimatePresence>
                  {liveActivity.map((msg, i) => (
                    <motion.div
                      key={msg}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1 - i * 0.25, x: 0 }}
                      className="text-sm text-white/70"
                    >
                      {msg}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-5">
            {/* Status Progress */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Delivery Status</h3>
              <div className="space-y-5">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentIdx;
                  const isActive = index === currentIdx;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                              : 'bg-white/10'
                          } ${isActive ? 'ring-2 ring-emerald-500/50' : ''}`}
                        >
                          <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-white/30'}`} />
                        </motion.div>
                        {index < statusSteps.length - 1 && (
                          <div className="absolute left-5 top-11 w-0.5 h-8">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: isCompleted ? '100%' : '0%' }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="bg-emerald-500 w-full"
                            />
                            <div className="absolute inset-0 bg-white/10 -z-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className={`font-semibold ${isCompleted ? 'text-white' : 'text-white/40'}`}>{step.label}</div>
                        {isActive && <div className="text-sm text-emerald-400 mt-0.5">In Progress...</div>}
                        {isCompleted && !isActive && <div className="text-sm text-emerald-400 mt-0.5">Completed ✓</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Product', value: order.productName },
                  { label: 'Quantity', value: order.quantity.toString() },
                  { label: 'Order Date', value: new Date(order.orderDate).toLocaleString() },
                  { label: 'Delivery Address', value: order.deliveryAddress },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-white/50 flex-shrink-0">{row.label}</span>
                    <span className="font-medium text-right">{row.value}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
                  <span className="text-white/50">Total</span>
                  <span className="text-xl font-bold text-emerald-400">${order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Tracking History</h3>
              <div className="space-y-3">
                {order.trackingUpdates.slice().reverse().map((update, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <div className="flex-1 pb-3 border-b border-white/5 last:border-0">
                      <div className="font-medium text-sm">{update.message}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {new Date(update.timestamp).toLocaleString()}
                        {update.location && ` · ${update.location}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Route Optimization */}
            {order.status === 'in_transit' && (
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">AI-Optimized Route Active</div>
                  <div className="text-sm text-white/50">Fastest path recalculated in real-time · Saves ~3 min</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
