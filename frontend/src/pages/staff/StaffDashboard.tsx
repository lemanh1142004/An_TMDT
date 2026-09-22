import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  Printer, 
  Search, 
  Phone, 
  MapPin, 
  Send, 
  AlertTriangle,
  Boxes,
  Plus,
  X,
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { Order, Product } from '../../context/StoreContext';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, products, updateOrderStatus, restockProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Packing Slip Modal
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Restock Modal
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApprove = (orderId: string) => {
    updateOrderStatus(orderId, 'PROCESSING');
    showToast(`Đã duyệt đơn #${orderId}! Chuyển sang trạng thái Đóng gói & Xử lý.`);
  };

  const handleShip = (orderId: string) => {
    updateOrderStatus(orderId, 'SHIPPED');
    showToast(`Đã bàn giao đơn #${orderId} cho đơn vị vận chuyển (GHTK Express)!`);
  };

  const handleDeliver = (orderId: string) => {
    updateOrderStatus(orderId, 'DELIVERED');
    showToast(`Đơn #${orderId} đã được xác nhận giao thành công!`);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockingProduct && restockQty > 0) {
      restockProduct(restockingProduct.id, restockQty);
      showToast(`Đã nhập thêm ${restockQty} sản phẩm vào kho cho "${restockingProduct.name}"!`);
      setRestockingProduct(null);
      setRestockQty(20);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= 5);

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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-4 h-4" /> Kênh Xử Lý Đơn Hàng & Kho Vận (Staff Workspace)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Khu vực làm việc nhân viên vận hành
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Nhân viên: <strong className="text-white">{user?.fullName || 'Nguyễn Văn Nhân Viên'}</strong> ({user?.email || 'staff@fashionstore.com'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-teal-300">{counts.PENDING}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wide">Cần duyệt ngay</div>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-amber-300">{counts.PROCESSING}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wide">Đang đóng gói</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Low Stock Alerts & Restock Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Cảnh báo tồn kho dưới ngưỡng an toàn ({lowStockProducts.length} mặt hàng)
              </h4>
              <p className="text-xs text-amber-700">
                Các sản phẩm dưới đây còn ít hơn 5 chiếc. Vui lòng bấm <strong>Nhập hàng</strong> để cập nhật số lượng tồn kho.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {lowStockProducts.map((p) => (
            <div key={p.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{p.name}</h5>
                  <p className="text-[11px] text-slate-500">
                    Tồn: <strong className="text-red-600 font-bold">{p.stock} chiếc</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockingProduct(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Nhập kho
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Order Queue Workspace */}
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
              Không có đơn hàng nào trong mục này.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50/70 transition">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Details */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {order.createdAt}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.isPaid ? 'Đã thanh toán online' : 'Thu tiền tận nơi (COD)'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">[{order.paymentMethod}]</span>
                    </div>

                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span>{order.customerName}</span>
                      <a
                        href={`tel:${order.phone}`}
                        className="text-xs font-normal text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded"
                      >
                        <Phone className="w-3 h-3" /> {order.phone}
                      </a>
                    </div>

                    <div className="text-xs text-slate-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </div>

                    {order.note && (
                      <div className="text-xs text-slate-600 bg-amber-50/70 p-2 rounded-lg border border-amber-100 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Ghi chú từ khách: <strong>{order.note}</strong></span>
                      </div>
                    )}

                    {/* Order items */}
                    <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-xs font-semibold text-slate-600 mb-1">Mặt hàng ({order.items.length}):</div>
                      <ul className="text-xs text-slate-700 space-y-0.5">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>• {item.name} ({item.color}, Size {item.size}) x<strong>{item.quantity}</strong></span>
                            <span className="font-medium text-slate-800">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 min-w-[210px]">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tổng thu tiền</div>
                      <div className="text-lg font-bold text-slate-900">
                        {order.total.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <button
                        onClick={() => setPrintingOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                        title="In phiếu xuất kho"
                      >
                        <Printer className="w-3.5 h-3.5" /> In phiếu
                      </button>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Duyệt đơn
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleShip(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Giao bưu tá
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleDeliver(order.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Xác nhận đã giao
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã hoàn tất
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

      {/* Restock Modal */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRestockingProduct(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Nhập thêm kho hàng</h3>
              </div>
              <button onClick={() => setRestockingProduct(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl">
              <img src={restockingProduct.image} alt={restockingProduct.name} className="w-14 h-14 object-cover rounded-lg" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{restockingProduct.name}</h4>
                <p className="text-[11px] text-slate-500">Tồn kho hiện tại: <strong className="text-red-600">{restockingProduct.stock}</strong> chiếc</p>
              </div>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng nhập thêm vào kho *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Số lượng sau khi nhập: <strong>{restockingProduct.stock + (restockQty || 0)}</strong> chiếc
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packing Slip Modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setPrintingOrder(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Phiếu xuất kho & Đóng gói</h3>
              </div>
              <button onClick={() => setPrintingOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Slip Content */}
            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl space-y-3 font-mono text-xs text-slate-800">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-bold text-sm">FASHION STORE LOGISTICS</div>
                <div className="text-[10px] text-slate-500">Mã vận đơn: {printingOrder.trackingCode}</div>
                <div className="font-bold text-indigo-600 mt-1">ĐƠN HÀNG: #{printingOrder.id}</div>
              </div>

              <div>
                <div><strong>Người nhận:</strong> {printingOrder.customerName} - {printingOrder.phone}</div>
                <div><strong>Địa chỉ:</strong> {printingOrder.address}</div>
                <div><strong>Phương thức:</strong> {printingOrder.paymentMethod} ({printingOrder.isPaid ? 'Đã TT' : 'Thu COD'})</div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="font-bold mb-1">Chi tiết đóng hàng:</div>
                {printingOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>{it.name} [{it.color}/{it.size}]</span>
                    <strong>x{it.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Tổng tiền:</span>
                <span>{printingOrder.total.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                  setPrintingOrder(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Printer className="w-4 h-4" /> In phiếu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
