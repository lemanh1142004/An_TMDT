import React, { useState } from 'react';
import { X, CheckCircle, Tag, Truck, CreditCard, Banknote, Package, QrCode } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Order, CartItem } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PaymentGatewayModal } from './PaymentGatewayModal';

interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  itemsToCheckout?: CartItem[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen: propIsOpen, 
  onClose: propOnClose, 
  itemsToCheckout: propItems 
}) => {
  const { cart, createOrder, isCheckoutOpen, closeCheckout, checkoutItems } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCheckoutOpen;
  const onClose = propOnClose || closeCheckout;

  const rawItems = (propItems && propItems.length > 0)
    ? propItems
    : (checkoutItems && checkoutItems.length > 0 ? checkoutItems : cart);
  const activeItems = (rawItems || []).filter((item) => item && item.product && typeof item.product.price === 'number');

  // ALL hooks must be called unconditionally at top level
  const [customerName, setCustomerName] = useState(user?.fullName || 'Trần Thị Khách Hàng');
  const [phone, setPhone] = useState(user?.phoneNumber || '0903 456 789');
  const [address, setAddress] = useState('Số 45, Đường Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'Chuyển khoản' | 'Thẻ quốc tế' | 'Ví MoMo'>('COD');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = activeItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);

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

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        customerEmail: user?.email || 'customer@fashionstore.com',
        customerName,
        phone,
        address,
        paymentMethod,
        discountCode: appliedVoucher || undefined,
        note,
        items: activeItems.map((item) => ({
          productId: item.product?.id,
          size: item.size || 'L',
          color: item.color || 'Tiêu chuẩn',
          quantity: item.quantity || 1,
        })),
      });
      setCreatedOrder(order);
      if (paymentMethod !== 'COD') {
        setIsGatewayOpen(true);
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              createdOrder.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {createdOrder.isPaid ? 'Đặt Hàng & Thanh Toán Thành Công!' : 'Đặt Hàng Thành Công!'}
              </h3>
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

            {/* Payment Status banner */}
            {createdOrder.isPaid ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong>Đã thanh toán online thành công</strong>
                    <div className="text-[11px] text-emerald-700 font-mono">Mã GD: {createdOrder.transactionCode}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsGatewayOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs whitespace-nowrap"
                >
                  Xem biên lai / hóa đơn
                </button>
              </div>
            ) : createdOrder.paymentMethod !== 'COD' ? (
              <div className="p-3.5 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-left">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <strong>Đơn hàng đang chờ thanh toán online</strong>
                    <p className="text-[11px] text-amber-700">Bạn có thể hoàn tất thanh toán ngay để kho xuất hàng sớm.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGatewayOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap flex items-center gap-1.5"
                >
                  💳 Mở cổng thanh toán ngay
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-700 border border-slate-200 flex items-center gap-2 text-left">
                <Truck className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span>
                  Phương thức <strong>COD Tiền mặt</strong>: Bạn sẽ thanh toán cho bưu tá khi nhận kiện hàng.
                </span>
              </div>
            )}

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
              {/* Selective Checkout Banner if purchasing partial items */}
              {activeItems.length < cart.length && (
                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Thanh toán riêng <strong>{activeItems.length} sản phẩm</strong></span>
                  </div>
                  <span className="text-[10px] bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                    {cart.length - activeItems.length} món khác còn lưu trong giỏ
                  </span>
                </div>
              )}

              {/* Items preview preview strip */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Sản phẩm thanh toán ({activeItems.length})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
                  {activeItems.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 pt-1.5 first:pt-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={it.product?.image || ''} 
                          alt={it.product?.name || 'Sản phẩm'} 
                          className="w-9 h-11 object-cover rounded-lg bg-slate-200 flex-shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{it.product?.name || 'Sản phẩm'}</p>
                          <p className="text-[11px] text-slate-500">
                            Size: <span className="font-semibold text-slate-700">{it.size || 'L'}</span> | Màu: <span className="font-semibold text-slate-700">{it.color || 'Tiêu chuẩn'}</span> x {it.quantity || 1}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 flex-shrink-0">
                        {((it.product?.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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

              {/* Payment Methods - Streamlined to VietQR BIDV and COD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: VietQR 24/7 BIDV */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Chuyển khoản')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      paymentMethod === 'Chuyển khoản'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      paymentMethod === 'Chuyển khoản' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">VietQR 24/7 (BIDV)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Quét mã QR từ mọi ngân hàng (VCB, MB, TCB...) về STK BIDV
                      </p>
                    </div>
                  </button>

                  {/* Option 2: COD Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      paymentMethod === 'COD' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">COD Tiền mặt</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Nhận hàng trả tiền
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Thanh toán tiền mặt cho shipper khi nhận kiện hàng
                      </p>
                    </div>
                  </button>
                </div>

                {/* Dynamic Payment Method Guidance */}
                <div className="mt-2.5">
                  {paymentMethod === 'Chuyển khoản' && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-900 font-bold flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-emerald-600" /> Chuyển khoản VietQR Napas 24/7 (BIDV)
                        </strong>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">Tự động</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 leading-relaxed">
                        Thụ hưởng <strong>BIDV</strong>: STK <strong className="font-mono text-emerald-950 font-bold">8893884656</strong> (Chủ TK: <strong>LE VAN MANH</strong>).
                        <br />
                        Mã QR động chứa số tiền chính xác <strong className="text-emerald-900 font-bold">{total.toLocaleString('vi-VN')} ₫</strong> sẽ mở ngay khi bạn bấm Xác nhận.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2 animate-fadeIn">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Thanh toán tiền mặt khi nhận hàng (COD):</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Quý khách thanh toán tiền mặt trực tiếp cho bưu tá khi nhận kiện hàng. Được quyền đồng kiểm tra hàng trước khi trả tiền.
                        </p>
                      </div>
                    </div>
                  )}
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
                  <span>Tạm tính ({activeItems.length} món):</span>
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

              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition"
              >
                {isSubmitting ? 'Đang gửi đơn hàng lên hệ thống...' : `Xác Nhận Đặt Hàng (${total.toLocaleString('vi-VN')} ₫)`}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        order={createdOrder}
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onPaymentSuccess={(updated) => {
          setCreatedOrder(updated);
        }}
      />
    </div>
  );
};
