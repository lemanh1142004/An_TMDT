import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, LogIn, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { CartItem } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage, handleImageError } from '../utils/imageUtils';

interface CartDrawerProps {
  onOpenCheckout?: (items?: CartItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart, clearCart, openCheckout } = useStore();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isStaff = !isAdmin && user?.roles?.includes('ROLE_STAFF');

  // Track which item indices in the cart are selected for checkout (default: all selected)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Keep selection in sync when cart changes
  useEffect(() => {
    setSelectedIndices(cart.map((_, idx) => idx));
  }, [cart.length]);

  if (!isCartOpen) return null;

  const isAllSelected = cart.length > 0 && selectedIndices.length === cart.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(cart.map((_, idx) => idx));
    }
  };

  const handleToggleItem = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Selected items subset
  const selectedItems = cart.filter((_, idx) => selectedIndices.includes(idx));
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const freeShippingThreshold = 500000;
  const isFreeShipping = selectedSubtotal >= freeShippingThreshold;
  const missingForFreeShip = Math.max(0, freeShippingThreshold - selectedSubtotal);

  // Pay for single item directly
  const handleCheckoutSingleItem = (item: CartItem) => {
    setIsCartOpen(false);
    if (onOpenCheckout) {
      onOpenCheckout([item]);
    } else {
      openCheckout([item]);
    }
  };

  // Pay for all selected items
  const handleCheckoutSelected = () => {
    if (selectedItems.length === 0) return;
    setIsCartOpen(false);
    if (onOpenCheckout) {
      onOpenCheckout(selectedItems);
    } else {
      openCheckout(selectedItems);
    }
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
              <div>
                <h2 className="text-base font-bold text-slate-900">Giỏ hàng của bạn ({cart.length})</h2>
                <p className="text-[11px] text-slate-500">Hỗ trợ thanh toán riêng từng món hoặc toàn bộ giỏ</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Select All Bar (when cart has items) */}
          {cart.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Chọn tất cả ({cart.length} món)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Đã chọn: <strong className="text-indigo-600 font-bold">{selectedItems.length}</strong> / {cart.length}
              </span>
            </div>
          )}

          {/* Free Shipping Progress Indicator for Selected Items */}
          {cart.length > 0 && (
            <div className="bg-indigo-50/70 p-3 border-b border-indigo-100 text-xs text-indigo-900">
              {isFreeShipping ? (
                <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  🎉 Các món đã chọn đủ điều kiện <strong>Miễn phí giao hàng toàn quốc!</strong>
                </p>
              ) : (
                <div>
                  <p>
                    Chọn thêm <strong className="font-bold text-indigo-700">{missingForFreeShip.toLocaleString('vi-VN')} ₫</strong> để được Miễn phí giao hàng!
                  </p>
                  <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedSubtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
              cart.map((item, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col gap-3 ${
                      isSelected 
                        ? 'bg-white border-indigo-200 shadow-xs' 
                        : 'bg-slate-50/70 border-slate-200/80 opacity-85'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox */}
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleItem(idx)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          title="Chọn sản phẩm này để thanh toán"
                        />
                      </div>

                      {/* Product Thumbnail */}
                      <img
                        src={getProductImage(item.product.image)}
                        alt={item.product.name}
                        onError={handleImageError}
                        className="w-20 h-24 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                      />

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                            <button
                              onClick={() => removeFromCart(idx)}
                              className="text-slate-400 hover:text-red-600 transition p-0.5 flex-shrink-0"
                              title="Xóa khỏi giỏ hàng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              Size: <strong>{item.size}</strong>
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              Màu: <strong>{item.color}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Quantity controls & Price */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => updateCartQty(idx, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(idx, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:bg-slate-100 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="font-extrabold text-sm text-slate-900">
                            {(item.product.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Single Item Direct Checkout Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCheckoutSingleItem(item)}
                        className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 group/single"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600 group-hover/single:text-white transition" />
                        <span>Thanh toán riêng món này ({((item.product?.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} ₫)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Actions */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Tổng thanh toán các món đã chọn:</span>
                  <div className="text-[11px] text-slate-400">
                    ({selectedItems.length} / {cart.length} sản phẩm)
                  </div>
                </div>
                <span className="text-xl font-black text-indigo-600">
                  {selectedSubtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                    <LogIn className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Quý khách cần đăng nhập tài khoản khách hàng để hoàn tất đặt hàng.</span>
                  </div>
                )}

                {(isAdmin || isStaff) && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Đang thao tác với tài khoản {isAdmin ? 'Quản trị viên (Admin)' : 'Nhân viên (Staff)'}.</span>
                  </div>
                )}

                <button
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckoutSelected}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                    selectedItems.length > 0
                      ? 'bg-slate-900 hover:bg-indigo-600 text-white cursor-pointer shadow-indigo-500/10'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {selectedItems.length === cart.length
                      ? `Thanh toán tất cả (${cart.length} món) • ${selectedSubtotal.toLocaleString('vi-VN')} ₫`
                      : selectedItems.length > 0
                      ? `Thanh toán ${selectedItems.length} món đã chọn • ${selectedSubtotal.toLocaleString('vi-VN')} ₫`
                      : 'Vui lòng chọn ít nhất 1 sản phẩm'}
                  </span>
                  {selectedItems.length > 0 && <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-red-600 transition"
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

