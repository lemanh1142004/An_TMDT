# 📖 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN FASHION STORE

Tài liệu này hướng dẫn chi tiết cách cài đặt và khởi chạy dự án Fashion Store trên một máy tính mới.

---

## 1. Yêu Cầu Môi Trường (Cần cài trước trên máy)

Trước khi chạy, máy tính của bạn cần có các phần mềm sau:
1. **JDK 17** (hoặc Java 17 - 21): [Tải OpenJDK 17](https://adoptium.net/) (Kiểm tra bằng lệnh: `java -version`)
2. **Node.js 18+ hoặc 20+ (LTS)**: [Tải Node.js](https://nodejs.org/) (Kiểm tra bằng lệnh: `node -v` và `npm -v`)
3. **Docker Desktop**: [Tải Docker Desktop](https://www.docker.com/products/docker-desktop/) (để tự động chạy PostgreSQL 16 và Redis)
   *(Lưu ý: Sau khi cài xong, hãy bật ứng dụng Docker Desktop lên trước khi chạy).*

---

## 2. Cách 1: Khởi Chạy Nhanh 1-Chạm (Khuyên Dùng Trên Windows)

Nếu bạn dùng hệ điều hành Windows, chỉ cần:
1. Đảm bảo ứng dụng **Docker Desktop** đang mở và chạy.
2. Nhấp đúp chuột (Double Click) vào file:
   👉 **`start.bat`** (nằm ngay tại thư mục gốc dự án)
3. File này sẽ tự động:
   - Khởi động cơ sở dữ liệu PostgreSQL & Redis qua Docker.
   - Chạy Backend Spring Boot (Port `8080`).
   - Cài đặt thư viện `npm install` và chạy Frontend React (Port `5173`).
   - Tự động mở trình duyệt tại: `http://localhost:5173`.

---

## 3. Cách 2: Khởi Chạy Thủ Công Bằng Terminal

Nếu muốn chạy từng dịch vụ bằng lệnh:

### Bước 1: Khởi động Database & Cache (Docker)
Mở Terminal / PowerShell tại thư mục gốc của dự án:
```bash
docker compose up -d
```
> Lệnh này sẽ tải và khởi động 2 container: `fashion_postgres` (Port 5432) và `fashion_redis` (Port 6379).

### Bước 2: Chạy Backend Spring Boot
Mở một cửa sổ Terminal mới:
```bash
cd backend

# Trên Windows:
.\mvnw.cmd spring-boot:run

# Trên MacOS / Linux:
./mvnw spring-boot:run
```
> **Đặc biệt (Tự động nạp dữ liệu):** Bạn KHÔNG cần phải import file SQL thủ công. Khi Backend khởi động lần đầu, hệ thống sẽ tự động tạo bảng và nạp sẵn 4 danh mục, 20 sản phẩm thời trang thiết kế, các tài khoản mẫu và đơn hàng mẫu vào database.

### Bước 3: Chạy Frontend React Vite
Mở một cửa sổ Terminal khác:
```bash
cd frontend
npm install
npm run dev
```

Truy cập website trên trình duyệt tại: **`http://localhost:5173`**

---

## 4. Danh Sách Tài Khoản Thử Nghiệm Có Sẵn

Hệ thống đã phân chia quyền hạn độc lập rõ ràng (RBAC), bạn có thể dùng các tài khoản sau:

| Vai trò | Email đăng nhập | Mật khẩu | Các chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@fashionstore.com` | `AdminPassword123!` | Quản lý sản phẩm, tải ảnh lên server, quản lý danh mục, quản trị người dùng & phân quyền, xem audit nhân viên xử lý đơn, phân trang máy chủ. |
| **Nhân viên (Staff)** | `staff@fashionstore.com` | `StaffPassword123!` | Tiếp nhận đơn, duyệt đơn, in phiếu đóng gói bưu cục, bàn giao ĐVVC (GHTK, Viettel Post), đối soát tiền chuyển khoản VietQR BIDV, nhập kho hàng. |
| **Khách hàng (Customer)** | `customer@fashionstore.com` | `CustomerPassword123!` | Xem sản phẩm, đổi màu trang phục trực tiếp, giỏ hàng, đặt hàng thanh toán COD / VietQR BIDV, theo dõi tiến độ đơn, hủy đơn. |

---

## 5. Lưu Ý Dành Cho Người Đóng Gói / Gửi Dự Án

Khi bạn nén thư mục gửi cho người khác hoặc đẩy lên Google Drive:
- **KHÔNG NÊN** nén các thư mục sau (rất nặng và có thể tự tải lại):
  - `frontend/node_modules/`
  - `node_modules/`
  - `backend/target/`
  - `postgres_data/` hoặc `docker-data/`
- Thư mục sau khi bỏ các mục trên chỉ nặng khoảng **10 - 20 MB**, gửi qua Zalo/Drive/Gmail cực kỳ nhanh chóng.
