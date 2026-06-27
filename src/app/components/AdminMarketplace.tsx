import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, DollarSign,
  Package, Store, Eye, BarChart3, ArrowLeft, Search, RefreshCw,
  AlertCircle, Flag, Lock
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { mockVendors, mockProducts, mockOrders, type Vendor, type Product } from '../data/marketplace';
import { toast } from 'sonner';

type VendorStatus = 'active' | 'pending' | 'suspended';

export default function AdminMarketplace() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vendors' | 'products' | 'orders' | 'analytics'>('overview');
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [productSearch, setProductSearch] = useState('');
  const [fraudAlerts] = useState([
    { id: 'fa1', type: 'Unusual Order Volume', vendor: 'Unknown Vendor', severity: 'high', time: '2 min ago' },
    { id: 'fa2', type: 'Duplicate Listing', vendor: 'Campus Essentials', severity: 'medium', time: '15 min ago' },
    { id: 'fa3', type: 'Price Anomaly', vendor: 'Tech Essentials Hub', severity: 'low', time: '1 hr ago' },
  ]);

  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const activeVendors = vendors.filter(v => v.status === 'active');

  const approveVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'active' as VendorStatus, verified: true } : v));
    toast.success('Vendor approved and activated');
  };

  const rejectVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'suspended' as VendorStatus } : v));
    toast.error('Vendor application rejected');
  };

  const suspendVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'suspended' as VendorStatus } : v));
    toast.warning('Vendor suspended');
  };

  const restoreVendor = (vendorId: string) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'active' as VendorStatus } : v));
    toast.success('Vendor restored to active status');
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Product removed from marketplace');
  };

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.vendorName.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0D0D0D] p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#0D0D0D] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Marketplace Control Center</h1>
              <p className="text-[#6B7280] text-sm">Manage vendors, verify products, monitor operations</p>
            </div>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {pendingVendors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3 mb-4"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-yellow-400">{pendingVendors.length} vendor approval{pendingVendors.length !== 1 ? 's' : ''} pending</div>
                  <div className="text-sm text-[#6B7280]">Review and approve vendor applications to activate their stores</div>
                </div>
                <button
                  onClick={() => setSelectedTab('vendors')}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors font-medium text-sm flex-shrink-0"
                >
                  Review Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'vendors', label: `Vendors (${vendors.length})`, icon: Store },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: 'Orders', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as typeof selectedTab)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                  selectedTab === id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#F8F9FF] text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'vendors' && pendingVendors.length > 0 && (
                  <span className="w-4 h-4 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingVendors.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedTab === 'overview' && <OverviewTab vendors={vendors} products={products} fraudAlerts={fraudAlerts} />}
        {selectedTab === 'vendors' && <VendorsTab vendors={vendors} onApprove={approveVendor} onReject={rejectVendor} onSuspend={suspendVendor} onRestore={restoreVendor} />}
        {selectedTab === 'products' && (
          <ProductsTab
            products={filteredProducts}
            search={productSearch}
            onSearchChange={setProductSearch}
            onRemove={removeProduct}
          />
        )}
        {selectedTab === 'orders' && <OrdersTab />}
        {selectedTab === 'analytics' && <AnalyticsTab />}
      </motion.div>
    </div>
  );
}

