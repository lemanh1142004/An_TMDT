import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  Lock, 
  Building2, 
  Smartphone, 
  Wallet, 
  QrCode, 
  RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

interface PaymentGatewayModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (updatedOrder: Order) => void;
}

type PaymentTab = 'VIETQR' | 'VNPAY' | 'CARD' | 'MOMO';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { confirmPayment } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PaymentTab>('VIETQR');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState<string>(order?.customerName ? order.customerName.toUpperCase() : 'TRAN THI KHACH HANG');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('888');

  // ATM Bank Selection
  const [selectedBank, setSelectedBank] = useState<string>('VCB');
  const [atmCardNumber, setAtmCardNumber] = useState<string>('9704 3666 8888 9999');
  const [atmCardHolder, setAtmCardHolder] = useState<string>(order?.customerName ? order.customerName.toUpperCase() : 'TRAN THI KHACH HANG');
  const [atmIssueDate, setAtmIssueDate] = useState<string>('03/24');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('123456');
  const [otpTargetMethod, setOtpTargetMethod] = useState<'VNPAY_ATM' | 'CARD'>('CARD');

  // Simulated live VietQR balance check state
  const [autoCheckProgress, setAutoCheckProgress] = useState<number>(0);

  // Printable receipt reference
  const receiptRef = useRef<HTMLDivElement>(null);

  // Sync state when order changes
  useEffect(() => {
    if (order) {
      if (order.isPaid) {
        setPaidOrder(order);
      } else {
        setPaidOrder(null);
        // Default tab based on order paymentMethod
        if (order.paymentMethod === 'VNPAY') setActiveTab('VNPAY');
        else if (order.paymentMethod === 'Thẻ quốc tế') setActiveTab('CARD');
        else if (order.paymentMethod === 'Ví MoMo') setActiveTab('MOMO');
        else setActiveTab('VIETQR');
      }
      setTimeLeft(15 * 60);
    }
  }, [order]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || paidOrder || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paidOrder, timeLeft]);

  // VietQR Simulated checking pulse
  useEffect(() => {
    if (!isOpen || paidOrder || activeTab !== 'VIETQR') return;
    const interval = setInterval(() => {
      setAutoCheckProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 15;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, paidOrder, activeTab]);

  if (!isOpen || !order) return null;

  const orderNumericId = order.numericId || (typeof order.id === 'string' && order.id.startsWith('ORD-2026-') ? order.id.replace('ORD-2026-', '') : order.id);
  const formattedMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const formattedSeconds = String(timeLeft % 60).padStart(2, '0');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecutePayment = async (
    method: 'VNPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO',
    customTxnPrefix = 'TXN',
    bankName = 'Vietcombank'
  ) => {
    setIsProcessing(true);
    setProcessingMessage('Đang kết nối đến cổng thanh toán an toàn...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingMessage('Đang xác thực giao dịch và đối soát tài khoản...');
      await new Promise((r) => setTimeout(r, 600));

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const generatedTxn = `${customTxnPrefix}-${new Date().getFullYear()}-${randomSuffix}`;

      const updated = await confirmPayment(orderNumericId, {
        paymentMethod: method,
        transactionCode: generatedTxn,
        bankName,
      });

      setProcessingMessage('Thanh toán thành công! Đang xuất hóa đơn điện tử...');
      await new Promise((r) => setTimeout(r, 400));

      setPaidOrder(updated);
      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    } catch (err: any) {
      alert('Không thể xác nhận thanh toán: ' + (err.response?.data?.message || err.message || 'Lỗi kết nối'));
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
      setShowOtpModal(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseAndGoToDashboard = () => {
    onClose();
    navigate('/customer');
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // VietQR URL
  const vietQrAmount = order?.total || 0;
  const vietQrInfo = `FS ${order?.id || ''}`;
  const vietQrImageUrl = `https://img.vietqr.io/image/VCB-102839482901-compact2.png?amount=${vietQrAmount}&addInfo=${encodeURIComponent(vietQrInfo)}&accountName=CTY%20CP%20THOI%20TRANG%20FASHION%20STORE`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 print:p-0">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (!paidOrder && window.confirm('Bạn có muốn tạm dừng thanh toán? Đơn hàng vẫn được lưu lại tại Tủ đồ để bạn thanh toán sau.')) {
            onClose();
          } else if (paidOrder) {
            onClose();
          }
        }} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity print:hidden" 
      />

      {/* Main Gateway Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 animate-fadeIn border border-slate-100 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* ================= SUCCESS / E-INVOICE VIEW ================= */}
        {paidOrder ? (
          <div ref={receiptRef} className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Giao Dịch Thành Công
              </span>
              <h2 className="text-2xl font-black text-slate-900">Biên Lai Xác Nhận Thanh Toán</h2>
              <p className="text-xs text-slate-500">
                Hóa đơn điện tử chính thức từ Hệ Thống Bán Lẻ Thời Trang <strong>Fashion Store</strong>
              </p>
            </div>

            {/* Official Stamp & Invoice details */}
            <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl p-6 border border-slate-200 shadow-inner overflow-hidden">
              {/* Watermark Stamp */}
              <div className="absolute right-4 top-4 transform rotate-[-12deg] pointer-events-none opacity-85 select-none">
                <div className="border-4 border-emerald-600 border-dashed rounded-xl px-4 py-2 text-center text-emerald-700 bg-emerald-50/70 shadow-sm">
                  <div className="text-[10px] tracking-widest uppercase font-bold">FASHION STORE OFFICIAL</div>
                  <div className="text-sm font-black tracking-wider text-emerald-700">★ ĐÃ THANH TOÁN ★</div>
                  <div className="text-[9px] font-mono text-emerald-800">{paidOrder.paidAt || 'CONFIRMED'}</div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã đơn hàng:</span>
                    <strong className="font-mono text-slate-900 text-sm font-bold">{paidOrder.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã giao dịch (Txn Ref):</span>
                    <strong className="font-mono text-indigo-700 text-sm font-bold">
                      {paidOrder.transactionCode || 'TXN-VNPAY-SUCCESS'}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Khách hàng:</span>
                    <span className="font-semibold text-slate-900">{paidOrder.customerName}</span>
                    <span className="block text-slate-500 text-[11px]">{paidOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phương thức thanh toán:</span>
                    <span className="font-semibold text-emerald-700">{paidOrder.paymentMethod}</span>
                    <span className="block text-slate-500 text-[11px]">Thời gian: {paidOrder.paidAt || 'Vừa xong'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Địa chỉ giao nhận:</span>
                  <span className="font-medium text-slate-800">{paidOrder.address}</span>
                </div>

                {/* Products Table */}
                <div className="pt-3 border-t border-slate-200">
                  <span className="block font-bold text-slate-800 text-xs mb-2">Chi tiết sản phẩm đã mua:</span>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                    {(paidOrder.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium">
                          • {it.name || 'Sản phẩm'} ({it.color || 'Tiêu chuẩn'}, {it.size || 'L'}) x<strong>{it.quantity || 1}</strong>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {((it.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary total */}
                <div className="pt-3 border-t border-slate-200 space-y-1 text-right">
                  <div className="text-xs text-slate-500">
                    Tạm tính: {(paidOrder.subtotal || 0).toLocaleString('vi-VN')} ₫
                  </div>
                  {(paidOrder.discount || 0) > 0 && (
                    <div className="text-xs text-emerald-600 font-semibold">
                      Giảm giá voucher: -{(paidOrder.discount || 0).toLocaleString('vi-VN')} ₫
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Phí vận chuyển: {(paidOrder.shippingFee || 0) === 0 ? 'Miễn phí' : `${(paidOrder.shippingFee || 0).toLocaleString('vi-VN')} ₫`}
                  </div>
                  <div className="text-base font-black text-slate-900 pt-1 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Tổng tiền đã thanh toán:</span>
                    <span className="text-indigo-600 text-lg font-black">{(paidOrder.total || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics Status Notice */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-teal-950">Đơn hàng đã được chuyển sang trạng thái ĐANG XỬ LÝ (PROCESSING)</strong>
                <p className="text-teal-800 text-[11px] mt-0.5">
                  Bộ phận kho vận (Staff) đã nhận được thông báo đã thanh toán thành công và đang đóng gói sản phẩm để bàn giao cho ĐVVC GHTK Express.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Printer className="w-4 h-4" /> In biên lai / Tải PDF
              </button>
              <button
                onClick={handleCloseAndGoToDashboard}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                Xem tiến trình tại Tủ đồ <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE PAYMENT GATEWAY VIEW ================= */
          <>
            {/* Header with Amount & Countdown */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    Cổng thanh toán bảo mật
                  </span>
                  <span className="font-mono text-xs text-slate-400">#{order.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {order.total.toLocaleString('vi-VN')} ₫
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Khách hàng: <strong className="text-slate-200">{order.customerName}</strong> ({order.phone})
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Countdown pill */}
                <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-amber-400" /> Hết hạn sau
                  </div>
                  <div className="font-mono font-bold text-base text-amber-400">
                    {formattedMinutes}:{formattedSeconds}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Đóng cổng thanh toán"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('VIETQR')}
                className={`py-2.5 px-2 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'VIETQR'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="truncate">VietQR 24/7</span>
              </button>

              <button
                onClick={() => setActiveTab('VNPAY')}
                className={`py-2.5 px-2 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'VNPAY'
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="truncate">VNPAY QR</span>
              </button>

              <button
                onClick={() => setActiveTab('CARD')}
                className={`py-2.5 px-2 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'CARD'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Lock className="w-4 h-4 text-indigo-600" />
                <span className="truncate">Visa / Master</span>
              </button>

              <button
                onClick={() => setActiveTab('MOMO')}
                className={`py-2.5 px-2 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'MOMO'
                    ? 'bg-white text-pink-700 shadow-xs border border-pink-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4 text-pink-600" />
                <span className="truncate">Ví MoMo</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* ================= TAB 1: VIETQR NAPAS 247 ================= */}
              {activeTab === 'VIETQR' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Chuyển khoản liên ngân hàng <strong>Napas 247</strong> miễn phí & xác thực tức thì</span>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Vietcombank
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* QR Code */}
                    <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <img
                          src={vietQrImageUrl}
                          alt="VietQR Napas 247"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center gap-1 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> Quét mã bằng app ngân hàng bất kỳ
                      </p>
                    </div>

                    {/* Bank Info & Copy Buttons */}
                    <div className="sm:col-span-7 space-y-2.5">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Ngân hàng:</span>
                          <strong className="text-slate-900 font-bold">Vietcombank (VCB)</strong>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                          <span className="text-slate-500">Số tài khoản:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-700 text-sm">1028 3948 2901</span>
                            <button
                              onClick={() => copyToClipboard('102839482901', 'stk')}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600"
                              title="Sao chép STK"
                            >
                              {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                          <span className="text-slate-500">Chủ tài khoản:</span>
                          <strong className="text-slate-900 font-bold text-[11px]">CTY CP THOI TRANG FASHION STORE</strong>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                          <span className="text-slate-500">Số tiền chính xác:</span>
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-emerald-600 text-sm">{order.total.toLocaleString('vi-VN')} ₫</strong>
                            <button
                              onClick={() => copyToClipboard(String(order.total), 'amount')}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600"
                              title="Sao chép số tiền"
                            >
                              {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200">
                          <span className="text-amber-900 font-bold">Nội dung CK:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-900 text-xs">{vietQrInfo}</span>
                            <button
                              onClick={() => copyToClipboard(vietQrInfo, 'memo')}
                              className="p-1 rounded hover:bg-amber-100 text-amber-800"
                              title="Sao chép cú pháp chuyển khoản"
                            >
                              {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Auto detector status */}
                      <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                            Đang tự động dò tìm giao dịch Vietcombank...
                          </span>
                          <span className="text-emerald-400 font-mono font-bold">{autoCheckProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${autoCheckProgress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleExecutePayment('BANK_TRANSFER', 'VIETQR', 'Vietcombank')}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Tôi đã chuyển khoản xong (Xác nhận ngay)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: VNPAY QR & ATM ================= */}
              {activeTab === 'VNPAY' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Cổng thanh toán quốc gia <strong>VNPAY-QR</strong> & Thẻ ATM nội địa</span>
                    </div>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                      VNPAY Gateway
                    </span>
                  </div>

                  {/* VNPAY Sub-options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option A: VNPAY QR */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center text-center justify-between space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Cách 1: Quét mã VNPAY-QR</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ hơn 40 ứng dụng ngân hàng & ví điện tử</p>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-blue-200 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VNPAY-FASHIONSTORE-ORDER-${order.id}-TOTAL-${order.total}`}
                          alt="VNPAY QR"
                          className="w-36 h-36"
                        />
                      </div>

                      <button
                        onClick={() => handleExecutePayment('VNPAY', 'VNPAY', 'VNPAY QR')}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition"
                      >
                        Xác nhận quét mã VNPAY
                      </button>
                    </div>

                    {/* Option B: Domestic ATM Card */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Cách 2: Thẻ ATM / Tài khoản Ngân hàng</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Chọn ngân hàng phát hành thẻ của bạn</p>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {['VCB', 'TCB', 'MB', 'BIDV', 'CTG', 'ACB', 'VPB', 'TPB'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`py-1.5 text-center text-xs font-bold rounded-lg border transition ${
                              selectedBank === bank
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Số thẻ ATM</label>
                          <input
                            type="text"
                            value={atmCardNumber}
                            onChange={(e) => setAtmCardNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tên chủ thẻ</label>
                            <input
                              type="text"
                              value={atmCardHolder}
                              onChange={(e) => setAtmCardHolder(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ngày phát hành</label>
                            <input
                              type="text"
                              value={atmIssueDate}
                              onChange={(e) => setAtmIssueDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setOtpTargetMethod('VNPAY_ATM');
                          setShowOtpModal(true);
                        }}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition"
                      >
                        Thanh toán qua Ngân Hàng ({selectedBank})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: INTERNATIONAL CREDIT CARD ================= */}
              {activeTab === 'CARD' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Bảo mật 256-bit SSL & Xác thực <strong>3D Secure OTP</strong> (Verified by Visa/Mastercard)</span>
                    </div>
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Visa / MC
                    </span>
                  </div>

                  {/* Dynamic Realistic Card Visual */}
                  <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-indigo-900 to-slate-900 border border-indigo-500/20">
                    {/* Chip and logo */}
                    <div className="flex justify-between items-center">
                      <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-200 shadow-inner flex items-center justify-center">
                        <div className="w-8 h-5 border border-amber-600/40 rounded-sm" />
                      </div>
                      <span className="font-bold tracking-widest text-lg italic text-white/90">
                        {cardNumber.startsWith('5') ? 'Mastercard' : 'VISA'}
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="mt-6 font-mono text-base tracking-widest text-white/95">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 flex justify-between items-end text-xs">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Chủ sở hữu thẻ</div>
                        <div className="font-mono font-bold tracking-wider truncate max-w-[170px] uppercase">
                          {cardHolder || 'CARD HOLDER'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Hết hạn</div>
                        <div className="font-mono font-bold">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card input form */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-semibold text-slate-700">Số thẻ tín dụng / ghi nợ *</label>
                        <div className="flex gap-1.5 text-[10px] text-indigo-600">
                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('4242 4242 4242 4242');
                              setCardExpiry('12/28');
                              setCardCvv('888');
                            }}
                            className="hover:underline font-semibold"
                          >
                            [Thử Visa Test]
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCardNumber('5555 5555 5555 5555');
                              setCardExpiry('10/27');
                              setCardCvv('999');
                            }}
                            className="hover:underline font-semibold"
                          >
                            [Thử Master Test]
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        placeholder="4242 •••• •••• 4242"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tên trên thẻ (Không dấu) *</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hạn sử dụng (MM/YY) *</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Mã bảo mật CVV/CVC *</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setOtpTargetMethod('CARD');
                        setShowOtpModal(true);
                      }}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 mt-2"
                    >
                      <Lock className="w-4 h-4" /> Thanh toán an toàn {order.total.toLocaleString('vi-VN')} ₫
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: MOMO WALLET ================= */}
              {activeTab === 'MOMO' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-pink-50/80 border border-pink-200 rounded-xl text-xs text-pink-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <span>Thanh toán siêu nhanh qua <strong>Ví Điện Tử MoMo</strong></span>
                    </div>
                    <span className="text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded-full font-bold">
                      MoMo Pay
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="bg-white p-2.5 rounded-xl border border-pink-200 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOMO-FASHIONSTORE-TOTAL-${order.total}`}
                          alt="MoMo QR"
                          className="w-36 h-36"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Mở ứng dụng MoMo để quét mã</p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="text-slate-500 text-[11px]">Đơn vị thụ hưởng:</div>
                        <div className="font-bold text-slate-900">FASHION STORE CO., LTD</div>
                        <div className="text-slate-500 text-[11px] pt-1">Số tiền:</div>
                        <div className="font-bold text-pink-600 text-base">{order.total.toLocaleString('vi-VN')} ₫</div>
                      </div>

                      <button
                        onClick={() => handleExecutePayment('MOMO', 'MOMO', 'MoMo Wallet')}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-200 transition flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-4 h-4" /> Xác nhận thanh toán qua MoMo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Overlay if in progress */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 space-y-4 animate-fadeIn">
                <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                <div className="text-center">
                  <h3 className="text-base font-bold text-white">{processingMessage}</h3>
                  <p className="text-xs text-slate-400 mt-1">Vui lòng không đóng trình duyệt hoặc tải lại trang...</p>
                </div>
              </div>
            )}

            {/* 3D Secure / OTP Simulation Modal */}
            {showOtpModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-fadeIn">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Xác thực 3D-Secure OTP</h3>
                    <p className="text-xs text-slate-500">
                      Mã xác thực 6 số đã được gửi đến số điện thoại đăng ký ngân hàng <strong className="text-slate-700">090***6789</strong>.
                    </p>
                  </div>

                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center text-xs text-amber-900">
                    Mã OTP thử nghiệm hệ thống: <strong className="font-mono text-sm text-indigo-700">123456</strong>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      className="w-full text-center tracking-[8px] font-mono font-bold text-xl py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOtpModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (otpTargetMethod === 'CARD') {
                          handleExecutePayment('CREDIT_CARD', 'CARD-VISA', 'Visa/Mastercard');
                        } else {
                          handleExecutePayment('VNPAY', `ATM-${selectedBank}`, selectedBank);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                    >
                      Xác nhận thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
