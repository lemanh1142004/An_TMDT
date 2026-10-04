import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Package, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { ChatBubble } from '../components/ChatBubble';

export const RootLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    cart, 
    setIsCartOpen, 
    selectedCategory, 
    setSelectedCategory, 
    categories, 
    products 
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true, state: null });
  };

  // Active status detection
  const isHomeActive = location.pathname === '/' && selectedCategory === 'ALL' && location.hash !== '#collections';
  const isCollectionsActive = location.pathname === '/' && location.hash === '#collections';
  const isWomenActive = location.pathname === '/' && selectedCategory === 'Thời trang Nữ';
  const isMenActive = location.pathname === '/' && selectedCategory === 'Thời trang Nam';

  // Navigation handlers
  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedCategory('ALL');
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleGoCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedCategory('ALL');
    setIsCollectionsDropdownOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('collections');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#collections');
      }
    } else {
      navigate('/#collections');
    }
  };

  const handleGoCategory = (e: React.MouseEvent, catName: string, slug: string) => {
    e.preventDefault();
    setSelectedCategory(catName);
    setIsCollectionsDropdownOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('featured');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/?category=${slug}#featured`);
    }
  };

  // Strict role detection (Admin, Staff, Customer are mutually separated)
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isStaff = !isAdmin && user?.roles.includes('ROLE_STAFF');
  const isCustomer = !isAdmin && !isStaff && user?.roles.includes('ROLE_CUSTOMER');
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Notification Announcement Bar */}
      <div className="bg-slate-950 text-white text-[11px] py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ưu đãi Thu - Đông 2026: Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000 ₫ | Voucher FASHION20 (-20%)</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" onClick={handleGoHome} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center group-hover:bg-indigo-600 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">FASHION<span className="text-indigo-600">.STORE</span></span>
              <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">Haute Couture</span>
            </div>
          </Link>

          {/* Center Navigation with Active Filtering */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold">
            {/* 1. Trang chủ */}
            <button
              onClick={handleGoHome}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                isHomeActive
                  ? 'bg-indigo-50 text-indigo-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              Trang chủ
            </button>

            {/* 2. Bộ sưu tập (Click scrolls to collections, hover shows dropdown) */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCollectionsDropdownOpen(true)}
              onMouseLeave={() => setIsCollectionsDropdownOpen(false)}
            >
              <button
                onClick={handleGoCollections}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                  isCollectionsActive
                    ? 'bg-indigo-50 text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <span>Bộ sưu tập</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollectionsDropdownOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
              </button>

              {/* Collections Dropdown */}
              {isCollectionsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Danh mục bộ sưu tập
                  </div>
                  <button
                    onClick={handleGoCollections}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Khám phá toàn bộ nhóm ({products.length} mẫu)</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                  {categories.map((c) => {
                    const count = products.filter(p => p.category === c.name).length;
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => handleGoCategory(e, c.name, c.slug)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          selectedCategory === c.name
                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Thời trang Nữ */}
            <button
              onClick={(e) => handleGoCategory(e, 'Thời trang Nữ', 'thoi-trang-nu')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                isWomenActive
                  ? 'bg-indigo-50 text-indigo-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <span>Thời trang Nữ</span>
            </button>

            {/* 4. Thời trang Nam */}
            <button
              onClick={(e) => handleGoCategory(e, 'Thời trang Nam', 'thoi-trang-nam')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                isMenActive
                  ? 'bg-indigo-50 text-indigo-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <span>Thời trang Nam</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. ADMIN EXCLUSIVE: Only show Admin Management Portal */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản trị Admin</span>
              </Link>
            )}

            {/* 2. STAFF EXCLUSIVE: Only show Staff Fulfillment Portal */}
            {isStaff && (
              <Link
                to="/staff"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  location.pathname.startsWith('/staff')
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Kênh Nhân viên</span>
              </Link>
            )}

            {/* 3. CUSTOMER EXCLUSIVE: Show Customer Portal (Tủ đồ & Đơn mua) */}
            {isCustomer && (
              <Link
                to="/customer"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  location.pathname.startsWith('/customer')
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Tủ đồ & Đơn mua</span>
              </Link>
            )}

            {/* 4. SHOPPING CART: Available for Customers and Guests (Hidden for Admin & Staff) */}
            {!isAdmin && !isStaff && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                title="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                    {totalCartItems}
                  </span>
                )}
              </button>
            )}

            {/* Profile or Login */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  title="Cài đặt tài khoản"
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-100 transition text-xs font-semibold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Category Subnav */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2 px-4 border-t border-slate-100 bg-white/95 scrollbar-none text-xs font-semibold">
          <button
            onClick={handleGoHome}
            className={`px-3 py-1.5 rounded-lg flex-shrink-0 transition cursor-pointer ${
              isHomeActive ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={handleGoCollections}
            className={`px-3 py-1.5 rounded-lg flex-shrink-0 transition cursor-pointer ${
              isCollectionsActive ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bộ sưu tập
          </button>
          <button
            onClick={(e) => handleGoCategory(e, 'Thời trang Nữ', 'thoi-trang-nu')}
            className={`px-3 py-1.5 rounded-lg flex-shrink-0 transition cursor-pointer ${
              isWomenActive ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Thời trang Nữ
          </button>
          <button
            onClick={(e) => handleGoCategory(e, 'Thời trang Nam', 'thoi-trang-nam')}
            className={`px-3 py-1.5 rounded-lg flex-shrink-0 transition cursor-pointer ${
              isMenActive ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Thời trang Nam
          </button>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal />

      {/* Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Modern Fashion Footer */}
      <footer className="bg-slate-950 text-white mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <span>FASHION STORE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nền tảng thương mại điện tử thời trang may đo và thiết kế hiện đại, vận hành trên kiến trúc Micro-Monolith mở rộng.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Dành cho Khách hàng</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/customer" className="hover:text-white transition">Theo dõi đơn hàng (My Orders)</Link></li>
                <li><a href="#" className="hover:text-white transition">Chính sách đổi trả 30 ngày</a></li>
                <li><a href="#" className="hover:text-white transition">Bảng quy đổi kích cỡ (Size Guide)</a></li>
                <li><a href="#" className="hover:text-white transition">Hướng dẫn thanh toán VNPAY/COD</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Cổng Nhân viên & Quản trị</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/admin" className="hover:text-white transition">Bảng điều khiển Quản trị (Admin)</Link></li>
                <li><Link to="/staff" className="hover:text-white transition">Kênh Xử lý Đơn hàng (Staff)</Link></li>
                <li><Link to="/profile" className="hover:text-white transition">Hồ sơ & Bảo mật tài khoản</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Kiến trúc Công nghệ</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                React 19 + Spring Cloud Gateway 8081 + Spring Boot 3 Core 8080 + PostgreSQL + Redis.
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  Gateway :8081
                </span>
                <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-400">
                  Backend :8080
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Fashion Store Platform. Tất cả quyền được bảo lưu.</p>
            <p className="font-mono text-[11px]">Strict Role Isolation • RBAC • Spring Security 6</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Bubble for Customers & Visitors */}
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/staff') && (
        <ChatBubble />
      )}
    </div>
  );
};
