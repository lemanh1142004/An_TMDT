const puppeteer = require('puppeteer-core');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:/Users/admin/.gemini/antigravity/brain/b8d1d37c-89e2-49c1-bfdd-44a521d4d144';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function capture() {
  console.log('1. Lấy token Admin qua API...');
  const adminAuth = await apiLogin('admin@fashionstore.com', 'AdminPassword123!');
  console.log(' - Admin token:', adminAuth.accessToken ? 'OK' : 'FAIL');

  console.log('2. Lấy token Staff qua API...');
  const staffAuth = await apiLogin('staff@fashionstore.com', 'StaffPassword123!');
  console.log(' - Staff token:', staffAuth.accessToken ? 'OK' : 'FAIL');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  // 1. Set admin token và vào /admin
  console.log('3. Mở Admin Dashboard...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, adminAuth.accessToken);

  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  console.log('4. Chụp bảng Đơn hàng phía Admin (admin_orders_staff_view.png)...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_orders_staff_view.png'),
    fullPage: false
  });

  // 2. Chuyển sang Tab Quản lý Sản phẩm & mở Modal Nhập kho
  console.log('5. Chuyển sang tab Sản phẩm và mở Modal Nhập kho (admin_restock_modal.png)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const prodTab = buttons.find(b => b.textContent && b.textContent.includes('Quản lý Sản phẩm & Tồn kho'));
    if (prodTab) prodTab.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const restockBtn = buttons.find(b => b.textContent && b.textContent.includes('Phiếu nhập kho'));
    if (restockBtn) restockBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_restock_modal.png'),
    fullPage: false
  });

  // Đóng modal restock
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cancelBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'Hủy');
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 3. Chuyển sang Tab Quản lý Danh mục
  console.log('6. Chụp Tab Quản lý Danh mục (admin_categories_tab.png)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const catTab = buttons.find(b => b.textContent && b.textContent.includes('Quản lý Danh mục'));
    if (catTab) catTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_categories_tab.png'),
    fullPage: false
  });

  // 4. Mở Staff Dashboard
  console.log('7. Mở Staff Dashboard (staff_workspace.png)...');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, staffAuth.accessToken);

  await page.goto('http://localhost:5173/staff', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'staff_workspace.png'),
    fullPage: false
  });

  await browser.close();
  console.log('=== CHỤP ẢNH MÀN HÌNH HOÀN TẤT THÀNH CÔNG! ===');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
