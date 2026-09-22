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
  Filter, 
  Download, 
  PlusCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'COMPLETED' | 'PROCESSING' | 'SHIPPED' | 'PENDING';
  date: string;
  itemsCount: number;
}

const mockOrders: OrderItem[] = [
  { id: 'ORD-2026-901', customer: 'Nguyễn Văn A', email: 'vana@gmail.com', total: 1250000, status: 'PROCESSING', date: '22/09/2026 09:15', itemsCount: 3 },
  { id: 'ORD-2026-902', customer: 'Trần Thị Mai', email: 'maitt@gmail.com', total: 890000, status: 'COMPLETED', date: '22/09/2026 08:40', itemsCount: 2 },
  { id: 'ORD-2026-903', customer: 'Lê Hoàng Long', email: 'longlh@yahoo.com', total: 2450000, status: 'SHIPPED', date: '21/09/2026 19:20', itemsCount: 4 },
  { id: 'ORD-2026-904', customer: 'Phạm Thu Trang', email: 'trangpt@gmail.com', total: 450000, status: 'PENDING', date: '21/09/2026 16:05', itemsCount: 1 },
  { id: 'ORD-2026-905', customer: 'Đỗ Quốc Bảo', email: 'baodq@gmail.com', total: 3100000, status: 'COMPLETED', date: '21/09/2026 14:10', itemsCount: 5 },
];

const mockProducts = [
  { id: 1, name: 'Áo sơ mi Oxford Premium', category: 'Thời trang Nam', price: 550000, stock: 45, status: 'Đang bán', sales: 128 },
  { id: 2, name: 'Đầm lụa Maxi Dạ tiệc', category: 'Thời trang Nữ', price: 1200000, stock: 12, status: 'Sắp hết', sales: 94 },
  { id: 3, name: 'Áo Blazer Oversize Minimalist', category: 'Unisex', price: 950000, stock: 30, status: 'Đang bán', sales: 215 },
  { id: 4, name: 'Quần tây Form rộng Ý', category: 'Thời trang Nam', price: 680000, stock: 24, status: 'Đang bán', sales: 86 },
  { id: 5, name: 'Túi xách da Crossbody', category: 'Phụ kiện', price: 850000, stock: 4, status: 'Cảnh báo kho', sales: 310 },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSyncRedis = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 900);
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Hoàn tất</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Đang xử lý</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><ShoppingBag className="w-3 h-3" /> Đang giao</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3" /> Chờ duyệt</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Hệ thống Quản trị Cấp cao (Admin Control Center)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào, {user?.fullName || 'Quản trị viên'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Theo dõi thời gian thực doanh thu, đơn hàng, hệ thống hạ tầng Micro-monolith và phân quyền người dùng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncRedis}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition backdrop-blur disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang xoá cache...' : 'Đồng bộ Cache Redis'}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30">
            <PlusCircle className="w-3.5 h-3.5" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã làm mới toàn bộ bộ nhớ đệm phân tán Redis (Port 6379)! Dữ liệu catalog và session đã được đồng bộ.</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doanh thu tháng 09</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">128.540.000 ₫</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% so với tháng trước
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đơn hàng mới</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">342 đơn</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +8.5% tuần này
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sản phẩm kích hoạt</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">1,420 SKU</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>96.4% còn trong kho</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng thành viên</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">8,924 user</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +21.0% tháng này
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
          Tổng quan & Đơn hàng
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 relative transition ${activeTab === 'products' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Kho hàng & Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition ${activeTab === 'system' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Hạ tầng kỹ thuật & Microservices
        </button>
      </div>

      {/* Tab Content 1: Overview & Orders */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Đơn hàng mới nhất toàn hệ thống</h3>
                <p className="text-xs text-slate-500">Cập nhật theo thời gian thực từ cơ sở dữ liệu PostgreSQL</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn / khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-48 sm:w-64"
                  />
                </div>
                <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Download className="w-4 h-4" />
                </button>
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
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Thời gian</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 text-xs">{order.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900">{order.customer}</div>
                        <div className="text-xs text-slate-400">{order.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">{order.itemsCount} sản phẩm</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {order.total.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{order.date}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="p-1 text-slate-400 hover:text-indigo-600 transition" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Danh mục thời trang & Tồn kho</h3>
              <p className="text-xs text-slate-500">Quản lý giá niêm yết, định lượng tồn kho và doanh số</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">
              <PlusCircle className="w-3.5 h-3.5" /> Tạo mẫu mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Tên sản phẩm</th>
                  <th className="px-5 py-3">Danh mục</th>
                  <th className="px-5 py-3">Giá bán</th>
                  <th className="px-5 py-3">Tồn kho</th>
                  <th className="px-5 py-3">Đã bán</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{p.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{p.category}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{p.price.toLocaleString('vi-VN')} ₫</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{p.stock} chiếc</td>
                    <td className="px-5 py-3.5 text-xs">{p.sales} chiếc</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Technical / Microservices */}
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

          <div className="bg-slate-900 text-white rounded-xl p-6">
            <h4 className="font-semibold text-sm text-indigo-400 mb-2">Thông số cấu hình môi trường</h4>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`GATEWAY_PORT=8081
BACKEND_PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/fashion_store_db
REDIS_HOST=localhost:6379
JWT_EXPIRATION_MS=86400000 (24h)
REFRESH_TOKEN_EXPIRATION_MS=604800000 (7 days)`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
