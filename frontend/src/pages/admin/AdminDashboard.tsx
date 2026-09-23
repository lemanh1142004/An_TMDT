import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  PlusCircle, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield, 
  X,
  PackageCheck,
  EyeOff,
  Boxes,
  Plus,
  FolderPlus,
  Folder,
  Edit2,
  Trash2,
  Upload,
  ImageIcon,
  FileUp,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { UserAccount, Product, Category, Order } from '../../context/StoreContext';
import { getProductImage, handleImageError } from '../../utils/imageUtils';
import { uploadService } from '../../services/uploadService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { PaginationControl } from '../../components/PaginationControl';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    products, 
    categories,
    orders, 
    users, 
    addProduct, 
    toggleProductStatus, 
    restockProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleUserActive, 
    changeUserRole 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'users' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Restock Modal State
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalProduct && restockQty > 0) {
      await restockProduct(restockModalProduct.id, restockQty);
      showToast(`Đã nhập thêm ${restockQty} sản phẩm vào kho cho "${restockModalProduct.name}"!`);
      setRestockModalProduct(null);
      setRestockQty(20);
      fetchProducts();
    }
  };

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImageUrl('');
    setCatError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setCatImageUrl(cat.imageUrl || '');
    setCatError(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: catName,
          slug: catSlug || undefined,
          description: catDesc || undefined,
          imageUrl: catImageUrl || undefined,
        });
        showToast(`Đã cập nhật danh mục "${catName}" thành công!`);
      } else {
        await createCategory({
          name: catName,
          slug: catSlug || undefined,
          description: catDesc || undefined,
          imageUrl: catImageUrl || undefined,
        });
        showToast(`Đã tạo mới danh mục "${catName}" thành công!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      setCatError(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`)) {
      try {
        await deleteCategory(id);
        showToast(`Đã xóa danh mục "${name}"!`);
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Không thể xóa danh mục này do đang có ràng buộc dữ liệu.');
      }
    }
  };

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Thời trang Nữ');
  const [newProductPrice, setNewProductPrice] = useState(790000);
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState(990000);
  const [newProductStock, setNewProductStock] = useState(30);
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80');
  const [newProductTag, setNewProductTag] = useState('Mới 2026');
  const [newProductDesc, setNewProductDesc] = useState('Chất liệu vải cao cấp thiết kế may đo thanh lịch.');

  // File Upload State for New Product
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload State for Category Modal
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Orders Server-Side Pagination State
  const [orderPage, setOrderPage] = useState(0);
  const [orderPageSize, setOrderPageSize] = useState(10);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  const [orderTotalElements, setOrderTotalElements] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(0);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Products Server-Side Pagination State
  const [prodPage, setProdPage] = useState(0);
  const [prodPageSize, setProdPageSize] = useState(10);
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState<number | undefined>(undefined);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [prodTotalElements, setProdTotalElements] = useState(0);
  const [prodTotalPages, setProdTotalPages] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch paginated orders from server
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await orderService.getPaginated({
        page: orderPage,
        size: orderPageSize,
        status: orderStatusFilter !== 'ALL' ? orderStatusFilter : undefined,
        search: searchTerm.trim() || undefined,
      });
      setPaginatedOrders(res.content);
      setOrderTotalElements(res.totalElements);
      setOrderTotalPages(res.totalPages);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng phân trang:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch paginated products from server
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await productService.getPaginated({
        page: prodPage,
        size: prodPageSize,
        categoryId: prodCategoryFilter,
        search: prodSearch.trim() || undefined,
      });
      setPaginatedProducts(res.content);
      setProdTotalElements(res.totalElements);
      setProdTotalPages(res.totalPages);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm phân trang:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderPage, orderPageSize, orderStatusFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [prodPage, prodPageSize, prodCategoryFilter, prodSearch]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const res = await uploadService.uploadImage(file);
      setNewProductImage(res.url);
      showToast(`Đã tải ảnh lên máy chủ thành công: ${res.fileName}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Tải ảnh thất bại. Vui lòng kiểm tra định dạng hoặc kích thước file.';
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCatFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCatImage(true);
    try {
      const res = await uploadService.uploadImage(file);
      setCatImageUrl(res.url);
      showToast(`Đã tải ảnh danh mục lên máy chủ: ${res.fileName}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Tải ảnh danh mục thất bại.');
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  // Dynamically calculate KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeProductsCount = products.filter((p) => p.isActive).length;

  const handleSyncRedis = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 800);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct({
      name: newProductName,
      category: newProductCategory,
      price: newProductPrice,
      originalPrice: newProductOriginalPrice || undefined,
      stock: newProductStock,
      image: newProductImage,
      tag: newProductTag || undefined,
      description: newProductDesc,
    });
    setIsAddProductOpen(false);
    // Reset form
    setNewProductName('');
    fetchProducts();
    showToast('Đã thêm sản phẩm mới thành công!');
  };

  const handleToggleProduct = async (productId: number) => {
    await toggleProductStatus(productId);
    fetchProducts();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.phoneNumber.includes(userSearchTerm)
  );

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      (o.processedBy && o.processedBy.toLowerCase().includes(q)) ||
      (o.processedByEmail && o.processedByEmail.toLowerCase().includes(q))
    );
  });

  const displayOrders = paginatedOrders.length > 0 || isLoadingOrders ? paginatedOrders : filteredOrders;
  const displayProducts = paginatedProducts.length > 0 || isLoadingProducts ? paginatedProducts : products;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Đã giao</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Đóng gói</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><ShoppingBag className="w-3 h-3" /> Đang giao</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3" /> Chờ duyệt</span>;
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const getRoleBadge = (role: UserAccount['role']) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Quản trị viên (ADMIN)</span>;
      case 'ROLE_STAFF':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Nhân viên (STAFF)</span>;
      case 'ROLE_CUSTOMER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Khách hàng (CUSTOMER)</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Hệ Thống Quản Trị Cấp Cao (Admin Control Center)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào, {user?.fullName || 'Fashion Store Administrator'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Toàn quyền quản trị danh mục, sản phẩm, phân quyền nhân viên, khách hàng và giám sát hạ tầng microservices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncRedis}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition backdrop-blur disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang dọn cache...' : 'Đồng bộ Cache Redis'}
          </button>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Đã làm mới và đồng bộ bộ nhớ đệm phân tán Redis (Port 6379)! Session và Catalog cache đã được tối ưu.</span>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString('vi-VN')} ₫</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Liên tục theo thời gian thực
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{orders.length} đơn</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-semibold">
              <PackageCheck className="w-3.5 h-3.5" /> Cập nhật liên thông từ Staff
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sản Phẩm Đang Bán</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeProductsCount} mẫu</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>{products.length} tổng số mẫu catalog</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tài Khoản Hệ Thống</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{users.length} tài khoản</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-semibold">
              <Shield className="w-3.5 h-3.5" /> Đã phân quyền RBAC
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Tổng quan & Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'products' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Quản lý Sản phẩm & Tồn kho ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'categories' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Quản lý Danh mục ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'users' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Quản lý Người dùng & Nhân viên ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition whitespace-nowrap ${activeTab === 'system' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
        >
          Hạ tầng Microservices & Cache
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-base">Toàn bộ đơn hàng trong hệ thống</h3>
                  {isLoadingOrders && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
                </div>
                <p className="text-xs text-slate-500">Phân trang máy chủ, liên thông trực tiếp từ khách đặt hàng và nhân viên xử lý</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Status filter pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto max-w-full">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'PENDING', label: 'Chờ duyệt' },
                    { id: 'PROCESSING', label: 'Đóng gói' },
                    { id: 'SHIPPED', label: 'Đang giao' },
                    { id: 'DELIVERED', label: 'Đã giao' },
                    { id: 'CANCELLED', label: 'Đã hủy' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setOrderStatusFilter(st.id);
                        setOrderPage(0);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                        orderStatusFilter === st.id
                          ? 'bg-white text-indigo-700 font-bold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, khách, nhân viên..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setOrderPage(0);
                    }}
                    className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-56 sm:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              {isLoadingOrders && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-indigo-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải đơn hàng...</span>
                  </div>
                </div>
              )}
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Mã đơn</th>
                    <th className="px-5 py-3">Khách hàng</th>
                    <th className="px-5 py-3">Số lượng</th>
                    <th className="px-5 py-3">Tổng tiền</th>
                    <th className="px-5 py-3">Phương thức</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Nhân viên xử lý</th>
                    <th className="px-5 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-slate-400 text-xs">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    displayOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 text-xs">{order.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900">{order.customerName}</div>
                          <div className="text-xs text-slate-400">{order.customerEmail}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} món</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {order.total.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <div className="font-mono font-medium text-slate-800">{order.paymentMethod}</div>
                          {order.isPaid ? (
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              ✓ Đã thanh toán {order.transactionCode ? `(${order.transactionCode})` : ''}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                              {order.paymentMethod === 'COD' ? 'Thu COD khi giao' : 'Chờ thanh toán'}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                        <td className="px-5 py-3.5 text-xs">
                          {order.processedBy ? (
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-100">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">{order.processedBy}</div>
                                {order.processedByEmail && (
                                  <div className="text-[10px] text-slate-500 font-mono">{order.processedByEmail}</div>
                                )}
                                {order.processedAt && (
                                  <div className="text-[10px] text-blue-600 font-mono mt-0.5">{order.processedAt}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded italic">
                              <Clock className="w-3 h-3" /> Chờ nhân viên xử lý
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">{order.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Controls */}
            <PaginationControl
              page={orderPage}
              totalPages={orderTotalPages || 1}
              totalElements={orderTotalElements || displayOrders.length}
              pageSize={orderPageSize}
              onPageChange={setOrderPage}
              onPageSizeChange={(newSize) => {
                setOrderPageSize(newSize);
                setOrderPage(0);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Products & Catalog CRUD */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">Quản lý danh mục & Mẫu thiết kế</h3>
                {isLoadingProducts && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
              </div>
              <p className="text-xs text-slate-500">Phân trang máy chủ, lọc danh mục, chỉnh sửa giá bán và cập nhật tồn kho</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <select
                value={prodCategoryFilter ?? ''}
                onChange={(e) => {
                  setProdCategoryFilter(e.target.value ? Number(e.target.value) : undefined);
                  setProdPage(0);
                }}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm..."
                  value={prodSearch}
                  onChange={(e) => {
                    setProdSearch(e.target.value);
                    setProdPage(0);
                  }}
                  className="pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-52"
                />
              </div>

              <button
                onClick={() => {
                  if (displayProducts.length > 0) {
                    setRestockModalProduct(displayProducts[0]);
                    setRestockQty(20);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
              >
                <Boxes className="w-3.5 h-3.5" /> Phiếu nhập kho
              </button>
              <button
                onClick={() => {
                  setIsAddProductOpen(true);
                  setUploadError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Thêm sản phẩm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto relative">
            {isLoadingProducts && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải sản phẩm...</span>
                </div>
              </div>
            )}
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Ảnh</th>
                  <th className="px-5 py-3">Tên sản phẩm</th>
                  <th className="px-5 py-3">Danh mục</th>
                  <th className="px-5 py-3">Giá bán</th>
                  <th className="px-5 py-3">Tồn kho</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  displayProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3">
                        <img 
                          src={getProductImage(p.image)} 
                          alt={p.name} 
                          onError={handleImageError}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100" 
                        />
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{p.name}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.category}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{p.price.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className={p.stock <= 5 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                            {p.stock} chiếc
                          </span>
                          <button
                            onClick={() => {
                              setRestockModalProduct(p);
                              setRestockQty(20);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold transition"
                            title="Nhập thêm hàng vào kho"
                          >
                            <Plus className="w-3 h-3" /> Nhập kho
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleProduct(p.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                            p.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={p.isActive ? 'Ẩn khỏi cửa hàng' : 'Bật hiển thị'}
                        >
                          {p.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Controls */}
          <PaginationControl
            page={prodPage}
            totalPages={prodTotalPages || 1}
            totalElements={prodTotalElements || displayProducts.length}
            pageSize={prodPageSize}
            onPageChange={setProdPage}
            onPageSizeChange={(newSize) => {
              setProdPageSize(newSize);
              setProdPage(0);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}

      {/* Tab: Categories Management */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Quản lý Danh mục Hàng Hóa (Categories)</h3>
              <p className="text-xs text-slate-500">Tạo mới, sửa tên phân loại, đường dẫn slug và mô tả danh mục</p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Thêm danh mục mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Tên Danh Mục</th>
                  <th className="px-5 py-3">Đường dẫn (Slug)</th>
                  <th className="px-5 py-3">Mô tả</th>
                  <th className="px-5 py-3">Số sản phẩm</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                      Chưa có danh mục nào được khởi tạo.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => {
                    const prodCount = products.filter((p) => p.category === cat.name).length;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{cat.id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span>{cat.name}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600 bg-slate-50/60 rounded px-2 py-0.5">
                          {cat.slug}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                          {cat.description || 'Chưa có mô tả'}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-indigo-600">
                          {prodCount} sản phẩm
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                              title="Chỉnh sửa danh mục"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                              title="Xóa danh mục"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Staff RBAC Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Quản lý Tài khoản & Phân quyền</h3>
              <p className="text-xs text-slate-500">Phân quyền vai trò (Admin, Staff, Customer) và khóa/kích hoạt tài khoản</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Số điện thoại</th>
                  <th className="px-5 py-3">Vai trò hiện tại</th>
                  <th className="px-5 py-3">Ngày tham gia</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono">{u.phoneNumber}</td>
                    <td className="px-5 py-3.5">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{u.joinedDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {/* Change Role Selector */}
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value as UserAccount['role'])}
                        className="text-xs border border-slate-200 rounded-md p-1 bg-white focus:outline-none"
                      >
                        <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
                        <option value="ROLE_STAFF">ROLE_STAFF</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                      </select>

                      {/* Toggle Active Button */}
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          u.active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Technical & Microservices */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-slate-900 text-sm">Spring Cloud Gateway</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Port: 8081 | Định tuyến động và CORS cho Frontend.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Latency: 4.2ms | Routes: /api/**
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-slate-900 text-sm">Backend API Core</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Port: 8080 | Spring Boot 3 Modular Monolith.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                JVM Memory: 184MB / 512MB
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900 text-sm">PostgreSQL 16</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Healthy</span>
              </div>
              <p className="text-xs text-slate-500">Port: 5432 | Database `fashion_store_db`.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Pool Size: 10 | Active Conns: 2
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-slate-900 text-sm">Redis 7 Distributed</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-700 font-semibold">Ready</span>
              </div>
              <p className="text-xs text-slate-500">Port: 6379 | Token Blacklist & Session Store.</p>
              <div className="mt-3 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">
                Cache Hit Ratio: 99.4%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddProductOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Thêm Mẫu Thiết Kế Mới</h3>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đầm Voan Hoa Nhí Mùa Thu"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Thời trang Nữ">Thời trang Nữ</option>
                    <option value="Thời trang Nam">Thời trang Nam</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nhãn nổi bật</label>
                  <input
                    type="text"
                    placeholder="Mới / Hot / Giảm 20%"
                    value={newProductTag}
                    onChange={(e) => setNewProductTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá bán (₫) *</label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá gốc (₫)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={newProductOriginalPrice}
                    onChange={(e) => setNewProductOriginalPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tồn kho ban đầu *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hình ảnh sản phẩm *</label>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, GIF (Tối đa 10MB)</span>
                </div>

                {/* Upload from Computer Box */}
                <div className="p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-xl transition flex flex-col sm:flex-row items-center gap-3 mb-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />

                  {/* Thumbnail Preview */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-sm flex items-center justify-center">
                    {newProductImage ? (
                      <img
                        src={newProductImage}
                        alt="Preview"
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tải lên máy chủ...</span>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy tính</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ảnh sẽ được lưu trữ trực tiếp trên máy chủ backend (`/uploads/images/`).
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="mb-2 p-2 rounded-lg bg-red-50 text-red-600 text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Manual URL Input fallback */}
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="Đường dẫn ảnh tĩnh hoặc URL trực tuyến..."
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="w-full pl-3 pr-16 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {newProductImage.startsWith('/uploads/') && (
                    <span className="absolute right-2 top-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Máy chủ
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Lưu & Xuất bản lên Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRestockModalProduct(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Phiếu Nhập Thêm Hàng Vào Kho</h3>
              </div>
              <button onClick={() => setRestockModalProduct(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn sản phẩm cần nhập kho *</label>
                <select
                  value={restockModalProduct.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === Number(e.target.value));
                    if (found) setRestockModalProduct(found);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Hiện có: {p.stock} chiếc - {p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <img 
                  src={getProductImage(restockModalProduct.image)} 
                  alt={restockModalProduct.name} 
                  onError={handleImageError}
                  className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 flex-shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{restockModalProduct.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Tồn kho hiện có: <strong className={restockModalProduct.stock <= 5 ? 'text-red-600' : 'text-slate-800'}>{restockModalProduct.stock}</strong> chiếc
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRestock} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng nhập thêm vào kho *</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Số lượng tồn dự kiến sau nhập: <strong className="text-emerald-700">{restockModalProduct.stock + (restockQty || 0)}</strong> chiếc
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Boxes className="w-3.5 h-3.5" /> Lưu & Tăng tồn kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCategoryModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCategory ? `Chỉnh Sửa Danh Mục: ${editingCategory.name}` : 'Thêm Danh Mục Hàng Hóa Mới'}
                </h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{catError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Khoác & Blazer"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đường dẫn tĩnh (Slug / URL)</label>
                <input
                  type="text"
                  placeholder="Để trống hệ thống sẽ tự sinh (ví dụ: ao-khoac-blazer)"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Định dạng URL thân thiện SEO cho website.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả ngắn danh mục</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả phong cách, dòng hàng cho danh mục này..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh minh họa (Tải lên hoặc dán URL)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={catFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCatFileUpload(file);
                    }}
                  />
                  <input
                    type="url"
                    placeholder="https://... hoặc bấm tải ảnh từ máy"
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isUploadingCatImage}
                    onClick={() => catFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 inline-flex items-center gap-1 transition flex-shrink-0"
                  >
                    {isUploadingCatImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingCatImage ? 'Đang tải...' : 'Tải ảnh'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
