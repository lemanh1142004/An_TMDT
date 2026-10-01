# 🐳 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN BẰNG DOCKER COMPOSE (CHỈ CẦN 1 LỆNH)

Dự án đã được **Container hóa toàn diện 100% bằng Docker**. Người nhận dự án **KHÔNG CẦN CÀI ĐẶT** Java, Maven, Node.js, npm, PostgreSQL hay Redis vào máy tính cá nhân. Mọi thứ sẽ tự động chạy trong môi trường Docker khép kín, tuyệt đối không bị xung đột phiên bản hay lỗi môi trường.

---

## 1. Yêu Cầu Duy Nhất Trên Máy Người Nhận

Máy tính chỉ cần duy nhất 1 phần mềm:
👉 **Docker Desktop**: [Tải Docker Desktop](https://www.docker.com/products/docker-desktop/) *(Hỗ trợ cả Windows, MacOS và Linux)*.

> ⚠️ **Lưu ý quan trọng:** Sau khi cài đặt, hãy mở ứng dụng **Docker Desktop** lên và đợi biểu tượng con cá voi chuyển sang màu xanh lá (Running).

---

## 2. Cách Khởi Chạy Dự Án (Chỉ 1 Thao Tác)

### ⚡ Cách A: Nhấp đúp chuột (Dành cho Windows)
Người nhận chỉ cần nhấp đúp chuột vào file:
👉 **`start.bat`** (nằm ngay thư mục gốc của dự án).

Script sẽ tự động:
1. Kiểm tra kết nối Docker.
2. Build và khởi động 4 container:
   - **PostgreSQL 16** (Database - Port `5432`)
   - **Redis 7** (Cache - Port `6379`)
   - **Spring Boot Backend** (REST API - Port `8080`)
   - **React Frontend + Nginx** (Web App - Port `5173`)
3. Tự động bật trình duyệt web tại: `http://localhost:5173`.

---

### 💻 Cách B: Gõ lệnh Terminal (Dành cho Mac / Linux / Windows PowerShell)
Mở Terminal tại thư mục dự án và chạy duy nhất 1 câu lệnh:
```bash
docker compose up -d --build
```

Mở trình duyệt truy cập: **`http://localhost:5173`**

*(Khi muốn tắt toàn bộ hệ thống, chỉ cần chạy lệnh: `docker compose down` hoặc nhấp đúp vào `stop.bat`)*.

---

## 3. Danh Sách Tài Khoản Thử Nghiệm Có Sẵn

Database PostgreSQL trong Docker sẽ tự động tạo bảng và nạp sẵn toàn bộ 20 sản phẩm thời trang thiết kế, danh mục và 3 tài khoản với các quyền hạn độc lập:

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@fashionstore.com` | `AdminPassword123!` | Quản lý sản phẩm, tải ảnh lên máy chủ, quản lý danh mục, xem audit nhân viên xử lý đơn, phân trang máy chủ. |
| **Nhân viên (Staff)** | `staff@fashionstore.com` | `StaffPassword123!` | Duyệt đơn, in phiếu đóng gói bưu cục, bàn giao ĐVVC (GHTK), đối soát tiền VietQR BIDV, nhập kho hàng. |
| **Khách hàng (Customer)** | `customer@fashionstore.com` | `CustomerPassword123!` | Đổi màu trang phục trực tiếp, giỏ hàng, thanh toán COD / VietQR BIDV, theo dõi tiến độ đơn hàng. |

---

## 4. Dành Cho Bạn Khi Đóng Gói Gửi Dự Án

Trước khi nén file `.zip` gửi cho người khác, bạn chỉ cần:
- Xóa các thư mục tạm (nếu có): `frontend/node_modules/`, `backend/target/`.
- File nén gửi đi sẽ cực kỳ nhẹ (~10MB), người nhận giải nén ra chỉ cần bấm `start.bat` là chạy ngay lập tức!
