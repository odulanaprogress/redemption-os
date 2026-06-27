import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ShoppingBag, Star, TrendingUp, Clock, MapPin, Search, Filter,
  CheckCircle, ShoppingCart, Zap, Brain, X, ArrowLeft
} from 'lucide-react';
import {
  mockProducts, mockVendors, mockCategories,
  getFeaturedProducts, getTrendingProducts,
  type Product, type Vendor, type Category
} from '../data/marketplace';
import { MarketplaceSkeleton } from './SkeletonLoaders';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export default function MarketplaceHome() {
  const navigate = useNavigate();
  const { addItem, totalItems, toggleCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [liveOrders, setLiveOrders] = useState(1247);
  const [activeVendors] = useState(89);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOrders(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const aiRecommendations = useMemo(() => {
    const base = selectedCategory === 'all'
      ? mockProducts.filter(p => p.featured || p.trending)
      : mockProducts.filter(p => p.category === mockCategories.find(c => c.id === selectedCategory)?.name);
    return base.slice(0, 3);
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    const catName = mockCategories.find(c => c.id === selectedCategory)?.name;
    if (selectedCategory !== 'all' && catName) {
      products = products.filter(p => p.category === catName);
    }
    switch (sortBy) {
      case 'price_low': products.sort((a, b) => a.price - b.price); break;
      case 'price_high': products.sort((a, b) => b.price - a.price); break;
      case 'rating': products.sort((a, b) => b.rating - a.rating); break;
      default: products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return products;
  }, [searchQuery, selectedCategory, sortBy]);

  const showSearchResults = !!(searchQuery || selectedCategory !== 'all');
  const featuredProducts = getFeaturedProducts();
  const trendingProducts = getTrendingProducts();
  const nearbyVendors = mockVendors.filter(v => v.status === 'active').slice(0, 3);
  const fastVendors = mockVendors.filter(v => v.averageDeliveryTime <= 12);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-[#0D0D0D] p-6 md:p-8">
        <MarketplaceSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#0D0D0D]">
      <CartDrawer />

      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="border-b border-[#E5E7EB] pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-[#F8F9FF] rounded-lg transition-colors text-[#6B7280] hover:text-[#0D0D0D]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Verified Marketplace</h1>
                    <p className="text-[#6B7280] text-sm">Trusted vendors · Premium products · Fast delivery</p>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleCart}
                className="relative bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-emerald-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-[#0D0D0D] text-xs rounded-full flex items-center justify-center font-bold shadow-md"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, vendors, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl pl-12 pr-10 py-3 text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0D0D0D] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="featured">Featured First</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#0D0D0D]"
            >
              <Filter className="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          {/* Search results count */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm text-[#6B7280]"
              >
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#F8F9FF] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                }`}
              >
                <span className="text-xl">🛒</span>
                <span className="text-sm font-medium whitespace-nowrap">All</span>
                <span className="text-xs text-[#9CA3AF]">{mockProducts.length}</span>
              </button>
              {mockCategories.map(category => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                />
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">AI Recommendations</div>
                  <div className="text-xs text-[#6B7280]">Personalized picks for you</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                AI Active
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiRecommendations.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                  className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 cursor-pointer hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{product.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-emerald-400 font-bold">${product.price}</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-400 mb-3">
                    {i === 0 ? '✨ Best match for you' : i === 1 ? '🔥 Trending this week' : '⚡ Fast delivery'}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); addItem(product); }}
                    className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 font-medium py-2 rounded-lg transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Search/Filter Results OR Default Sections */}
          {showSearchResults ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : mockCategories.find(c => c.id === selectedCategory)?.name || 'Products'}
                </h2>
                <span className="text-sm text-[#9CA3AF]">{filteredProducts.length} products</span>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-white/30 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
                  <div className="font-medium">No products found</div>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="text-emerald-400 hover:text-emerald-300 text-sm underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addItem} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Featured */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Featured Products</h2>
                  <button onClick={() => setSelectedCategory('all')} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addItem} />
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addItem} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Fast Delivery */}
          <div className="bg-gradient-to-br from-blue-900/30 to-emerald-900/20 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-semibold">Fast Delivery Options</div>
                <div className="text-xs text-[#6B7280]">Under 15 minutes delivery</div>
              </div>
              <span className="ml-auto text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">⚡ Express</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fastVendors.slice(0, 3).map(vendor => (
                <FastVendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>

          {/* Nearby Verified Vendors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold">Verified Vendors Nearby</h2>
              </div>
              <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/20 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <h3 className="font-semibold">Live Marketplace Activity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <motion.div key={liveOrders} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="text-3xl font-bold text-emerald-400">
                  {liveOrders.toLocaleString()}
                </motion.div>
                <div className="text-sm text-[#6B7280]">Active Orders Today</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-blue-400">{activeVendors}</div>
                <div className="text-sm text-[#6B7280]">Verified Vendors Online</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-purple-400">12 min</div>
                <div className="text-sm text-[#6B7280]">Avg Delivery Time</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CategoryPill({ category, isSelected, onClick }: { category: Category; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
        isSelected
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
          : 'bg-[#F8F9FF] border-[#E5E7EB] hover:bg-[#F3F4F6]'
      }`}
    >
      <span className="text-xl">{category.icon}</span>
      <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
      {category.trending && <span className="text-xs text-purple-400">🔥</span>}
    </button>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/marketplace/product/${product.id}`)}
      className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all cursor-pointer group"
    >
      <div className="aspect-square bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {product.image?.startsWith('http') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">{product.image}</span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1 mb-1">{product.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{product.vendorName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-emerald-400">${product.price}</div>
          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
            <span className="text-white/30">({product.reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{product.deliveryETA}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full ${
            product.inStock ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {product.inStock ? `${product.stock} left` : 'Out of stock'}
          </div>
        </div>

        <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
          <motion.button
            onClick={handleAdd}
            disabled={!product.inStock || adding}
            animate={adding ? { scale: [1, 1.08, 1] } : {}}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-[#0D0D0D] font-medium py-2 rounded-lg transition-colors text-sm"
          >
            {adding ? '✓ Added' : 'Add to Cart'}
          </motion.button>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/marketplace/product/${product.id}`); }}
            className="px-3 bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors text-xs"
          >
            View
          </button>
        </div>

        <div className="flex gap-1 flex-wrap">
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 rounded-full text-xs text-blue-400">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          {product.trending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/15 rounded-full text-xs text-purple-400">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FastVendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 hover:border-yellow-500/30 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{vendor.logo}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{vendor.name}</span>
            {vendor.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
          </div>
          <div className="text-xs text-[#6B7280]">{vendor.category}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg flex-1 justify-center">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400">{vendor.averageDeliveryTime} min</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {vendor.rating}
        </div>
      </div>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-5 hover:border-emerald-500/30 transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="text-4xl">{vendor.logo}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{vendor.name}</h3>
            {vendor.verified && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          </div>
          <p className="text-sm text-[#6B7280] line-clamp-2">{vendor.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{vendor.rating}</span>
          <span className="text-[#9CA3AF]">({vendor.totalReviews})</span>
        </div>
        <div className="flex items-center gap-1 text-[#6B7280]">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{vendor.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-1 text-[#6B7280]">
          <Clock className="w-3.5 h-3.5" />
          <span>~{vendor.averageDeliveryTime} min</span>
        </div>
        <div className="text-emerald-400 font-medium text-xs">{vendor.totalSales.toLocaleString()} sales</div>
      </div>

      <button className="w-full bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] hover:border-emerald-500/30 font-medium py-2 rounded-lg transition-all text-sm">
        View Store →
      </button>
    </motion.div>
  );
}
