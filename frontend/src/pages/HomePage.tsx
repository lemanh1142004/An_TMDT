import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api';
import type { HealthCheckResponse } from '../types';
import { useStore } from '../context/StoreContext';
import type { Product } from '../context/StoreContext';

const categories = [
  {
    title: 'Thời Trang Nữ',
    subtitle: 'Hơn 450 mẫu thiết kế độc quyền',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    link: '#featured',
  },
  {
    title: 'Thời Trang Nam',
    subtitle: 'Lịch lãm, hiện đại và chuẩn mực',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    link: '#featured',
  },
  {
    title: 'Phụ Kiện Cao Cấp',
    subtitle: 'Túi da, thắt lưng & trang sức tối giản',
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&auto=format&fit=crop&q=80',
    link: '#featured',
  },
  {
    title: 'Giày & Boots',
    subtitle: 'Da thuộc thật 100% êm ái bền bỉ',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    link: '#featured',
  },
];

export const HomePage: React.FC = () => {
  const { products, addToCart, setIsCartOpen } = useStore();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 'L', 'Tiêu chuẩn', 1);
    setIsCartOpen(true);
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-950 text-white min-h-[480px] sm:min-h-[560px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
            alt="Fashion Hero Banner"
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
            Khám phá những thiết kế tối giản, may đo chuẩn xác cùng chất liệu vải hữu cơ thân thiện môi trường. Định nghĩa phong cách sống hiện đại của bạn.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#featured"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition shadow-lg shadow-white/10"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Mua sắm ngay
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

      {/* Featured Categories */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Danh mục thịnh hành</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Khám Phá Theo Nhóm Phong Cách
            </h2>
          </div>
          <a href="#featured" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Xem tất cả danh mục <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition duration-300"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <h3 className="font-bold text-lg group-hover:text-indigo-300 transition">{cat.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{cat.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3 text-white/90 group-hover:translate-x-1 transition">
                  Khám phá <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section id="featured" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold tracking-widest text-orange-600 uppercase">Sản phẩm nổi bật</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Bộ Sưu Tập Được Yêu Thích Nhất
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Cập nhật xu hướng mới nhất hàng tuần</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.filter(p => p.isActive).map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
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
                <button
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-red-500 shadow-md backdrop-blur transition"
                  title="Thêm vào yêu thích"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{p.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{p.rating}</span>
                      <span className="text-slate-400">({p.reviewsCount})</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition line-clamp-1">
                    {p.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {p.price.toLocaleString('vi-VN')} ₫
                    </div>
                    {p.originalPrice && (
                      <div className="text-xs text-slate-400 line-through">
                        {p.originalPrice.toLocaleString('vi-VN')} ₫
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {p.stock === 0 ? 'Tạm hết' : 'Thêm giỏ'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
