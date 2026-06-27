import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Plus, Minus, Trash2, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, totalItems, totalPrice, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckedOut(true);
      clearCart();
      toast.success('Order placed successfully!', {
        description: 'Your items will be delivered in 12–18 minutes.',
      });
      setTimeout(() => {
        setCheckedOut(false);
        closeCart();
      }, 2500);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0D0D0D]/50 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}
      {isOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-2xl shadow-[#0D0D0D]/10"
        >
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                {totalItems > 0 && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-sm rounded-full font-semibold">
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-[#F8F9FF] rounded-lg transition-colors text-[#6B7280] hover:text-[#0D0D0D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Success */}
            <AnimatePresence>
              {checkedOut && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">Order Placed!</h3>
                    <p className="text-[#6B7280]">Estimated delivery in 12–18 min</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <Truck className="w-4 h-4" />
                    <span>Track your delivery</span>
                  </div>
                  <button
                    onClick={() => { navigate('/delivery/o1'); closeCart(); }}
                    className="mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Tracking →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!checkedOut && (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-16">
                      <div className="w-20 h-20 bg-[#F8F9FF] rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#6B7280]">Your cart is empty</div>
                        <div className="text-sm text-[#9CA3AF] mt-1">Browse the marketplace to add items</div>
                      </div>
                      <button
                        onClick={closeCart}
                        className="bg-emerald-500 hover:bg-emerald-600 text-[#0D0D0D] px-6 py-2.5 rounded-lg transition-colors font-medium text-sm"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    items.map(item => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="bg-[#F8F9FF] border border-[#E5E7EB] rounded-xl p-4 flex gap-3"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                          {item.product.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.product.name}</div>
                          <div className="text-xs text-[#6B7280] mb-2">{item.product.vendorName}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-md flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-semibold w-5 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-md flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-400 text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="p-1 hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-500 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="p-6 border-t border-[#E5E7EB] space-y-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2.5 rounded-lg border border-emerald-500/20">
                      <Truck className="w-4 h-4 flex-shrink-0" />
                      <span>Estimated delivery: 12–18 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Order Total</span>
                      <span className="text-2xl font-bold text-[#0D0D0D]">${totalPrice.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/60 text-[#0D0D0D] font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isCheckingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#E5E7EB] border-t-white rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-[#F8F9FF] hover:bg-[#F3F4F6] border border-[#E5E7EB] font-medium py-2 rounded-lg transition-colors text-sm text-[#6B7280]"
                    >
                      Clear Cart
                    </button>
                  </div>
                )}
              </>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
