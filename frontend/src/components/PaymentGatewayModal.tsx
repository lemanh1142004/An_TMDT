import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  Building2, 
  Smartphone, 
  RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { STORE_BANK_CONFIG, getVietQrUrl } from '../config/bankConfig';

interface PaymentGatewayModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (updatedOrder: Order) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { confirmPayment } = useStore();
  const navigate = useNavigate();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);

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
    if (!isOpen || paidOrder) return;
    const interval = setInterval(() => {
      setAutoCheckProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 15;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, paidOrder]);

  if (!isOpen || !order) return null;

  const orderNumericId = order.numericId || (typeof order.id === 'string' && order.id.startsWith('ORD-2026-') ? order.id.replace('ORD-2026-', '') : order.id);
  const formattedMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const formattedSeconds = String(timeLeft % 60).padStart(2, '0');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setProcessingMessage('Đang kết nối đến cổng thanh toán BIDV Napas 247...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingMessage('Đang xác thực giao dịch chuyển khoản và đối soát...');
      await new Promise((r) => setTimeout(r, 600));

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const generatedTxn = `VIETQR-${new Date().getFullYear()}-${randomSuffix}`;

      const updated = await confirmPayment(orderNumericId, {
        paymentMethod: 'BANK_TRANSFER',
        transactionCode: generatedTxn,
        bankName: STORE_BANK_CONFIG.bankName,
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
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseAndGoToDashboard = () => {
    onClose();
    navigate('/customer');
  };

  // Dynamic VietQR Napas 24/7 URL for BIDV 8893884656
  const vietQrAmount = order?.total || 0;
  const vietQrInfo = `FS ${order?.id || ''}`;
  const vietQrImageUrl = getVietQrUrl(vietQrAmount, vietQrInfo);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-3 sm:p-4 print:p-0">
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
                      <div key={idx} className="flex justify-between items-center gap-3 text-xs py-1 border-b border-slate-100 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-800 font-medium">• {it.name || 'Sản phẩm'}</span>
                          <span className="text-slate-500 text-[11px] ml-1.5">({it.color || 'Tiêu chuẩn'}, Size {it.size || 'L'})</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold text-[11px]">
                            x{it.quantity || 1}
                          </span>
                          <span className="font-semibold text-slate-900 min-w-[90px] text-right font-mono">
                            {((it.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
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
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    Cổng thanh toán VietQR (Napas 24/7)
                  </span>
                  <span className="font-mono text-xs text-slate-400">#{order.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {(order.total || 0).toLocaleString('vi-VN')} ₫
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
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Đóng cổng thanh toán"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Direct VietQR Payment View */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Chuyển khoản liên ngân hàng <strong>Napas 247</strong> miễn phí & xác thực tức thì</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                    {STORE_BANK_CONFIG.shortName} (Napas 247)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* QR Code */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                      <img
                        src={vietQrImageUrl}
                        alt={`VietQR ${STORE_BANK_CONFIG.shortName} Napas 247`}
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
                        <strong className="text-slate-900 font-bold">{STORE_BANK_CONFIG.bankName}</strong>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-indigo-700 text-sm tracking-wide">
                            {STORE_BANK_CONFIG.accountNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(STORE_BANK_CONFIG.accountNumber, 'stk')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Sao chép STK"
                          >
                            {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                        <span className="text-slate-500">Chủ tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-extrabold uppercase text-xs">
                            {STORE_BANK_CONFIG.accountHolder}
                          </strong>
                          <button
                            onClick={() => copyToClipboard(STORE_BANK_CONFIG.accountHolder, 'holder')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Sao chép tên chủ tài khoản"
                          >
                            {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/80">
                        <span className="text-slate-500">Số tiền chính xác:</span>
                        <div className="flex items-center gap-2">
                          <strong className="font-extrabold text-emerald-600 text-sm">
                            {(order?.total || 0).toLocaleString('vi-VN')} ₫
                          </strong>
                          <button
                            onClick={() => copyToClipboard(String(order?.total || 0), 'amount')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
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
                            className="p-1 rounded hover:bg-amber-100 text-amber-800 transition cursor-pointer"
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
                          Đang tự động dò tìm giao dịch {STORE_BANK_CONFIG.shortName}...
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
                      onClick={handleExecutePayment}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Tôi đã chuyển khoản xong (Xác nhận ngay)
                    </button>
                  </div>
                </div>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
};
