# 🐳 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN BẰNG DOCKER COMPOSE

Dự án đã được **Container hóa toàn diện 100% bằng Docker**. Người phát triển hoặc người chấm thi **KHÔNG CẦN CÀI ĐẶT** thủ công Java, Maven, Node.js, npm, PostgreSQL hay Redis vào máy tính cá nhân. Mọi thứ sẽ tự động chạy trong môi trường Docker khép kín, tuyệt đối không bị xung đột phiên bản hay lỗi môi trường.

---

## 1. Yêu Cầu Duy Nhất Trên Máy Tính

Máy tính chỉ cần cài đặt:
👉 **Docker Desktop**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) *(Hỗ trợ cả Windows, MacOS và Linux)*.

> ⚠️ **Lưu ý quan trọng:** Sau khi cài đặt xong Docker Desktop, hãy **mở ứng dụng Docker Desktop lên** và đợi biểu tượng con cá voi ở góc dưới chuyển sang màu xanh lá cây (**Engine running**).

---

## 2. Cách Khởi Chạy Dự Án

### ⚡ Cách 1: Nhấp đúp chuột (Dành cho Windows - Đơn giản nhất)
1. Mở thư mục dự án trong File Explorer của Windows.
2. **Nhấp đúp chuột vào file `start.bat`** (Nhấp đúp trực tiếp ngoài thư mục Windows).

Script sẽ tự động:
- Kiểm tra Docker Desktop đã bật hay chưa.
- Tự động dựng và chạy 4 dịch vụ:
  - **PostgreSQL 16**: Port `5432` (Cơ sở dữ liệu quan hệ)
  - **Redis 7**: Port `6379` (Bộ nhớ đệm In-memory Caching)
  - **Spring Boot Backend**: Port `8080` (REST API & Chat Service)
  - **React Vite Frontend**: Port `5173` (Website mua sắm & Quản trị)
- Tự động mở trình duyệt web tại: **`http://localhost:5173`**.

---

### 💻 Cách 2: Gõ lệnh Terminal (Dành cho MacOS / Linux / Windows PowerShell)
Mở cửa sổ dòng lệnh (Terminal hoặc PowerShell) tại thư mục dự án và chạy duy nhất lệnh:
```bash
docker compose up -d --build
```
Sau đó mở trình duyệt truy cập: **`http://localhost:5173`**

*(Khi muốn tắt toàn bộ hệ thống: Nhấp đúp vào `stop.bat` hoặc gõ `docker compose down`)*.

---

## 3. Danh Sách Tài Khoản Thử Nghiệm Sẵn Có

Hệ thống đã nạp sẵn **32 sản phẩm thời trang thiết kế** (có phân trang 8 sp/trang), lịch sử đơn hàng và 3 tài khoản mẫu với đầy đủ phân quyền:

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@fashionstore.com` | `AdminPassword123!` | Quản lý sản phẩm & tồn kho, quản lý danh mục, duyệt đơn hàng, phân quyền nhân viên, **hệ thống tin nhắn 2 kênh (Khách hàng & Nội bộ)**. |
| **Nhân viên (Staff)** | `staff@fashionstore.com` | `StaffPassword123!` | Xử lý duyệt đơn hàng, in phiếu đóng gói, cập nhật giao vận GHTK, đối soát VietQR, nhập kho, **tin nhắn 2 kênh (Hỗ trợ khách & Trao đổi với Admin)**. |
| **Khách hàng (Customer)** | `customer@fashionstore.com` | `CustomerPassword123!` | Mua sắm trang phục, chọn size/màu, giỏ hàng, đặt hàng COD/VietQR, theo dõi trạng thái đơn hàng, **bong bóng chat nổi góc màn hình để hỏi tư vấn**. |

---

## 4. Các Lệnh Quản Trị & Kiểm Tra Hệ Thống Docker

* **Kiểm tra trạng thái các container**:
  ```bash
  docker compose ps
  ```
* **Xem log thời gian thực của Backend**:
  ```bash
  docker compose logs -f backend
  ```
* **Xem log của Redis Cache hoặc Database**:
  ```bash
  docker compose logs -f redis
  docker compose logs -f postgres
  ```
* **Dừng toàn bộ hệ thống**:
  ```bash
  docker compose down
  ```
* **Khởi động lại và rebuild khi có thay đổi mã nguồn**:
  ```bash
  docker compose up -d --build
  ```
