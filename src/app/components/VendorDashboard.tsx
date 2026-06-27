import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Store, Package, TrendingUp, DollarSign, Clock, CheckCircle,
  AlertCircle, Upload, Edit, Trash2, BarChart3, X, Plus,
  ArrowLeft, Truck, RefreshCw, Camera, Loader2, Image as ImageIcon,
} from 'lucide-react';
import { cloudinaryService } from '../../services/cloudinary.service';
import { toast as sonerToast } from 'sonner';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockVendors, getProductsByVendor, getOrdersByVendor, type Product, type Order } from '../data/marketplace';
import { toast } from 'sonner';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'in_transit', 'delivered'] as const;

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');
  const [products, setProducts] = useState<Product[]>(getProductsByVendor('v1'));
  const [orders, setOrders] = useState<Order[]>(getOrdersByVendor('v1'));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const vendor = mockVendors[0];

  const revenueData = [
    { day: 'Mon', revenue: 1200 },
    { day: 'Tue', revenue: 1800 },
    { day: 'Wed', revenue: 1500 },
    { day: 'Thu', revenue: 2200 },
    { day: 'Fri', revenue: 2800 },
    { day: 'Sat', revenue: 3200 },
    { day: 'Sun', revenue: 2600 }
  ];

  const productPerformance = [
    { name: 'Books', sales: 156 },
    { name: 'Electronics', sales: 98 },
    { name: 'Clothing', sales: 134 },
    { name: 'Food', sales: 210 }
  ];

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Product removed from listing');
  };

  const handleAdvanceOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = ORDER_STATUSES.indexOf(o.status as typeof ORDER_STATUSES[number]);
      const next = ORDER_STATUSES[Math.min(idx + 1, ORDER_STATUSES.length - 1)];
      toast.success(`Order #${orderId} updated to "${next.replace('_', ' ')}"`);
      return { ...o, status: next };
    }));
  };

  return (
    <div className="min-h-screen bg-black text-[#0D0D0D] p-6 md:p-8">
      {showUploadModal && (
        <UploadProductModal onClose={() => setShowUploadModal(false)} onSubmit={(newProduct) => {
          setProducts(prev => [...prev, newProduct]);
          setShowUploadModal(false);
          toast.success('Product uploaded successfully!');
        }} />
      )}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={(updated) => {
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
          setEditingProduct(null);
          toast.success('Product updated');
        }} />
      )}

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

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{vendor.logo}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{vendor.name}</h1>
                  {vendor.verified && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                </div>
                <p className="text-[#6B7280] text-sm">{vendor.description}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              vendor.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : vendor.status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {vendor.status === 'active' ? '● Active' : vendor.status === 'pending' ? '● Pending Approval' : '● Suspended'}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: Store },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as typeof selectedTab)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                  selectedTab === id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#F8F9FF] text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {selectedTab === 'overview' && <OverviewTab vendor={vendor} products={products} orders={orders} revenueData={revenueData} />}
        {selectedTab === 'products' && (
          <ProductsTab
            products={products}
            onUpload={() => setShowUploadModal(true)}
            onEdit={p => setEditingProduct(p)}
            onDelete={handleDeleteProduct}
          />
        )}
        {selectedTab === 'orders' && <OrdersTab orders={orders} onAdvance={handleAdvanceOrder} />}
        {selectedTab === 'analytics' && <AnalyticsTab revenueData={revenueData} productPerformance={productPerformance} />}
      </motion.div>
    </div>
  );
}

