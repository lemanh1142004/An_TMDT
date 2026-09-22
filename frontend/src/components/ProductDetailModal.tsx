import React, { useState } from 'react';
import { X, Star, ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import type { Product } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';
import { getProductImage, handleImageError } from '../utils/imageUtils';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, size: string, color: string, quantity: number) => void;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL'];
const AVAILABLE_COLORS = [
  { name: 'Đen Tuyển', hex: '#1e293b' },
  { name: 'Trắng Ngà', hex: '#f8fafc' },
  { name: 'Xanh Navy', hex: '#1e3a8a' },
  { name: 'Be Cát', hex: '#d4b996' },
  { name: 'Xám Khói', hex: '#64748b' },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyNow,
}) => {
  const { addToCart, setIsCartOpen } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Đen Tuyển');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const maxStock = product.stock;
  const isOutOfStock = maxStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setIsCartOpen(true);
      onClose();
    }, 600);
  };

  const handleDirectBuyNow = () => {
    if (isOutOfStock) return;
    onBuyNow(product, selectedSize, selectedColor, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 border border-slate-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Media Gallery */}
        <div className="md:w-1/2 relative bg-slate-100 min-h-[340px] md:min-h-[480px]">
          <img
            src={getProductImage(product.image)}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
          {product.tag && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur text-white text-xs font-bold shadow-md">
              {product.tag}
            </span>
          )}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
              <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm tracking-wider uppercase shadow-lg">
                Tạm hết hàng
              </span>
            </div>
          ) : maxStock <= 5 ? (
            <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold shadow-md">
              Chỉ còn {maxStock} chiếc trong kho
            </span>
          ) : (
            <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-xs font-medium backdrop-blur">
              Sẵn hàng ({maxStock} sản phẩm)
            </span>
          )}
        </div>

        {/* Right: Product Details & Buying Controls */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Ratings */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewsCount} đánh giá)</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-indigo-600">
                {product.price.toLocaleString('vi-VN')} ₫
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {product.originalPrice.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'Chất liệu vải cao cấp thiết kế may đo tỉ mỉ, form dáng hiện đại phù hợp mọi dịp.'}
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">Chọn Kích Cỡ (Size):</span>
                <span className="text-indigo-600 hover:underline cursor-pointer">Bảng quy đổi size</span>
              </div>
              <div className="flex items-center gap-2">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-800">
                Màu sắc: <span className="font-normal text-slate-600">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {AVAILABLE_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-8 h-8 rounded-full border-2 transition relative flex items-center justify-center ${
                      selectedColor === col.name ? 'border-indigo-600 scale-110 shadow-xs' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {selectedColor === col.name && (
                      <Check className={`w-3.5 h-3.5 ${col.hex === '#f8fafc' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-800">Số lượng:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-slate-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxStock || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.min(maxStock, prev + 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            {addedToast && (
              <div className="text-center text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 rounded-lg">
                ✓ Đã thêm vào giỏ hàng thành công!
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-slate-700" /> Thêm Vào Giỏ
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleDirectBuyNow}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" /> Mua Ngay
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-indigo-500" /> Freeship &gt; 500k
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-emerald-500" /> Đổi trả 30 ngày
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-500" /> Chuẩn chính hãng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
