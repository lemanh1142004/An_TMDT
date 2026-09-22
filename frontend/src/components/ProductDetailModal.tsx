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

export interface ColorVariant {
  name: string;
  hex: string;
  filter: string;
  overlayColor: string;
  mixBlend: React.CSSProperties['mixBlendMode'];
  opacity: number;
  description: string;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL'];
const AVAILABLE_COLORS: ColorVariant[] = [
  {
    name: 'Màu Gốc',
    hex: '#64748b',
    filter: 'none',
    overlayColor: 'transparent',
    mixBlend: 'normal',
    opacity: 0,
    description: 'Tone màu nguyên bản thiết kế tiêu chuẩn của nhà mẫu.'
  },
  {
    name: 'Đen Tuyển',
    hex: '#0f172a',
    filter: 'brightness(0.65) contrast(1.25) grayscale(0.85)',
    overlayColor: '#09090b',
    mixBlend: 'multiply',
    opacity: 0.65,
    description: 'Tone đen sang trọng huyền bí, che khuyết điểm và tôn dáng đỉnh cao.'
  },
  {
    name: 'Trắng Ngà',
    hex: '#f8fafc',
    filter: 'brightness(1.28) contrast(0.92) grayscale(0.8)',
    overlayColor: '#ffffff',
    mixBlend: 'screen',
    opacity: 0.45,
    description: 'Tone trắng kem tinh khôi, thanh lịch chuẩn gu công sở hiện đại.'
  },
  {
    name: 'Xanh Navy',
    hex: '#1e3a8a',
    filter: 'brightness(0.82) contrast(1.2) saturate(1.45)',
    overlayColor: '#1d4ed8',
    mixBlend: 'color',
    opacity: 0.78,
    description: 'Tone xanh biển sâu đậm phong cách Sartorial châu Âu chuẩn mực.'
  },
  {
    name: 'Be Cát',
    hex: '#d4a373',
    filter: 'sepia(0.65) saturate(1.35) brightness(1.05)',
    overlayColor: '#d4a373',
    mixBlend: 'color',
    opacity: 0.72,
    description: 'Tone camel ấm áp, phong cách Parisian Chic thời thượng & ấm cúng.'
  },
  {
    name: 'Xám Khói',
    hex: '#64748b',
    filter: 'grayscale(1) brightness(0.9) contrast(1.1)',
    overlayColor: '#475569',
    mixBlend: 'color',
    opacity: 0.68,
    description: 'Tone xám trung tính thời thượng, hiện đại và rất dễ mix đồ.'
  },
  {
    name: 'Đỏ Burgundy',
    hex: '#881337',
    filter: 'brightness(0.78) contrast(1.22) saturate(1.5)',
    overlayColor: '#991b1b',
    mixBlend: 'color',
    opacity: 0.75,
    description: 'Tone đỏ rượu vang quý phái, tạo điểm nhấn nổi bật trong các buổi tiệc.'
  },
  {
    name: 'Xanh Rêu',
    hex: '#166534',
    filter: 'brightness(0.82) contrast(1.15) saturate(1.35)',
    overlayColor: '#15803d',
    mixBlend: 'color',
    opacity: 0.72,
    description: 'Tone xanh ô-liu tự nhiên, mang hơi thở thiên nhiên mộc mạc thư thái.'
  }
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
  const activeColor = AVAILABLE_COLORS.find((c) => c.name === selectedColor) || AVAILABLE_COLORS[0];

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
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden z-10 border border-slate-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Media Gallery with Dynamic Color Shift */}
        <div className="md:w-1/2 relative bg-slate-950 min-h-[360px] md:min-h-[520px] overflow-hidden flex items-center justify-center group select-none">
          {/* Base Product Image with CSS Color Filter */}
          <img
            src={getProductImage(product.image)}
            alt={product.name}
            onError={handleImageError}
            style={{
              filter: activeColor.filter,
              transition: 'filter 0.5s ease-in-out, transform 0.5s ease',
            }}
            className="w-full h-full object-cover group-hover:scale-105"
          />

          {/* Color Tint Blend Overlay */}
          {activeColor.opacity > 0 && (
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-500 ease-in-out"
              style={{
                backgroundColor: activeColor.overlayColor,
                mixBlendMode: activeColor.mixBlend,
                opacity: activeColor.opacity,
              }}
            />
          )}

          {/* Tag & Out of stock badges */}
          {product.tag && (
            <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur text-white text-xs font-bold shadow-md">
              {product.tag}
            </span>
          )}

          {/* Floating Live Color Preview Tag */}
          <div className="absolute top-4 right-14 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-white/10">
            <span
              className="w-3 h-3 rounded-full border border-white/70 shadow-2xs flex-shrink-0"
              style={{ backgroundColor: activeColor.hex }}
            />
            <span>Màu: <strong className="text-indigo-300">{activeColor.name}</strong></span>
          </div>

          {/* Bottom color variant quick pills on image */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {AVAILABLE_COLORS.map((col) => (
              <button
                key={col.name}
                type="button"
                onClick={() => setSelectedColor(col.name)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 backdrop-blur-md ${
                  selectedColor === col.name
                    ? 'bg-white text-slate-900 shadow-xl scale-105 border border-white'
                    : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900/90 border border-white/15'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: col.hex }}
                />
                <span>{col.name}</span>
              </button>
            ))}
          </div>

          {isOutOfStock ? (
            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center z-30">
              <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm tracking-wider uppercase shadow-lg">
                Tạm hết hàng
              </span>
            </div>
          ) : maxStock <= 5 ? (
            <span className="absolute bottom-14 left-4 z-20 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold shadow-md">
              Chỉ còn {maxStock} chiếc trong kho
            </span>
          ) : (
            <span className="absolute bottom-14 left-4 z-20 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-xs font-medium backdrop-blur">
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Phối màu thời trang: <span className="font-bold text-indigo-600">{selectedColor}</span>
                </span>
                {selectedColor !== 'Màu Gốc' && (
                  <button
                    type="button"
                    onClick={() => setSelectedColor('Màu Gốc')}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    Xem ảnh gốc
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {AVAILABLE_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center shadow-xs ${
                      selectedColor === col.name 
                        ? 'border-indigo-600 scale-110 ring-2 ring-indigo-200' 
                        : 'border-slate-300 hover:scale-105'
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

              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 animate-fadeIn">
                💡 {activeColor.description}
              </p>
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
