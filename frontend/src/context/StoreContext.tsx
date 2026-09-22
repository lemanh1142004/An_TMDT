import React, { createContext, useContext, useState, useEffect } from 'react';

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

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
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
  paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản';
  isPaid: boolean;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  carrier: string;
  trackingCode: string;
  note?: string;
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

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Áo Blazer Minimalist Oversize',
    category: 'Thời trang Nam',
    price: 950000,
    originalPrice: 1350000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    tag: 'Giảm 30%',
    rating: 4.9,
    reviewsCount: 84,
    stock: 28,
    description: 'Áo khoác blazer tối giản may đo cao cấp với chất liệu wool blend giữ form hoàn hảo.',
    isActive: true,
  },
  {
    id: 2,
    name: 'Đầm Lụa Satin Maxi Dạ Tiệc',
    category: 'Thời trang Nữ',
    price: 1200000,
    originalPrice: 1600000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    tag: 'Bán chạy',
    rating: 5.0,
    reviewsCount: 112,
    stock: 12,
    description: 'Đầm lụa mềm mại rủ nhẹ tôn dáng quý phái, phù hợp các buổi tiệc dạ hội trang trọng.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Áo Sơ Mi Oxford Cotton Premium',
    category: 'Thời trang Nam',
    price: 550000,
    originalPrice: 690000,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    tag: 'New',
    rating: 4.8,
    reviewsCount: 65,
    stock: 45,
    description: 'Chất vải 100% cotton Oxford thoáng khí, cổ bẻ thanh lịch chống nhăn công sở.',
    isActive: true,
  },
  {
    id: 4,
    name: 'Quần Tây Form Ý Dáng Rộng',
    category: 'Thời trang Nam',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    tag: 'Hot',
    rating: 4.7,
    reviewsCount: 42,
    stock: 18,
    description: 'Quần tây ly xòe nhẹ phong cách Sartorial Ý hiện đại kết hợp dễ dàng.',
    isActive: true,
  },
  {
    id: 5,
    name: 'Túi Xách Da Crossbody Nữ Tinh Tế',
    category: 'Phụ kiện',
    price: 850000,
    originalPrice: 1100000,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    tag: 'Giảm 23%',
    rating: 4.9,
    reviewsCount: 98,
    stock: 4, // Low stock on purpose
    description: 'Túi đeo chéo da nhân tạo cao cấp đường chỉ may tỉ mỉ, khóa mạ vàng champagne.',
    isActive: true,
  },
  {
    id: 6,
    name: 'Áo Len Dệt Kim Cổ Lọ Thu Đông',
    category: 'Unisex',
    price: 720000,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80',
    tag: 'New Season',
    rating: 4.8,
    reviewsCount: 53,
    stock: 3, // Low stock on purpose
    description: 'Sợi len tự nhiên giữ ấm tối ưu mà không gây bí ráp, phong cách Bắc Âu.',
    isActive: true,
  },
];

const initialOrders: Order[] = [
  {
    id: 'ORD-2026-901',
    customerEmail: 'customer@fashionstore.com',
    customerName: 'Trần Thị Khách Hàng',
    phone: '0903 456 789',
    address: 'Số 45, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    items: [
      { productId: 1, name: 'Áo Blazer Minimalist Oversize', size: 'L', color: 'Đen Charcoal', price: 950000, quantity: 1 },
      { productId: 3, name: 'Áo Sơ Mi Oxford Cotton Premium', size: 'L', color: 'Trắng', price: 550000, quantity: 1 },
    ],
    subtotal: 1500000,
    discount: 0,
    shippingFee: 0,
    total: 1500000,
    paymentMethod: 'VNPAY',
    isPaid: true,
    status: 'SHIPPED',
    createdAt: '22/09/2026 08:30',
    carrier: 'Giao Hàng Tiết Kiệm',
    trackingCode: 'GHTK-88129034',
    note: 'Giao trong giờ hành chính',
  },
  {
    id: 'ORD-2026-880',
    customerEmail: 'customer@fashionstore.com',
    customerName: 'Trần Thị Khách Hàng',
    phone: '0903 456 789',
    address: 'Số 45, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    items: [
      { productId: 2, name: 'Đầm Lụa Satin Maxi Dạ Tiệc', size: 'M', color: 'Xanh Emerald', price: 1200000, quantity: 1 },
    ],
    subtotal: 1200000,
    discount: 0,
    shippingFee: 0,
    total: 1200000,
    paymentMethod: 'COD',
    isPaid: true,
    status: 'DELIVERED',
    createdAt: '15/09/2026 14:15',
    carrier: 'Viettel Post',
    trackingCode: 'VTP-44218890',
  },
  {
    id: 'ORD-2026-905',
    customerEmail: 'hoangminh@gmail.com',
    customerName: 'Hoàng Minh Tuấn',
    phone: '0912 345 678',
    address: '128 Cầu Giấy, P. Quan Hoa, Cầu Giấy, Hà Nội',
    items: [
      { productId: 4, name: 'Quần Tây Form Ý Dáng Rộng', size: '32', color: 'Xám đậm', price: 680000, quantity: 1 },
    ],
    subtotal: 680000,
    discount: 0,
    shippingFee: 30000,
    total: 710000,
    paymentMethod: 'COD',
    isPaid: false,
    status: 'PENDING',
    createdAt: '22/09/2026 09:10',
    carrier: 'Đang điều phối',
    trackingCode: 'CHỜ-XỬ-LÝ',
    note: 'Gọi trước khi giao hàng',
  },
];

