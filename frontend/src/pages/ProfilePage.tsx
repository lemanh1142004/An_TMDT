import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Phone, Shield, Calendar, LogOut, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    role === 'ROLE_ADMIN'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" /> Thông tin cá nhân
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400" /> Họ và tên
              </span>
              <span className="font-medium text-slate-800">{user.fullName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email
              </span>
              <span className="font-medium text-slate-800">{user.email}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Số điện thoại
              </span>
              <span className="font-medium text-slate-800">{user.phoneNumber || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Ngày tham gia
              </span>
              <span className="font-medium text-slate-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" /> Bảo mật & Phân quyền
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Hình thức xác thực</span>
              <span className="font-medium text-slate-800">{user.authProvider}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mã định danh User ID</span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">#{user.id}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Trạng thái JWT Session</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Valid & Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
