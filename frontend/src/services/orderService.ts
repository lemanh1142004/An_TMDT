import api from './api';
import type { Order } from '../context/StoreContext';

export interface CreateOrderPayload {
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO' | 'Thẻ quốc tế' | 'Ví MoMo' | string;
  discountCode?: string;
  note?: string;
  items: {
    productId: number;
    size?: string;
    color?: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusPayload {
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  carrier?: string;
  trackingCode?: string;
}

export interface ConfirmPaymentPayload {
  transactionCode?: string;
  paymentMethod?: 'COD' | 'VNPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO';
  bankName?: string;
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    // Map payment method to enum
    let paymentMethod = payload.paymentMethod;
    if (paymentMethod === 'Chuyển khoản') {
      paymentMethod = 'BANK_TRANSFER';
    } else if (paymentMethod === 'Thẻ quốc tế') {
      paymentMethod = 'CREDIT_CARD';
    } else if (paymentMethod === 'Ví MoMo') {
      paymentMethod = 'MOMO';
    }

    const response = await api.post<any>('/api/orders', {
      ...payload,
      paymentMethod,
    });
    return mapBackendOrder(response.data);
  },

  confirmPayment: async (orderId: number | string, payload?: ConfirmPaymentPayload): Promise<Order> => {
    const response = await api.post<any>(`/api/orders/${orderId}/pay`, payload || {});
    return mapBackendOrder(response.data);
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<any[]>('/api/orders/my-orders');
    return response.data.map(mapBackendOrder);
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get<any[]>('/api/orders');
    return response.data.map(mapBackendOrder);
  },

  updateStatus: async (orderId: number | string, payload: UpdateOrderStatusPayload): Promise<Order> => {
    const response = await api.patch<any>(`/api/orders/${orderId}/status`, payload);
    return mapBackendOrder(response.data);
  },
};

function mapBackendOrder(data: any): Order {
  let displayPayment = data.paymentMethod;
  if (data.paymentMethod === 'BANK_TRANSFER') displayPayment = 'Chuyển khoản';
  else if (data.paymentMethod === 'CREDIT_CARD') displayPayment = 'Thẻ quốc tế';
  else if (data.paymentMethod === 'MOMO') displayPayment = 'Ví MoMo';

  return {
    id: data.orderCode || `ORD-2026-${data.id}`,
    numericId: data.id,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    phone: data.phone,
    address: data.address,
    items: (data.items || []).map((it: any) => ({
      productId: it.productId,
      name: it.name,
      size: it.size || 'L',
      color: it.color || 'Tiêu chuẩn',
      price: it.price,
      quantity: it.quantity,
    })),
    subtotal: data.subtotal,
    discount: data.discount,
    shippingFee: data.shippingFee,
    total: data.total,
    paymentMethod: displayPayment,
    isPaid: data.isPaid,
    status: data.status,
    createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString('vi-VN') : '',
    carrier: data.carrier || 'GHTK Express',
    trackingCode: data.trackingCode || 'CHỜ-GÁN-MÃ',
    note: data.note,
    transactionCode: data.transactionCode,
    paidAt: data.paidAt ? new Date(data.paidAt).toLocaleString('vi-VN') : undefined,
    processedBy: data.processedBy,
    processedByEmail: data.processedByEmail,
    processedAt: data.processedAt ? new Date(data.processedAt).toLocaleString('vi-VN') : undefined,
  };
}
