import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email, password });
      
      const isAdmin = loggedUser.roles?.includes('ROLE_ADMIN');
      const isStaff = loggedUser.roles?.includes('ROLE_STAFF');
      const isCustomer = loggedUser.roles?.includes('ROLE_CUSTOMER');

      let targetDestination = '/';
      if (from && from !== '/profile' && from !== '/login' && from !== '/unauthorized') {
        if (from.startsWith('/admin')) {
          targetDestination = isAdmin ? '/admin' : isStaff ? '/staff' : '/customer';
        } else if (from.startsWith('/staff')) {
          targetDestination = isStaff ? '/staff' : isAdmin ? '/admin' : '/customer';
        } else if (from.startsWith('/customer')) {
          targetDestination = isCustomer ? '/customer' : isAdmin ? '/admin' : '/staff';
        } else {
          targetDestination = from;
        }
      } else {
        if (isAdmin) targetDestination = '/admin';
        else if (isStaff) targetDestination = '/staff';
        else targetDestination = '/customer';
      }

      navigate(targetDestination, { replace: true });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin hoặc đảm bảo hệ thống đang chạy.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
          <p className="text-sm text-slate-500 mt-1">Chào mừng bạn quay trở lại với Fashion Store</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Đăng ký ngay
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-semibold text-slate-800 mb-2">Tài khoản demo sẵn có (Click để điền nhanh):</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@fashionstore.com');
                setPassword('AdminPassword123!');
              }}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5">ADMIN</span>
                <span className="font-mono text-slate-700">admin@fashionstore.com</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Nạp &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('staff@fashionstore.com');
                setPassword('StaffPassword123!');
              }}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5">STAFF</span>
                <span className="font-mono text-slate-700">staff@fashionstore.com</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Nạp &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('customer@fashionstore.com');
                setPassword('CustomerPassword123!');
              }}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5">CUSTOMER</span>
                <span className="font-mono text-slate-700">customer@fashionstore.com</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Nạp &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
