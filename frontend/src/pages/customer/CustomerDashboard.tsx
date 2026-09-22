import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Award, 
  Ticket, 
  Truck, 
  CheckCircle2, 
  Plus, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface CustomerOrder {
  id: string;
  orderDate: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED';
  items: { name: string; size: string; color: string; price: number; qty: number }[];
  trackingCode: string;
  carrier: string;
}

const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'ORD-FS-9912',
    orderDate: '21/09/2026',
    total: 1540000,
    status: 'SHIPPING',
    trackingCode: 'GHTK-88129034',
    carrier: 'Giao Hàng Tiết Kiệm',
    items: [
      { name: 'Áo Blazer Oversize Minimalist', size: 'L', color: 'Đen Charcoal', price: 950000, qty: 1 },
      { name: 'Áo sơ mi Oxford Premium', size: 'L', color: 'Trắng tinh khôi', price: 590000, qty: 1 },
    ],
  },
  {
    id: 'ORD-FS-9840',
    orderDate: '15/09/2026',
    total: 1200000,
    status: 'DELIVERED',
    trackingCode: 'VTP-44218890',
    carrier: 'Viettel Post',
    items: [
      { name: 'Đầm lụa Maxi Dạ tiệc', size: 'M', color: 'Xanh Emerald', price: 1200000, qty: 1 },
    ],
  },
];

const mockVouchers = [
  { code: 'FREESHIP50K', title: 'Miễn phí giao hàng toàn quốc', minOrder: 'Đơn từ 300.000 ₫', expiry: '30/09/2026' },
  { code: 'FASHION20', title: 'Giảm 20% BST Thu Đông 2026', minOrder: 'Đơn từ 800.000 ₫', expiry: '15/10/2026' },
  { code: 'VIPMEMBER', title: 'Ưu đãi hạng Bạc - Giảm 50.000 ₫', minOrder: 'Mọi đơn hàng', expiry: '31/12/2026' },
];

const mockWishlist = [
  { id: 101, name: 'Quần tây Form rộng Ý', price: 680000, tag: 'Bán chạy', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60' },
  { id: 102, name: 'Túi xách da Crossbody', price: 850000, tag: 'New Season', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=60' },
];

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'vouchers' | 'addresses' | 'wishlist'>('orders');

  const renderTimeline = (status: CustomerOrder['status']) => {
    const steps = [
      { label: 'Đã đặt hàng', key: 'PENDING' },
      { label: 'Đã xác nhận', key: 'CONFIRMED' },
      { label: 'Đang vận chuyển', key: 'SHIPPING' },
      { label: 'Giao thành công', key: 'DELIVERED' },
    ];

    const getStepIndex = (st: CustomerOrder['status']) => {
      switch (st) {
        case 'PENDING': return 0;
        case 'CONFIRMED': return 1;
        case 'SHIPPING': return 2;
        case 'DELIVERED': return 3;
      }
    };

    const currentIdx = getStepIndex(status);

    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
            style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium ${isCompleted ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.fullName || 'Quý khách'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Award className="w-3.5 h-3.5" /> Thành viên Bạc
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Loyalty Points Card */}
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 min-w-[240px]">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
              <span>Điểm thưởng tích lũy</span>
              <span className="font-bold text-amber-400 text-sm">850 / 1.000 điểm</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-gradient-to-r from-amber-400 to-amber-200 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Tích thêm 150 điểm để nâng hạng Vàng (Gold)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'orders' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Đơn hàng của tôi ({mockCustomerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'vouchers' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" /> Ví ưu đãi & Voucher ({mockVouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'wishlist' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" /> Yêu thích ({mockWishlist.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'addresses' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" /> Sổ địa chỉ nhận hàng
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {mockCustomerOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-xs text-slate-400">• Ngày đặt: {order.orderDate}</span>
                  </div>
                  <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5" /> {order.carrier} | Mã vận đơn: <span className="font-mono">{order.trackingCode}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Tổng thanh toán</div>
                  <div className="text-lg font-bold text-slate-900">{order.total.toLocaleString('vi-VN')} ₫</div>
                </div>
              </div>

              {/* Order Timeline */}
              {renderTimeline(order.status)}

              {/* Items in order */}
              <div className="bg-slate-50 rounded-xl p-4 divide-y divide-slate-200/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500">Phân loại: {item.color} | Size: {item.size} | Số lượng: {item.qty}</p>
                    </div>
                    <div className="font-semibold text-sm text-slate-900">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Chi tiết đơn hàng
                </button>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Mua lại các sản phẩm này
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vouchers Tab */}
      {activeTab === 'vouchers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockVouchers.map((v, idx) => (
            <div key={idx} className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-5 relative shadow-sm hover:border-indigo-400 transition">
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                {v.code}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-3">{v.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{v.minOrder}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>HSD: {v.expiry}</span>
                <button className="text-indigo-600 font-semibold hover:underline">Sử dụng ngay</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {mockWishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                <p className="text-base font-bold text-indigo-600 mt-1">{item.price.toLocaleString('vi-VN')} ₫</p>
                <button className="w-full mt-3 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition">
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">{user?.fullName || 'Khách hàng'}</span>
                <span className="text-xs text-slate-500">| 0912 345 678</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">Mặc định</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Số 45, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Sửa</button>
            </div>
          </div>

          <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center justify-center gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" /> Thêm địa chỉ nhận hàng mới
          </button>
        </div>
      )}
    </div>
  );
};
