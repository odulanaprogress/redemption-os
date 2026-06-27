import { motion } from 'motion/react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star, Clock, MapPin, CheckCircle, ShoppingCart, Zap, TrendingUp, Shield, Plus, Minus, Heart } from 'lucide-react';
import { getProductById, getVendorById, getProductsByVendor } from '../data/marketplace';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, totalItems, toggleCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const product = id ? getProductById(id) : undefined;
  const vendor = product ? getVendorById(product.vendorId) : undefined;
  const relatedProducts = product ? getProductsByVendor(product.vendorId).filter(p => p.id !== product.id).slice(0, 3) : [];

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  if (!product || !vendor) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-[#0D0D0D] p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-[#6B7280]">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl transition-colors font-medium"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0D0D0D]">
      <CartDrawer />

      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Marketplace
            </button>
            <button
              onClick={toggleCart}
              className="relative bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-[#0D0D0D] text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Main */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-emerald-500/15 to-blue-500/15 rounded-2xl border border-[#E5E7EB] flex items-center justify-center relative overflow-hidden group">
                <div className="text-[160px] group-hover:scale-110 transition-transform duration-500">{product.image}</div>
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-blue-500/80 text-[#0D0D0D] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}
                {product.trending && (
                  <div className="absolute top-4 right-4 bg-purple-500/80 text-[#0D0D0D] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#F8F9FF] border border-[#E5E7EB] rounded-full text-xs text-[#6B7280]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-[#6B7280] leading-relaxed">{product.description}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-[#D1D5DB]'}`} />
                  ))}
                  <span className="font-semibold ml-1">{product.rating}</span>
                </div>
                <span className="text-[#6B7280] text-sm">{product.reviews} reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold text-emerald-400">${product.price}</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.inStock ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-medium text-emerald-400">Estimated Delivery: {product.deliveryETA}</div>
                  <div className="text-xs text-[#6B7280]">AI-optimized route from {vendor.location}</div>
                </div>
              </div>

              {/* Vendor */}
              <div className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{vendor.logo}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{vendor.name}</span>
                      {vendor.verified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-sm text-[#6B7280] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {vendor.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{vendor.rating}</span>
                  </div>
                  <div className="text-xs text-[#6B7280]">{vendor.totalReviews} reviews</div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-[#6B7280] text-sm">Quantity:</span>
                <div className="flex items-center gap-3 bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl px-4 py-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="hover:text-[#0D0D0D] text-[#6B7280] transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="hover:text-[#0D0D0D] text-[#6B7280] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[#9CA3AF] text-sm">Total: <span className="text-[#0D0D0D] font-semibold">${(product.price * quantity).toFixed(2)}</span></span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addedFeedback}
                  animate={addedFeedback ? { scale: [1, 1.05, 1] } : {}}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-[#0D0D0D] font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addedFeedback ? '✓ Added to Cart!' : 'Add to Cart'}
                </motion.button>
                <button
                  onClick={() => setWishlisted(w => !w)}
                  className={`p-4 rounded-xl border transition-all ${wishlisted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[#F8F9FF] border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-400' : ''}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: 'Verified Vendor', color: 'text-emerald-400' },
                  { icon: Zap, label: 'Fast Delivery', color: 'text-yellow-400' },
                  { icon: CheckCircle, label: 'Quality Assured', color: 'text-blue-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-3 text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <div className="text-xs text-[#6B7280]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">More from {vendor.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedProducts.map(related => (
                  <motion.div
                    key={related.id}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/marketplace/product/${related.id}`)}
                    className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 cursor-pointer hover:border-emerald-500/30 transition-all flex gap-4 items-center"
                  >
                    <div className="text-5xl flex-shrink-0">{related.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate mb-1">{related.name}</div>
                      <div className="text-emerald-400 font-bold">${related.price}</div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                        <Clock className="w-3 h-3" />
                        {related.deliveryETA}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); addItem(related); }}
                      className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
