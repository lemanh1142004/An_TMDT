import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  numericId?: number;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  items: {
    productId: number;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản' | 'Thẻ quốc tế' | 'Ví MoMo' | string;
  isPaid: boolean;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  carrier: string;
  trackingCode: string;
  note?: string;
  transactionCode?: string;
  paidAt?: string;
}

export interface UserAccount {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'ROLE_ADMIN' | 'ROLE_STAFF' | 'ROLE_CUSTOMER';
  active: boolean;
  joinedDate: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  users: UserAccount[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  checkoutItems: CartItem[] | null;
  isLoading: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCheckout: (items?: CartItem[]) => void;
  closeCheckout: () => void;
  // Cart operations
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  updateCartQty: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  // Order operations
  createOrder: (orderData: any) => Promise<Order>;
  confirmPayment: (
    orderId: string | number,
    payload?: {
      transactionCode?: string;
      paymentMethod?: 'COD' | 'VNPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO';
      bankName?: string;
    }
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], carrier?: string, trackingCode?: string) => Promise<void>;
  // Inventory & Product operations
  restockProduct: (productId: number, addedQty: number) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'isActive'>) => Promise<void>;
  toggleProductStatus: (productId: number) => Promise<void>;
  // User operations
  toggleUserActive: (userId: number) => Promise<void>;
  changeUserRole: (userId: number, newRole: UserAccount['role']) => Promise<void>;
  // Manual refresh
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cart persists in localStorage for buyer convenience
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fs_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);

  const openCheckout = (items?: CartItem[]) => {
    setCheckoutItems(items && items.length > 0 ? items : null);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutItems(null);
  };

  useEffect(() => {
    localStorage.setItem('fs_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch real data from backend
  const fetchProducts = useCallback(async () => {
    try {
      const [prodData, catData] = await Promise.all([
        productService.getAll(false),
        productService.getCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.warn('Could not fetch products/categories from backend, using fallback:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      if (user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_STAFF')) {
        const allOrders = await orderService.getAllOrders();
        setOrders(allOrders);
      } else if (isAuthenticated) {
        const myOrders = await orderService.getMyOrders();
        setOrders(myOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Could not fetch orders from backend:', err);
    }
  }, [user, isAuthenticated]);

  const fetchUsers = useCallback(async () => {
    if (user?.roles.includes('ROLE_ADMIN')) {
      try {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.warn('Could not fetch users from backend:', err);
      }
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchProducts(), fetchOrders(), fetchUsers()]);
    setIsLoading(false);
  }, [fetchProducts, fetchOrders, fetchUsers]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Cart operations
  const addToCart = (product: Product, size = 'L', color = 'Tiêu chuẩn', quantity = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, size, color }];
    });
  };

  const updateCartQty = (index: number, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order operations: Send to real PostgreSQL Database
  const createOrder = async (orderData: {
    customerEmail: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản';
    discountCode?: string;
    note?: string;
    items?: {
      productId: number;
      size?: string;
      color?: string;
      quantity: number;
    }[];
  }): Promise<Order> => {
    // If specific items were passed or set in checkoutItems, use them; otherwise use full cart
    const orderItems = orderData.items && orderData.items.length > 0
      ? orderData.items
      : (checkoutItems && checkoutItems.length > 0
          ? checkoutItems.map((item) => ({
              productId: item.product.id,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
            }))
          : cart.map((item) => ({
              productId: item.product.id,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
            })));

    const payload = {
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      phone: orderData.phone,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      discountCode: orderData.discountCode,
      note: orderData.note,
      items: orderItems,
    };

    try {
      const created = await orderService.createOrder(payload);
      
      // Remove ONLY the purchased items from cart
      setCart((prev) =>
        prev.filter(
          (cartItem) =>
            !orderItems.some(
              (purchased) =>
                purchased.productId === cartItem.product.id &&
                (purchased.size ? purchased.size === cartItem.size : true) &&
                (purchased.color ? purchased.color === cartItem.color : true)
            )
        )
      );

      // Refresh products (stock was deducted) and orders from DB
      await Promise.all([fetchProducts(), fetchOrders()]);
      return created;
    } catch (error) {
      console.error('Failed to create order on backend:', error);
      throw error;
    }
  };

  const confirmPayment = async (
    orderId: string | number,
    payload?: {
      transactionCode?: string;
      paymentMethod?: 'COD' | 'VNPAY' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO';
      bankName?: string;
    }
  ): Promise<Order> => {
    try {
      const foundOrder = orders.find((o) => o.id === orderId || String(o.numericId) === String(orderId));
      const targetId = foundOrder?.numericId || (typeof orderId === 'string' && orderId.startsWith('ORD-2026-') ? orderId.replace('ORD-2026-', '') : orderId);

      const updated = await orderService.confirmPayment(targetId, payload);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id || o.numericId === updated.numericId ? updated : o))
      );
      fetchOrders();
      return updated;
    } catch (err) {
      console.error('Failed to confirm payment on backend:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], carrier?: string, trackingCode?: string) => {
    try {
      const foundOrder = orders.find((o) => o.id === orderId || String(o.numericId) === orderId);
      const targetId = foundOrder?.numericId || (orderId.startsWith('ORD-2026-') ? orderId.replace('ORD-2026-', '') : orderId);

      await orderService.updateStatus(targetId, { status, carrier, trackingCode });
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status on backend:', err);
      // Optimistic update
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, carrier: carrier || o.carrier, trackingCode: trackingCode || o.trackingCode } : o)));
    }
  };

  // Inventory & Product operations: Send to real PostgreSQL Database
  const restockProduct = async (productId: number, addedQty: number) => {
    try {
      await productService.restock(productId, addedQty);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to restock on backend:', err);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + addedQty } : p))
      );
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'isActive'>) => {
    try {
      await productService.create({
        name: productData.name,
        category: productData.category,
        price: productData.price,
        originalPrice: productData.originalPrice,
        stock: productData.stock,
        image: productData.image,
        tag: productData.tag,
        description: productData.description,
      });
      await fetchProducts();
    } catch (err) {
      console.error('Failed to add product on backend:', err);
    }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      await productService.toggleStatus(productId);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to toggle status on backend:', err);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
      );
    }
  };

  // User operations: Send to real PostgreSQL Database
  const toggleUserActive = async (userId: number) => {
    try {
      await userService.toggleStatus(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user status on backend:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
      );
    }
  };

  const changeUserRole = async (userId: number, newRole: UserAccount['role']) => {
    try {
      await userService.updateRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to change user role on backend:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        users,
        isCartOpen,
        isCheckoutOpen,
        checkoutItems,
        isLoading,
        setIsCartOpen,
        openCheckout,
        closeCheckout,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createOrder,
        confirmPayment,
        updateOrderStatus,
        restockProduct,
        addProduct,
        toggleProductStatus,
        toggleUserActive,
        changeUserRole,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
