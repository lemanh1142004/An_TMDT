import React, { useState } from 'react';
import { X, CheckCircle, Tag, Truck, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, createOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.fullName || 'Trần Thị Khách Hàng');
  const [phone, setPhone] = useState(user?.phoneNumber || '0903 456 789');
  const [address, setAddress] = useState('Số 45, Đường Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'Chuyển khoản'>('COD');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Voucher calculation
  let discount = 0;
  if (appliedVoucher === 'FASHION20') {
    discount = Math.round(subtotal * 0.2);
  } else if (appliedVoucher === 'VIPMEMBER') {
    discount = 50000;
  }

  const baseShipping = subtotal >= 500000 ? 0 : 30000;
  const shippingFee = appliedVoucher === 'FREESHIP50K' ? 0 : baseShipping;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyVoucher = () => {
    setVoucherError(null);
    const code = voucherCode.trim().toUpperCase();
    if (code === 'FASHION20' || code === 'FREESHIP50K' || code === 'VIPMEMBER') {
      setAppliedVoucher(code);
    } else {
      setVoucherError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = createOrder({
      customerEmail: user?.email || 'customer@fashionstore.com',
      customerName,
      phone,
      address,
      paymentMethod,
      discountCode: appliedVoucher || undefined,
      note,
    });
    setCreatedOrder(order);
  };

  const handleFinish = () => {
    onClose();
    setCreatedOrder(null);
    navigate('/customer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 overflow-hidden z-10 animate-fadeIn">
        {/* Success View */}
        {createdOrder ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Đặt Hàng Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mã đơn hàng: <strong className="font-mono text-indigo-600">{createdOrder.id}</strong>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 text-left space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <span className="font-semibold">{createdOrder.customerName} ({createdOrder.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="font-semibold text-right max-w-[280px]">{createdOrder.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-semibold">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="font-bold text-indigo-600 text-sm">
                  {createdOrder.total.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-[11px] text-amber-800 border border-amber-200 flex items-center gap-2 text-left">
              <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Đơn hàng đã được chuyển tự động sang bộ phận kho vận <strong>(Staff Workspace)</strong> để kiểm tra và đóng gói.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition"
              >
                Xem tiến trình đơn hàng tại Tủ đồ
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Xác nhận đặt hàng</h2>
                <p className="text-xs text-slate-500">Hoàn tất thông tin nhận hàng và phương thức thanh toán</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 pt-4">
              {/* Recipient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên người nhận *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ giao hàng chi tiết *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'COD'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1 text-slate-700" />
                    <span className="text-xs">COD Tiền mặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VNPAY')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'VNPAY'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
                    <span className="text-xs">VNPAY QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Chuyển khoản')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'Chuyển khoản'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
                    <span className="text-xs">Chuyển khoản</span>
                  </button>
                </div>
              </div>

              {/* Voucher Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã ưu đãi / Voucher</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Gợi ý: FASHION20, FREESHIP50K"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg uppercase font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedVoucher && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ Đã áp dụng mã: {appliedVoucher}
                  </p>
                )}
                {voucherError && (
                  <p className="text-[11px] text-red-500 mt-1">{voucherError}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho shipper</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước 15 phút..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Price summary */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({cart.length} món):</span>
                  <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá voucher:</span>
                    <span>-{discount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Phí giao hàng:</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} ₫`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-indigo-600">{total.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg transition"
              >
                Xác Nhận Đặt Hàng ({total.toLocaleString('vi-VN')} ₫)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
