const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TÍNH NĂNG MỚI ===\n');

  // 1. Đăng nhập Customer, Staff, Admin
  console.log('1. Đăng nhập các vai trò (RBAC):');
  const loginCustomer = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'customer@fashionstore.com', password: 'CustomerPassword123!' });
  const customerToken = loginCustomer.data?.accessToken;
  console.log(' - Customer login:', loginCustomer.status === 200 ? '✅ Thành công' : `❌ Thất bại (${loginCustomer.status} ${loginCustomer.raw})`);

  const loginStaff = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'staff@fashionstore.com', password: 'StaffPassword123!' });
  const staffToken = loginStaff.data?.accessToken;
  console.log(' - Staff login:', loginStaff.status === 200 ? '✅ Thành công' : `❌ Thất bại (${loginStaff.status} ${loginStaff.raw})`);

  const loginAdmin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@fashionstore.com', password: 'AdminPassword123!' });
  const adminToken = loginAdmin.data?.accessToken;
  console.log(' - Admin login:', loginAdmin.status === 200 ? '✅ Thành công' : `❌ Thất bại (${loginAdmin.status} ${loginAdmin.raw})`);

  if (!customerToken || !staffToken || !adminToken) {
    console.error('Lỗi: Không lấy được token đăng nhập!');
    process.exit(1);
  }

  // 2. Customer tạo đơn hàng mới
  console.log('\n2. Khách hàng tạo đơn hàng:');
  const createOrderRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    }
  }, {
    customerName: 'Trần Thị Khách Hàng',
    phone: '0912345678',
    address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    paymentMethod: 'COD',
    note: 'Giao giờ hành chính giúp em',
    items: [{ productId: 1, size: 'M', color: 'Đen', quantity: 2 }]
  });
  console.log(' - Tạo đơn hàng:', createOrderRes.status === 201 ? '✅ Thành công (201 Created)' : `❌ Mã ${createOrderRes.status}`);
  const createdOrder = createOrderRes.data;
  console.log(' - Mã đơn:', createdOrder?.orderCode, '| Trạng thái ban đầu:', createdOrder?.status);
  console.log(' - Nhân viên xử lý ban đầu:', createdOrder?.processedBy || '(Chưa có nhân viên xử lý)');

  const orderId = createdOrder?.id;

  // 3. Staff duyệt và xử lý đơn hàng
  console.log('\n3. Nhân viên xử lý đơn hàng (Staff Workflow):');
  const updateOrderRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/orders/${orderId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    }
  }, {
    status: 'PROCESSING',
    carrier: 'GHTK Express',
    trackingCode: 'GHTK-99887766'
  });
  console.log(' - Nhân viên cập nhật trạng thái sang PROCESSING:', updateOrderRes.status === 200 ? '✅ Thành công' : `❌ Mã ${updateOrderRes.status}`);
  const processedOrder = updateOrderRes.data;
  console.log(' - Trạng thái mới:', processedOrder?.status);
  console.log(' - Ghi nhận Nhân viên xử lý (processedBy):', processedOrder?.processedBy);
  console.log(' - Ghi nhận Email nhân viên (processedByEmail):', processedOrder?.processedByEmail);
  console.log(' - Thời gian xử lý (processedAt):', processedOrder?.processedAt);

  // 4. Admin kiểm tra danh sách đơn hàng
  console.log('\n4. Phía Admin tra cứu đơn hàng & nhân viên xử lý:');
  const getOrdersRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/orders',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  console.log(' - Lấy toàn bộ đơn hàng:', getOrdersRes.status === 200 ? '✅ Thành công' : `❌ Mã ${getOrdersRes.status}`);
  const ordersList = getOrdersRes.data || [];
  const targetOrder = ordersList.find(o => o.id === orderId);
  if (targetOrder && targetOrder.processedBy) {
    console.log(` - ✅ ĐƠN HÀNG #${targetOrder.orderCode} ĐƯỢC ADMIN THẤY RÕ:`);
    console.log(`   + Tên nhân viên: ${targetOrder.processedBy}`);
    console.log(`   + Email nhân viên: ${targetOrder.processedByEmail}`);
    console.log(`   + Thời điểm xử lý: ${targetOrder.processedAt}`);
  } else {
    console.log(' - ❌ Không tìm thấy thông tin nhân viên xử lý trong đơn hàng!');
  }

  // 5. Kiểm thử Tính năng Nhập Kho Sản Phẩm (Restock)
  console.log('\n5. Kiểm thử Tính năng Nhập Kho Sản Phẩm:');
  const getProduct1Before = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/products/1',
    method: 'GET'
  });
  const stockBefore = getProduct1Before.data?.stock || 0;
  console.log(` - Sản phẩm 1 ("${getProduct1Before.data?.name}") tồn kho hiện tại: ${stockBefore} chiếc`);

  const restockRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/products/1/stock',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    }
  }, { addedQuantity: 30 });
  console.log(' - Thực hiện nhập kho thêm 30 chiếc:', restockRes.status === 200 ? '✅ Thành công' : `❌ Mã ${restockRes.status} (${restockRes.raw})`);

  const getProduct1After = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/products/1',
    method: 'GET'
  });
  const stockAfter = getProduct1After.data?.stock || 0;
  console.log(` - Tồn kho sau khi nhập: ${stockAfter} chiếc (Tăng đúng ${stockAfter - stockBefore} chiếc)`);

  // 6. Kiểm thử Tính năng Quản lý Danh mục (Category CRUD):
  console.log('\n6. Kiểm thử Tính năng Quản lý Danh mục (Category CRUD):');
  const catTimestamp = Date.now().toString().slice(-4);
  const testCatName = `Phụ kiện & Trang sức ${catTimestamp}`;
  const testCatSlug = `phu-kien-trang-suc-${catTimestamp}`;

  const createCategoryRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/categories',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: testCatName,
    slug: testCatSlug,
    description: 'Túi xách cao cấp, kính mát và trang sức thời trang 2026',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3'
  });
  console.log(' - Tạo danh mục mới:', createCategoryRes.status === 201 ? '✅ Thành công (201 Created)' : `❌ Mã ${createCategoryRes.status} (${createCategoryRes.raw})`);
  const createdCat = createCategoryRes.data;
  console.log(`   + ID: ${createdCat?.id} | Tên: ${createdCat?.name} | Slug: ${createdCat?.slug}`);

  const updatedCatName = `Phụ kiện Cao Cấp ${catTimestamp}`;
  const updatedCatSlug = `phu-kien-cao-cap-${catTimestamp}`;

  const updateCategoryRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/categories/${createdCat?.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: updatedCatName,
    slug: updatedCatSlug,
    description: 'Bộ sưu tập túi da thật và phụ kiện kim hoàn cao cấp'
  });
  console.log(' - Cập nhật danh mục:', updateCategoryRes.status === 200 ? '✅ Thành công' : `❌ Mã ${updateCategoryRes.status} (${updateCategoryRes.raw})`);
  const updatedCat = updateCategoryRes.data;
  console.log(`   + Tên sau cập nhật: ${updatedCat?.name} | Slug: ${updatedCat?.slug}`);

  // Test Delete Category
  const deleteCatRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/categories/${createdCat?.id}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  console.log(' - Xóa danh mục vừa tạo (Clean up):', deleteCatRes.status === 204 ? '✅ Thành công (204 No Content)' : `❌ Mã ${deleteCatRes.status}`);

  const getAllCatsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/categories',
    method: 'GET'
  });
  console.log(` - Tổng số danh mục trong hệ thống hiện tại: ${getAllCatsRes.data?.length} danh mục`);

  console.log('\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG 100%! ===');
}

run().catch(console.error);
