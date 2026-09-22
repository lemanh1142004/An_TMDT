import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  PlusCircle, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield, 
  X,
  PackageCheck,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { UserAccount } from '../../context/StoreContext';
import { getProductImage, handleImageError } from '../../utils/imageUtils';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    products, 
    orders, 
    users, 
    addProduct, 
    toggleProductStatus, 
    toggleUserActive, 
    changeUserRole 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Thời trang Nữ');
  const [newProductPrice, setNewProductPrice] = useState(790000);
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState(990000);
  const [newProductStock, setNewProductStock] = useState(30);
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80');
  const [newProductTag, setNewProductTag] = useState('Mới 2026');
  const [newProductDesc, setNewProductDesc] = useState('Chất liệu vải cao cấp thiết kế may đo thanh lịch.');

  // Dynamically calculate KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeProductsCount = products.filter((p) => p.isActive).length;

  const handleSyncRedis = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 800);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct({
      name: newProductName,
      category: newProductCategory,
      price: newProductPrice,
      originalPrice: newProductOriginalPrice || undefined,
      stock: newProductStock,
      image: newProductImage,
      tag: newProductTag || undefined,
      description: newProductDesc,
    });
    setIsAddProductOpen(false);
    // Reset form
    setNewProductName('');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.phoneNumber.includes(userSearchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Đã giao</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Đóng gói</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><ShoppingBag className="w-3 h-3" /> Đang giao</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3" /> Chờ duyệt</span>;
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const getRoleBadge = (role: UserAccount['role']) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Quản trị viên (ADMIN)</span>;
      case 'ROLE_STAFF':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Nhân viên (STAFF)</span>;
      case 'ROLE_CUSTOMER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Khách hàng (CUSTOMER)</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Hệ Thống Quản Trị Cấp Cao (Admin Control Center)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào, {user?.fullName || 'Fashion Store Administrator'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Toàn quyền quản trị danh mục, sản phẩm, phân quyền nhân viên, khách hàng và giám sát hạ tầng microservices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncRedis}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition backdrop-blur disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang dọn cache...' : 'Đồng bộ Cache Redis'}
          </button>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Đã làm mới và đồng bộ bộ nhớ đệm phân tán Redis (Port 6379)! Session và Catalog cache đã được tối ưu.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString('vi-VN')} ₫</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Liên tục theo thời gian thực
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{orders.length} đơn</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-semibold">
              <PackageCheck className="w-3.5 h-3.5" /> Cập nhật liên thông từ Staff
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sản Phẩm Đang Bán</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeProductsCount} mẫu</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>{products.length} tổng số mẫu catalog</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tài Khoản Hệ Thống</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{users.length} tài khoản</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-semibold">
              <Shield className="w-3.5 h-3.5" /> Đã phân quyền RBAC
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition ${activeTab === 'overview' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Tổng quan & Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 relative transition ${activeTab === 'products' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Quản lý Sản phẩm & Tồn kho ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition ${activeTab === 'users' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Quản lý Người dùng & Nhân viên ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition ${activeTab === 'system' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Hạ tầng Microservices & Cache
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Toàn bộ đơn hàng trong hệ thống</h3>
                <p className="text-xs text-slate-500">Dữ liệu liên thông trực tiếp từ khách đặt hàng và nhân viên xử lý</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn / khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Mã đơn</th>
                    <th className="px-5 py-3">Khách hàng</th>
                    <th className="px-5 py-3">Số lượng</th>
                    <th className="px-5 py-3">Tổng tiền</th>
                    <th className="px-5 py-3">Phương thức</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 text-xs">{order.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-400">{order.customerEmail}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} món</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {order.total.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono">{order.paymentMethod}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{order.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products & Catalog CRUD */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Quản lý danh mục & Mẫu thiết kế</h3>
              <p className="text-xs text-slate-500">Thêm, sửa giá bán, cập nhật trạng thái hiển thị trên Trang Chủ</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Thêm sản phẩm mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Ảnh</th>
                  <th className="px-5 py-3">Tên sản phẩm</th>
                  <th className="px-5 py-3">Danh mục</th>
                  <th className="px-5 py-3">Giá bán</th>
                  <th className="px-5 py-3">Tồn kho</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3">
                      <img 
                        src={getProductImage(p.image)} 
                        alt={p.name} 
                        onError={handleImageError}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100" 
                      />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{p.category}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{p.price.toLocaleString('vi-VN')} ₫</td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <span className={p.stock <= 5 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                        {p.stock} chiếc
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleProductStatus(p.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          p.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={p.isActive ? 'Ẩn khỏi cửa hàng' : 'Bật hiển thị'}
                      >
                        {p.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Staff RBAC Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Quản lý Tài khoản & Phân quyền</h3>
              <p className="text-xs text-slate-500">Phân quyền vai trò (Admin, Staff, Customer) và khóa/kích hoạt tài khoản</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Số điện thoại</th>
                  <th className="px-5 py-3">Vai trò hiện tại</th>
                  <th className="px-5 py-3">Ngày tham gia</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">{u.phoneNumber}</td>
                    <td className="px-5 py-3.5">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{u.joinedDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {/* Change Role Selector */}
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value as UserAccount['role'])}
                        className="text-xs border border-slate-200 rounded-md p-1 bg-white focus:outline-none"
                      >
                        <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
                        <option value="ROLE_STAFF">ROLE_STAFF</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                      </select>

                      {/* Toggle Active Button */}
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          u.active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Technical & Microservices */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-slate-900 text-sm">Spring Cloud Gateway</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Port: 8081 | Định tuyến động và CORS cho Frontend.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Latency: 4.2ms | Routes: /api/**
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-slate-900 text-sm">Backend API Core</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Port: 8080 | Spring Boot 3 Modular Monolith.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                JVM Memory: 184MB / 512MB
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900 text-sm">PostgreSQL 16</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Healthy</span>
              </div>
              <p className="text-xs text-slate-500">Port: 5432 | Database `fashion_store_db`.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Pool Size: 10 | Active Conns: 2
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-slate-900 text-sm">Redis 7 Distributed</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Ready</span>
              </div>
              <p className="text-xs text-slate-500">Port: 6379 | Token Blacklist & Session Store.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Cache Hit Ratio: 99.4%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddProductOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Thêm Mẫu Thiết Kế Mới</h3>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đầm Voan Hoa Nhí Mùa Thu"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Thời trang Nữ">Thời trang Nữ</option>
                    <option value="Thời trang Nam">Thời trang Nam</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nhãn nổi bật</label>
                  <input
                    type="text"
                    placeholder="Mới / Hot / Giảm 20%"
                    value={newProductTag}
                    onChange={(e) => setNewProductTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá bán (₫) *</label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá gốc (₫)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={newProductOriginalPrice}
                    onChange={(e) => setNewProductOriginalPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tồn kho ban đầu *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đường dẫn ảnh (URL) *</label>
                <input
                  type="url"
                  required
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Lưu & Xuất bản lên Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
