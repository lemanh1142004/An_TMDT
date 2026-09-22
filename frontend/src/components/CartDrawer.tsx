import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart, clearCart } = useStore();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 500000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Giỏ hàng của bạn ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-indigo-50/70 p-3 border-b border-indigo-100 text-xs text-indigo-900">
            {isFreeShipping ? (
              <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                🎉 Đơn hàng của bạn đã đủ điều kiện <strong>Miễn phí giao hàng toàn quốc!</strong>
              </p>
            ) : (
              <div>
                <p>
                  Mua thêm <strong className="font-bold text-indigo-700">{missingForFreeShip.toLocaleString('vi-VN')} ₫</strong> để được Miễn phí giao hàng!
                </p>
                <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Giỏ hàng trống</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hãy lựa chọn những thiết kế thời trang yêu thích từ bộ sưu tập của chúng tôi.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-indigo-600 transition"
                >
                  Khám phá thời trang ngay
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-slate-100 last:border-none">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-slate-400 hover:text-red-600 transition p-0.5"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Phân loại: {item.color} | Size: {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateCartQty(idx, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:bg-slate-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(idx, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:bg-slate-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-bold text-sm text-slate-900">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Actions */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tạm tính:</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Thuế và phí giao hàng sẽ được tính toán chi tiết tại bước thanh toán.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Tiến hành Đặt hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-center text-xs text-slate-500 hover:text-red-600 transition"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
