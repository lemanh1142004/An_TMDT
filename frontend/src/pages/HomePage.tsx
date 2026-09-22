import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Headphones, 
  Heart, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Tag, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Zap, 
  X 
} from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { checkHealth } from '../services/api';
import type { HealthCheckResponse } from '../types';
import { useStore } from '../context/StoreContext';
import type { Product } from '../context/StoreContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { getProductImage, handleImageError } from '../utils/imageUtils';

// Fallback images for dynamic categories if not provided
const categoryImages: Record<string, { image: string; subtitle: string }> = {
  'thoi-trang-nu': {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    subtitle: 'Váy đầm dạ tiệc, áo kiểu & thời trang thiết kế nữ'
  },
  'thoi-trang-nam': {
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    subtitle: 'Blazer may đo, sơ mi Oxford & quần âu Sartorial'
  },
  'phu-kien': {
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&auto=format&fit=crop&q=80',
    subtitle: 'Túi da Ý, thắt lưng, mũ beret & khăn lụa tơ tằm'
  },
  'unisex': {
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    subtitle: 'Hoodie, len dệt kim, jean ống suông phong cách tự do'
  },
};

export const HomePage: React.FC = () => {
  const { 
    products, 
    categories, 
    addToCart, 
    setIsCartOpen, 
    openCheckout, 
    selectedCategory, 
    setSelectedCategory 
  } = useStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Sync category & section scroll from URL query params or hash
  useEffect(() => {
    const catQuery = searchParams.get('category');
    if (catQuery) {
      const decoded = decodeURIComponent(catQuery).trim();
      const matched = categories.find(
        (c) =>
          c.slug.toLowerCase() === decoded.toLowerCase() ||
          c.name.toLowerCase() === decoded.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched.name);
      } else {
        setSelectedCategory(decoded);
      }
      setTimeout(() => {
        const el = document.getElementById('featured');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (location.hash === '#collections') {
      setTimeout(() => {
        const el = document.getElementById('collections');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (location.hash === '#featured') {
      setTimeout(() => {
        const el = document.getElementById('featured');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [searchParams, location.hash, categories, setSelectedCategory]);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleBuyNow = (product: Product, size: string, color: string, quantity: number) => {
    setIsDetailOpen(false);
    openCheckout([{ product, size, color, quantity }]);
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 'L', 'Tiêu chuẩn', 1);
    setIsCartOpen(true);
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    const featuredElem = document.getElementById('featured');
    if (featuredElem) {
      featuredElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.isActive);

    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể kết nối tới Gateway / Backend. Vui lòng kiểm tra các dịch vụ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onBuyNow={handleBuyNow}
      />

      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-950 text-white min-h-[480px] sm:min-h-[560px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
            alt="Fashion Hero Banner"
            onError={handleImageError}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />

        <div className="relative z-20 max-w-2xl px-8 sm:px-14 py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" /> Bộ Sưu Tập Thu - Đông 2026
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Nâng Tầm <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-pink-200 to-amber-200">
              Gu Thời Trang
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg">
            Khám phá những thiết kế tối giản, may đo chuẩn xác cùng chất liệu cao cấp thân thiện môi trường. Định nghĩa phong cách sống hiện đại của bạn.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#featured"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition shadow-lg shadow-white/10"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Mua sắm ngay ({products.length} sản phẩm)
            </a>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition backdrop-blur"
            >
              Đăng ký thành viên <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Giao hàng miễn phí</h4>
            <p className="text-xs text-slate-500 mt-1">Áp dụng cho mọi đơn hàng giá trị trên 500.000 ₫</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Đổi trả 30 ngày</h4>
            <p className="text-xs text-slate-500 mt-1">Thủ tục đổi hàng nhanh chóng nếu không vừa size</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Chính hãng 100%</h4>
            <p className="text-xs text-slate-500 mt-1">Chất liệu cao cấp được kiểm định nghiêm ngặt</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Hỗ trợ tận tâm</h4>
            <p className="text-xs text-slate-500 mt-1">Tư vấn chọn trang phục chuyên nghiệp 24/7</p>
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section from Database */}
      <section id="collections" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Bộ Sưu Tập & Danh Mục Phong Cách</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Khám Phá Theo Nhóm Phong Cách
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Bấm vào nhóm để xem sản phẩm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const meta = categoryImages[cat.slug] || {
              image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
              subtitle: cat.description || 'Bộ sưu tập thời trang thiết kế cao cấp'
            };
            const productCount = products.filter(p => p.category === cat.name).length;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition duration-300 cursor-pointer"
              >
                <img
                  src={meta.image}
                  alt={cat.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg group-hover:text-indigo-300 transition">{cat.name}</h3>
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full backdrop-blur">
                      {productCount} mẫu
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{cat.description || meta.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3 text-white/90 group-hover:translate-x-1 transition">
                    Lọc sản phẩm <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products Grid with Category Tabs & Filter */}
      <section id="featured" className="space-y-8 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold tracking-widest text-orange-600 uppercase">Catalog Trực Tuyến</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Bộ Sưu Tập Thời Trang Thiết Kế
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{filteredProducts.length}</strong> / {products.length} sản phẩm từ Database
          </span>
        </div>

        {/* Category Tabs & Controls Bar */}
        <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>Tất cả ({products.length})</span>
            </button>
            {categories.map((cat) => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.name ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mẫu trang phục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-2 bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="rating">Đánh giá sao</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Product Image & Quick Preview trigger */}
                <div 
                  className="relative aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenDetail(p)}
                >
                  <img
                    src={getProductImage(p.image)}
                    alt={p.name}
                    loading="lazy"
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {p.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur text-white text-[11px] font-bold shadow-md">
                      {p.tag}
                    </span>
                  )}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur">
                      Chỉ còn {p.stock} chiếc
                    </span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-bold backdrop-blur">
                      Hết hàng
                    </span>
                  )}

                  {/* Hover Overlay with Quick View Eye Icon */}
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" /> Xem chi tiết
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-red-500 shadow-md backdrop-blur transition z-10"
                    title="Thêm vào yêu thích"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({p.reviewsCount})</span>
                      </div>
                    </div>
                    <h3 
                      onClick={() => handleOpenDetail(p)}
                      className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-2 cursor-pointer leading-snug"
                    >
                      {p.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">
                        {p.price.toLocaleString('vi-VN')} ₫
                      </div>
                      {p.originalPrice && (
                        <div className="text-[11px] text-slate-400 line-through">
                          {p.originalPrice.toLocaleString('vi-VN')} ₫
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(p)}
                        disabled={p.stock === 0}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition flex items-center gap-1"
                        title="Chọn size & màu"
                      >
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Mua
                      </button>

                      <button
                        onClick={() => handleQuickAdd(p)}
                        disabled={p.stock === 0}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 text-white transition shadow-xs"
                        title="Thêm nhanh vào giỏ"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lookbook / Promo Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-700 via-amber-900 to-slate-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Tag className="w-4 h-4" /> Ưu Đãi Độc Quyền
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Giảm Ngay 20% Cho Đơn Hàng Đầu Tiên
          </h2>
          <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
            Đăng ký tài khoản và áp dụng mã voucher <strong className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">FASHION20</strong> tại bước thanh toán.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-amber-50 transition shadow-lg"
            >
              Nhận voucher ngay <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Developer & Architecture System Panel */}
      <section className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowDevPanel(!showDevPanel)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-200/60 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Bảng Giám Sát Hạ Tầng & Kết Nối Micro-Monolith (Dành cho Developer)
              </h4>
              <p className="text-[11px] text-slate-500">
                Kiểm tra kết nối trực tiếp React (5173) → Spring Cloud Gateway (8081) → Backend API (8080)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>{showDevPanel ? 'Thu gọn' : 'Xem thông số'}</span>
            {showDevPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDevPanel && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-600">
                  Endpoint: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-600">http://localhost:8081/api/health</code>
                </p>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Đang kiểm tra...' : 'Gửi Ping Gateway'}
              </button>
            </div>

            {health && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <span className="font-bold">Gateway & Backend phản hồi 200 OK:</span>
                  <pre className="mt-1 font-mono bg-white/80 p-2 rounded border border-emerald-200 overflow-x-auto">
                    {JSON.stringify(health, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Không thể kết nối tới Gateway:</span>
                  <p className="mt-0.5 text-amber-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