const initialUsers: UserAccount[] = [
  {
    id: 1,
    email: 'admin@fashionstore.com',
    fullName: 'Fashion Store Administrator',
    phoneNumber: '0901 234 567',
    role: 'ROLE_ADMIN',
    active: true,
    joinedDate: '01/01/2026',
  },
  {
    id: 2,
    email: 'staff@fashionstore.com',
    fullName: 'Nguyễn Văn Nhân Viên',
    phoneNumber: '0902 345 678',
    role: 'ROLE_STAFF',
    active: true,
    joinedDate: '15/01/2026',
  },
  {
    id: 3,
    email: 'customer@fashionstore.com',
    fullName: 'Trần Thị Khách Hàng',
    phoneNumber: '0903 456 789',
    role: 'ROLE_CUSTOMER',
    active: true,
    joinedDate: '20/02/2026',
  },
  {
    id: 4,
    email: 'long.le@gmail.com',
    fullName: 'Lê Hoàng Long',
    phoneNumber: '0988 123 456',
    role: 'ROLE_CUSTOMER',
    active: true,
    joinedDate: '05/03/2026',
  },
  {
    id: 5,
    email: 'thutrang.pham@fashionstore.com',
    fullName: 'Phạm Thu Trang (Kho vận)',
    phoneNumber: '0977 234 888',
    role: 'ROLE_STAFF',
    active: true,
    joinedDate: '10/03/2026',
  },
];

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  users: UserAccount[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Cart operations
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  updateCartQty: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  // Order operations
  createOrder: (orderData: {
    customerEmail: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản';
    discountCode?: string;
    note?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  // Inventory & Product operations
  restockProduct: (productId: number, addedQty: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'isActive'>) => void;
  updateProduct: (productId: number, updates: Partial<Product>) => void;
  toggleProductStatus: (productId: number) => void;
  // User operations
  toggleUserActive: (userId: number) => void;
  changeUserRole: (userId: number, newRole: UserAccount['role']) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fs_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fs_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fs_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('fs_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fs_users', JSON.stringify(users));
  }, [users]);

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

  // Order operations
  const createOrder = (orderData: {
    customerEmail: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'COD' | 'VNPAY' | 'Chuyển khoản';
    discountCode?: string;
    note?: string;
  }): Order => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    if (orderData.discountCode === 'FASHION20') {
      discount = Math.round(subtotal * 0.2);
    } else if (orderData.discountCode === 'VIPMEMBER') {
      discount = 50000;
    }

    const shippingFee = subtotal >= 500000 || orderData.discountCode === 'FREESHIP50K' ? 0 : 30000;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        size: item.size,
        color: item.color,
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod: orderData.paymentMethod,
      isPaid: orderData.paymentMethod === 'VNPAY',
      status: 'PENDING',
      createdAt: new Date().toLocaleString('vi-VN'),
      carrier: 'GHTK Express',
      trackingCode: `GHTK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      note: orderData.note,
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = cart.find((c) => c.product.id === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Inventory operations
  const restockProduct = (productId: number, addedQty: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + addedQty } : p))
    );
  };

  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'isActive'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      isActive: true,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (productId: number, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const toggleProductStatus = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // User operations
  const toggleUserActive = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  const changeUserRole = (userId: number, newRole: UserAccount['role']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        users,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        restockProduct,
        addProduct,
        updateProduct,
        toggleProductStatus,
        toggleUserActive,
        changeUserRole,
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