function OverviewTab({ vendor, products, orders, revenueData }: any) {
  const totalRevenue = revenueData.reduce((sum: number, d: any) => sum + d.revenue, 0);
  const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
  const activeProducts = products.filter((p: any) => p.inStock).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Revenue (7d)" value={`$${totalRevenue.toLocaleString()}`} change="+12.5%" positive color="emerald" />
        <StatCard icon={Package} label="Active Products" value={activeProducts.toString()} change={`${products.length} total`} color="blue" />
        <StatCard icon={Clock} label="Pending Orders" value={pendingOrders.toString()} change={`${orders.length} total`} color="yellow" />
        <StatCard icon={TrendingUp} label="Avg Rating" value={vendor.rating.toString()} change={`${vendor.totalReviews} reviews`} color="purple" />
      </div>

      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview (7 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="vendorRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Area key="vendor-revenue-area" type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#vendorRevGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button onClick={() => {}} className="text-emerald-400 hover:text-emerald-300 text-sm">View All →</button>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 4).map((order: any) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg">
              <div>
                <div className="font-medium text-sm">{order.productName}</div>
                <div className="text-xs text-[#6B7280]">{order.userName} · {new Date(order.orderDate).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-400 text-sm">${order.totalPrice}</div>
                <div className={`text-xs capitalize ${
                  order.status === 'delivered' ? 'text-emerald-400' :
                  order.status === 'in_transit' ? 'text-blue-400' :
                  order.status === 'preparing' ? 'text-yellow-400' : 'text-[#6B7280]'
                }`}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ products, onUpload, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      <button
        onClick={onUpload}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        Upload New Product
      </button>

      {products.length === 0 ? (
        <div className="py-20 text-center text-white/30 space-y-3">
          <Package className="w-12 h-12 mx-auto opacity-30" />
          <div>No products yet. Upload your first product!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product: Product) => (
            <div key={product.id} className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-[#F8F9FF] border border-[#E5E7EB] flex items-center justify-center">
                {product.image?.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{product.image}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-[#6B7280] mb-2 line-clamp-1">{product.description}</p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-emerald-400 font-semibold">${product.price}</span>
                  <span className={product.inStock ? 'text-emerald-400' : 'text-red-400'}>
                    {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <span className="text-[#6B7280]">{product.reviews} reviews</span>
                  <span className="text-yellow-400">★ {product.rating}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ orders, onAdvance }: { orders: Order[]; onAdvance: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {orders.map(order => {
        const statusIdx = ORDER_STATUSES.indexOf(order.status as any);
        const isComplete = order.status === 'delivered' || order.status === 'cancelled';

        return (
          <div key={order.id} className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-[#6B7280]">{new Date(order.orderDate).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-400">${order.totalPrice}</div>
                <div className="text-sm text-[#6B7280]">{order.quantity}× {order.productName}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center gap-1">
                {ORDER_STATUSES.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${i <= statusIdx ? 'bg-emerald-500' : 'bg-[#F3F4F6]'}`} />
                    {i < ORDER_STATUSES.length - 1 && <div className="w-1" />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {ORDER_STATUSES.map((s, i) => (
                  <div key={s} className={`text-xs ${i <= statusIdx ? 'text-emerald-400' : 'text-white/30'} capitalize`}>
                    {s.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <div className="text-[#6B7280] mb-1">Customer</div>
                <div className="font-medium">{order.userName}</div>
              </div>
              <div>
                <div className="text-[#6B7280] mb-1">Delivery Address</div>
                <div className="font-medium">{order.deliveryAddress}</div>
              </div>
            </div>

            {!isComplete && (
              <button
                onClick={() => onAdvance(order.id)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Advance to Next Status
              </button>
            )}
            {isComplete && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center py-2">
                <CheckCircle className="w-4 h-4" />
                Order complete
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsTab({ revenueData, productPerformance }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Line key="vendor-revenue-line" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={productPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Bar key="product-sales-bar" dataKey="sales" radius={[4, 4, 0, 0]}>
              {productPerformance.map((_: any, index: number) => (
                <Cell key={`perf-cell-${index}`} fill="#10b981" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400', blue: 'text-blue-400', purple: 'text-purple-400', yellow: 'text-yellow-400'
  };
  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex items-center gap-2 text-[#6B7280] mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-3xl font-bold mb-1 ${colors[color]}`}>{value}</div>
      {change && <div className={`text-sm ${positive ? 'text-emerald-400' : 'text-[#6B7280]'}`}>{change}</div>}
    </div>
  );
}

function UploadProductModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (p: Product) => void }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: 'Books', deliveryETA: '15 min' });
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const result = await cloudinaryService.uploadImage(file, 'redemption-os/products', { tags: ['product'] });
    setImageUploading(false);
    if (result.success && result.data) {
      setImageUrl(result.data.secureUrl);
      sonerToast.success('Product image uploaded!');
    } else {
      sonerToast.error(result.error ?? 'Image upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    setSubmitting(true);
    const newProduct: Product = {
      id: `p_new_${Date.now()}`,
      vendorId: 'v1',
      vendorName: 'Grace Bookstore',
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image: imageUrl || '📦',
      category: form.category,
      stock: parseInt(form.stock),
      inStock: true,
      deliveryETA: form.deliveryETA,
      featured: false,
      trending: false,
      rating: 0,
      reviews: 0,
      tags: [],
    };
    onSubmit(newProduct);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-[#0a0a0a] border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Upload Product</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FF] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product image upload */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">Product Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 bg-[#F8F9FF] border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/40 hover:bg-[#F3F4F6] transition-all"
            >
              {imageUploading ? (
                <><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /><span className="text-sm text-[#6B7280]">Uploading...</span></>
              ) : imageUrl ? (
                <img src={imageUrl} alt="product" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <><ImageIcon className="w-8 h-8 text-white/30" /><span className="text-sm text-[#9CA3AF]">Click to upload product image</span></>
              )}
            </div>
          </div>

          {[
            { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Study Bible Deluxe' },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Short product description' },
            { key: 'price', label: 'Price ($)', type: 'number', placeholder: '0.00' },
            { key: 'stock', label: 'Initial Stock', type: 'number', placeholder: '10' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-[#6B7280] mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#0D0D0D] placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-[#6B7280] mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#0D0D0D] focus:outline-none"
            >
              {['Books', 'Food & Drinks', 'Religious Materials', 'Clothing', 'Electronics', 'Essentials', 'Event Supplies'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-[#0D0D0D] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><div className="w-4 h-4 border-2 border-[#E5E7EB] border-t-white rounded-full animate-spin" /> Uploading...</> : <><Plus className="w-4 h-4" /> Upload Product</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [form, setForm] = useState({ price: product.price.toString(), stock: product.stock.toString(), name: product.name });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#0a0a0a] border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">Edit Product</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FF] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Product Name', type: 'text' },
            { key: 'price', label: 'Price ($)', type: 'number' },
            { key: 'stock', label: 'Stock Quantity', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-[#6B7280] mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[#0D0D0D] focus:outline-none focus:border-blue-500/50"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] py-2.5 rounded-xl transition-colors text-sm font-medium">Cancel</button>
            <button
              onClick={() => onSave({ ...product, name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), inStock: parseInt(form.stock) > 0 })}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-[#0D0D0D] py-2.5 rounded-xl transition-colors text-sm font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
