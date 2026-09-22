import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Package, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RootLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isStaff = user?.roles.includes('ROLE_STAFF');
  const isCustomer = user?.roles.includes('ROLE_CUSTOMER');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Notification Announcement Bar */}
      <div className="bg-slate-950 text-white text-[11px] py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ưu đãi Thu - Đông 2026: Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000 ₫</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center group-hover:bg-indigo-600 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">FASHION<span className="text-indigo-600">.STORE</span></span>
              <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">Haute Couture</span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link
              to="/"
              className={`hover:text-indigo-600 transition ${location.pathname === '/' ? 'text-indigo-600' : ''}`}
            >
              Trang chủ
            </Link>
            <a href="/#featured" className="hover:text-indigo-600 transition">
              Bộ sưu tập
            </a>
            <a href="/#featured" className="hover:text-indigo-600 transition">
              Thời trang Nữ
            </a>
            <a href="/#featured" className="hover:text-indigo-600 transition">
              Thời trang Nam
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Portals Quick Access for Logged-in Users */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Quản trị Admin</span>
                  </Link>
                )}

                {(isStaff || isAdmin) && (
                  <Link
                    to="/staff"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      location.pathname.startsWith('/staff')
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kênh Nhân viên</span>
                  </Link>
                )}

                {isCustomer && (
                  <Link
                    to="/customer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      location.pathname.startsWith('/customer')
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tủ đồ & Đơn mua</span>
                  </Link>
                )}
              </div>
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
      </header>

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
                <li><Link to="/customer" className="hover:text-white transition">Theo dõi đơn hàng</Link></li>
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
            <p className="font-mono text-[11px]">Clean Architecture • RBAC • Spring Security 6</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
