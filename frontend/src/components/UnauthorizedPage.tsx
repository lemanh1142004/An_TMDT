import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  const getTargetDashboard = () => {
    if (!user) return '/login';
    if (user.roles.includes('ROLE_ADMIN')) return '/admin';
    if (user.roles.includes('ROLE_STAFF')) return '/staff';
    return '/customer';
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">403 - Quyền truy cập bị từ chối</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Tài khoản của bạn không có vai trò hợp lệ để xem trang này. Vui lòng quay trở lại cổng thông tin phù hợp với quyền hạn của bạn.
        </p>

        {user && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
            <span>Vai trò hiện tại: </span>
            <span className="font-semibold text-slate-800">
              {user.roles.join(', ')}
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={getTargetDashboard()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Về khu vực của tôi
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