function OverviewTab({ vendors, products, fraudAlerts }: any) {
  const marketplaceData = [
    { day: 'Mon', revenue: 4500, orders: 45 },
    { day: 'Tue', revenue: 5200, orders: 52 },
    { day: 'Wed', revenue: 4800, orders: 48 },
    { day: 'Thu', revenue: 6100, orders: 61 },
    { day: 'Fri', revenue: 7200, orders: 72 },
    { day: 'Sat', revenue: 8500, orders: 85 },
    { day: 'Sun', revenue: 7800, orders: 78 }
  ];

  const totalRevenue = marketplaceData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = marketplaceData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Store} label="Active Vendors" value={vendors.filter((v: Vendor) => v.status === 'active').length.toString()} subtext={`${vendors.filter((v: Vendor) => v.status === 'pending').length} pending approval`} color="emerald" />
        <StatCard icon={Package} label="Total Products" value={products.length.toString()} subtext={`${products.filter((p: Product) => p.inStock).length} in stock`} color="blue" />
        <StatCard icon={TrendingUp} label="Orders (7d)" value={totalOrders.toString()} subtext="+15% from last week" color="purple" />
        <StatCard icon={DollarSign} label="Revenue (7d)" value={`$${totalRevenue.toLocaleString()}`} subtext="+22% from last week" color="yellow" />
      </div>

      {/* Fraud Alerts */}
      <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-red-400">Fraud Detection Alerts</h3>
          <span className="ml-auto text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{fraudAlerts.length} active</span>
        </div>
        <div className="space-y-3">
          {fraudAlerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-400 animate-pulse' : alert.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                <div>
                  <div className="font-medium text-sm">{alert.type}</div>
                  <div className="text-xs text-[#6B7280]">{alert.vendor} · {alert.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>{alert.severity}</span>
                <button className="text-xs text-[#6B7280] hover:text-[#0D0D0D] transition-colors px-2 py-1 bg-[#F8F9FF] rounded">Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue & Orders (7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={marketplaceData}>
            <defs>
              <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" stroke="#ffffff60" />
            <YAxis yAxisId="left" stroke="#ffffff60" />
            <YAxis yAxisId="right" orientation="right" stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Area key="admin-revenue-area" yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#adminRevGrad)" name="Revenue ($)" />
            <Line key="admin-orders-line" yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Vendors</h3>
        <div className="space-y-3">
          {[...vendors].sort((a: Vendor, b: Vendor) => b.totalSales - a.totalSales).slice(0, 5).map((vendor: Vendor) => (
            <div key={vendor.id} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{vendor.logo}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{vendor.name}</span>
                    {vendor.verified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-sm text-[#6B7280]">{vendor.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-400">{vendor.totalSales.toLocaleString()} sales</div>
                <div className="text-sm text-[#6B7280]">★ {vendor.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorsTab({ vendors, onApprove, onReject, onSuspend, onRestore }: any) {
  const pending = vendors.filter((v: Vendor) => v.status === 'pending');
  const active = vendors.filter((v: Vendor) => v.status === 'active');
  const suspended = vendors.filter((v: Vendor) => v.status === 'suspended');

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Pending Approval ({pending.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {pending.map((vendor: Vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} onApprove={onApprove} onReject={onReject} isPending />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          Active Vendors ({active.length})
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {active.map((vendor: Vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onSuspend={onSuspend} />
          ))}
        </div>
        {active.length === 0 && <div className="text-[#9CA3AF] text-center py-8">No active vendors</div>}
      </div>

      {suspended.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            Suspended ({suspended.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {suspended.map((vendor: Vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} onRestore={onRestore} isSuspended />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VendorCard({ vendor, isPending, isSuspended, onApprove, onReject, onSuspend, onRestore }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{vendor.logo}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{vendor.name}</h3>
                {vendor.verified && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  vendor.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  vendor.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                } capitalize`}>{vendor.status}</span>
              </div>
              <p className="text-[#6B7280] text-sm">{vendor.description}</p>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="p-2 hover:bg-[#F8F9FF] rounded-lg text-[#9CA3AF] hover:text-[#0D0D0D] transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-4 py-3 mb-3 border-t border-[#E5E7EB] text-sm">
                <div>
                  <div className="text-[#6B7280] mb-1">Email</div>
                  <div className="font-medium">{vendor.contactEmail}</div>
                </div>
                <div>
                  <div className="text-[#6B7280] mb-1">Phone</div>
                  <div className="font-medium">{vendor.contactPhone}</div>
                </div>
                <div>
                  <div className="text-[#6B7280] mb-1">Joined</div>
                  <div className="font-medium">{new Date(vendor.joinedDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[#6B7280] mb-1">Category</div>
                  <div className="font-medium">{vendor.category}</div>
                </div>
                <div>
                  <div className="text-[#6B7280] mb-1">Location</div>
                  <div className="font-medium">{vendor.location}</div>
                </div>
                <div>
                  <div className="text-[#6B7280] mb-1">Total Sales</div>
                  <div className="font-medium text-emerald-400">{vendor.totalSales.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between text-sm text-[#6B7280] mb-4">
          <span>★ {vendor.rating} ({vendor.totalReviews} reviews)</span>
          <span>{vendor.totalSales.toLocaleString()} sales</span>
          <span>~{vendor.averageDeliveryTime} min delivery</span>
        </div>

        {isPending && (
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(vendor.id)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Vendor
            </button>
            <button
              onClick={() => onReject(vendor.id)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
        {!isPending && !isSuspended && (
          <div className="flex gap-3">
            <button className="flex-1 bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] font-medium py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => onSuspend(vendor.id)}
              className="px-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Suspend
            </button>
          </div>
        )}
        {isSuspended && (
          <button
            onClick={() => onRestore(vendor.id)}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Vendor
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ProductsTab({ products, search, onSearchChange, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">All Products</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {products.map((product: Product) => (
          <div key={product.id} className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-4">
            <div className="text-5xl flex-shrink-0">{product.image}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-[#6B7280]">{product.vendorName}</span>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-emerald-400 font-semibold">${product.price}</span>
                <span className={product.inStock ? 'text-emerald-400' : 'text-red-400'}>
                  {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                </span>
                <span className="text-[#9CA3AF]">★ {product.rating} ({product.reviews})</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="px-3 py-2 bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors text-sm">
                View
              </button>
              <button
                onClick={() => onRemove(product.id)}
                className="px-3 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="py-16 text-center text-[#9CA3AF] space-y-2">
            <Package className="w-10 h-10 mx-auto opacity-30" />
            <div>No products found</div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Orders</h2>
      {mockOrders.map(order => (
        <div key={order.id} className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Order #{order.id}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${
                  order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                  order.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-[#F3F4F6] text-[#6B7280]'
                }`}>{order.status.replace('_', ' ')}</span>
              </div>
              <div className="text-sm text-[#6B7280]">{new Date(order.orderDate).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-400">${order.totalPrice}</div>
              <div className="text-sm text-[#6B7280]">{order.vendorName}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[#6B7280] mb-1">Product</div>
              <div className="font-medium">{order.productName}</div>
            </div>
            <div>
              <div className="text-[#6B7280] mb-1">Customer</div>
              <div className="font-medium">{order.userName}</div>
            </div>
            <div>
              <div className="text-[#6B7280] mb-1">Delivery Address</div>
              <div className="font-medium">{order.deliveryAddress}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab() {
  const categoryData = [
    { name: 'Food & Drinks', value: 35, color: '#10b981' },
    { name: 'Books', value: 20, color: '#3b82f6' },
    { name: 'Electronics', value: 18, color: '#a855f7' },
    { name: 'Clothing', value: 15, color: '#eab308' },
    { name: 'Other', value: 12, color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, i) => <Cell key={`cat-cell-${i}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Key Metrics</h3>
            <div className="space-y-3">
              {[
                { label: 'Avg Order Value', value: '$47.50', color: 'text-emerald-400' },
                { label: 'Avg Delivery Time', value: '12 min', color: 'text-blue-400' },
                { label: 'Customer Satisfaction', value: '4.7 ⭐', color: 'text-purple-400' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="text-sm text-[#6B7280]">{m.label}</div>
                  <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Operational Health</h3>
            <div className="space-y-3">
              {[
                { label: 'Vendor Retention', value: 94, color: 'bg-emerald-400' },
                { label: 'Order Completion', value: 98, color: 'bg-blue-400' },
                { label: 'On-Time Delivery', value: 91, color: 'bg-purple-400' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-[#6B7280]">{m.label}</span>
                    <span className="font-semibold">{m.value}%</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${m.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  const colors: Record<string, string> = { emerald: 'text-emerald-400', blue: 'text-blue-400', purple: 'text-purple-400', yellow: 'text-yellow-400' };
  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex items-center gap-2 text-[#6B7280] mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-3xl font-bold mb-1 ${colors[color]}`}>{value}</div>
      <div className="text-sm text-[#6B7280]">{subtext}</div>
    </div>
  );
}
