import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Printer, 
  Search, 
  Phone, 
  MapPin, 
  Send,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StaffOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản';
  isPaid: boolean;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}

const initialOrders: StaffOrder[] = [
  {
    id: 'ORD-8801',
    customerName: 'Hoàng Minh Tuấn',
    phone: '0912 345 678',
    address: 'Số 45, Đường Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM',
    items: ['1x Áo sơ mi Oxford (Size L)', '1x Quần tây Form Ý (Size 32)'],
    total: 1230000,
    paymentMethod: 'VNPAY',
    isPaid: true,
    status: 'PENDING',
    createdAt: '10 phút trước',
  },
  {
    id: 'ORD-8802',
    customerName: 'Đặng Ngọc Ánh',
    phone: '0988 765 432',
    address: '128 Cầu Giấy, P. Quan Hoa, Cầu Giấy, Hà Nội',
    items: ['1x Đầm lụa Maxi Dạ tiệc (Size M)'],
    total: 1200000,
    paymentMethod: 'COD',
    isPaid: false,
    status: 'PENDING',
    createdAt: '25 phút trước',
  },
  {
    id: 'ORD-8803',
    customerName: 'Phan Quốc Việt',
    phone: '0933 112 233',
    address: '22 Ngô Quyền, P. 6, Đà Lạt, Lâm Đồng',
    items: ['1x Áo Blazer Oversize (Size XL)', '1x Cà vạt lụa cao cấp'],
    total: 1350000,
    paymentMethod: 'Chuyển khoản',
    isPaid: true,
    status: 'PROCESSING',
    createdAt: '1 giờ trước',
  },
  {
    id: 'ORD-8804',
    customerName: 'Vũ Thị Hằng',
    phone: '0977 889 900',
    address: '15 Trần Phú, P. Hải Châu 1, Hải Châu, Đà Nẵng',
    items: ['2x Áo thun Organic Cotton (Size S, M)'],
    total: 700000,
    paymentMethod: 'COD',
    isPaid: false,
    status: 'SHIPPED',
    createdAt: '3 giờ trước',
  },
  {
    id: 'ORD-8805',
    customerName: 'Ngô Kiến Huy',
    phone: '0909 667 788',
    address: '88 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM',
    items: ['1x Túi xách da Crossbody'],
    total: 850000,
    paymentMethod: 'VNPAY',
    isPaid: true,
    status: 'DELIVERED',
    createdAt: 'Hôm qua',
  },
];

const lowStockItems = [
  { name: 'Túi xách da Crossbody', sku: 'ACC-BG-004', remaining: 3, minThreshold: 10 },
  { name: 'Đầm lụa Maxi Dạ tiệc (Size S)', sku: 'DRS-MX-002-S', remaining: 2, minThreshold: 8 },
  { name: 'Thắt lưng da Mill Grain', sku: 'ACC-BLT-012', remaining: 4, minThreshold: 15 },
];

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApproveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'PROCESSING' } : o))
    );
    showToast(`Đã duyệt đơn #${orderId} chuyển sang Đóng gói & Xử lý!`);
  };

  const handleShipOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'SHIPPED' } : o))
    );
    showToast(`Đã bàn giao đơn #${orderId} cho đơn vị vận chuyển (GHTK/ViettelPost)!`);
  };

  const handlePrintSlip = (orderId: string) => {
    showToast(`Đã gửi lệnh in phiếu đóng gói cho đơn #${orderId}!`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'ALL' || o.status === activeTab;
    const matchesQuery =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);
    return matchesTab && matchesQuery;
  });

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
    SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-4 h-4" /> Kênh Xử Lý Đơn Hàng & Kho Vận (Staff Fulfillment Portal)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Khu vực làm việc nhân viên
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Nhân viên: <span className="font-semibold text-white">{user?.fullName || 'Staff User'}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-teal-300">{counts.PENDING}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wide">Cần duyệt gấp</div>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-amber-300">{counts.PROCESSING}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wide">Đang đóng hàng</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Low Stock Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Cảnh báo tồn kho sắp hết ({lowStockItems.length} mẫu mã)</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Các mặt hàng dưới đây còn ít hơn số lượng ngưỡng an toàn. Vui lòng lập đề xuất nhập thêm hàng.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {lowStockItems.map((item, idx) => (
            <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium whitespace-nowrap shadow-xs">
              {item.name}: <strong className="text-red-600">{item.remaining}</strong> chiếc
            </span>
          ))}
        </div>
      </div>

      {/* Main Order Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chờ duyệt ({counts.PENDING})
            </button>
            <button
              onClick={() => setActiveTab('PROCESSING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'PROCESSING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Đang đóng gói ({counts.PROCESSING})
            </button>
            <button
              onClick={() => setActiveTab('SHIPPED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'SHIPPED'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Đang giao ({counts.SHIPPED})
            </button>
            <button
              onClick={() => setActiveTab('DELIVERED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hoàn tất ({counts.DELIVERED})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({counts.ALL})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none w-full sm:w-72"
            />
          </div>
        </div>

        {/* Orders Card List */}
        <div className="divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50/70 transition">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                      <span className="text-xs text-slate-400">• {order.createdAt}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.isPaid ? 'Đã thanh toán online' : 'Thu tiền tận nơi (COD)'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">[{order.paymentMethod}]</span>
                    </div>

                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span>{order.customerName}</span>
                      <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {order.phone}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </div>

                    <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-xs font-medium text-slate-600 mb-1">Mặt hàng đặt mua:</div>
                      <ul className="text-xs text-slate-700 space-y-0.5 list-disc list-inside">
                        {order.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 min-w-[200px]">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tổng thanh toán</div>
                      <div className="text-lg font-bold text-slate-900">
                        {order.total.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <button
                        onClick={() => handlePrintSlip(order.id)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        title="In phiếu đóng gói"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Xác nhận duyệt đơn
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Bàn giao vận chuyển
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-semibold bg-purple-50 px-2.5 py-1.5 rounded-lg">
                          <Truck className="w-3.5 h-3.5" /> Đang vận chuyển
                        </span>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã giao thành công
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
