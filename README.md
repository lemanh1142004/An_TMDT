# 🛍️ Fashion Store E-Commerce Platform

Dự án website thương mại điện tử thời trang được xây dựng theo kiến trúc hướng module (Modular Monolith), sẵn sàng mở rộng (Microservices-ready).

---

## 1. 🏗️ Tech Stack

### Backend
* **Runtime:** Java 18 (Tương thích bytecode Java 17/21)
* **Framework:** Spring Boot 3.3.4
* **Build Tool:** Maven 3.9.x (đi kèm Maven Wrapper `mvnw` / `mvnw.cmd`)
* **Persistence & ORM:** Spring Data JPA, Hibernate, PostgreSQL Driver
* **Caching & In-Memory:** Spring Data Redis, Lettuce
* **Security & Auth:** Spring Security 6, JWT (`jjwt` 0.12.6), Spring OAuth2 Client
* **Monitoring:** Spring Boot Actuator

### API Gateway
* **Framework:** Spring Cloud Gateway 2023.0.3 (Reactive WebFlux / Netty)
* **Chức năng:** Reverse proxy, Single Entry Point cho Frontend, tập trung quản trị CORS, định tuyến `/api/**` sang Backend

### Frontend
* **Core:** React 19, Vite 8, TypeScript 5
* **Routing:** React Router DOM 6
* **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
* **Icons:** Lucide React
* **HTTP Client:** Axios 1.7 (cấu hình tập trung tại `services/api.ts`)

### Hạ tầng (Infrastructure)
* **Container:** Docker, Docker Compose
* **Database:** PostgreSQL 16 Alpine (với persistent volume `postgres_data` và healthcheck)
* **Cache:** Redis 7 Alpine (với volume `redis_data` và healthcheck)

---

## 2. 🌐 Danh sách Cổng Dịch vụ (Port Mapping)

| Dịch vụ | Port Mặc định | Ghi chú |
| :--- | :--- | :--- |
| **Frontend** | `5173` | Giao diện React Vite (`http://localhost:5173`) |
| **API Gateway** | `8081` | Single Entry Point định tuyến API (`http://localhost:8081`) |
| **Backend API** | `8080` | REST API service nội bộ (`http://localhost:8080`) |
| **PostgreSQL** | `5432` | Relational Database (Docker) |
| **Redis** | `6379` | Cache & Session store (Docker) |

---

## 3. 📂 Cấu trúc Dự án (Project Structure)

```text
fashion-store/
│
├── .env.example                     # Mẫu khai báo biến môi trường chuẩn
├── .env                             # Biến môi trường local (đã gitignore)
├── .gitignore                       # Cấu hình bỏ qua file cho Java, Node, Docker, IDEs
├── docker-compose.yml               # Cấu hình container PostgreSQL 16 & Redis 7
├── README.md                        # Tài liệu hướng dẫn dự án
│
├── backend/                         # Dịch vụ Backend (Spring Boot 3)
│   ├── mvnw / mvnw.cmd              # Maven Wrapper
│   ├── pom.xml                      # Cấu hình dependencies backend
│   └── src/
│       ├── main/java/com/fashionstore/backend/
│       │   ├── BackendApplication.java
│       │   ├── common/              # Healthcheck endpoint (/api/health)
│       │   └── config/              # Cấu hình Security, Redis
│       └── main/resources/application.yml
│
├── gateway/                         # Dịch vụ API Gateway (Spring Cloud Gateway)
│   ├── mvnw / mvnw.cmd              # Maven Wrapper
│   ├── pom.xml                      # Cấu hình dependencies gateway
│   └── src/
│       ├── main/java/com/fashionstore/gateway/GatewayApplication.java
│       └── main/resources/application.yml # Route /api/** -> :8080 & CORS
│
└── frontend/                        # Ứng dụng Client (React + Vite + TS)
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── components/              # UI Components dùng chung
        ├── layouts/                 # Root Layout, Header, Footer
        ├── pages/                   # Trang giao diện (HomePage)
        ├── services/                # Axios Client (api.ts)
        ├── hooks/ / context/ / utils/ / types/
        ├── App.tsx
        └── main.tsx
```

---

## 4. 🚀 Hướng dẫn Khởi chạy Từng bước

### Bước 1: Khởi tạo biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / MacOS / Git Bash
cp .env.example .env
```

### Bước 2: Khởi động Hạ tầng (PostgreSQL & Redis)
Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:
```bash
# Khởi động PostgreSQL và Redis ngầm
docker compose up -d

# Kiểm tra trạng thái và healthcheck
docker compose ps
```

### Bước 3: Khởi động Backend API
Mở một cửa sổ terminal mới:
```bash
cd backend

# Trên Windows
.\mvnw.cmd spring-boot:run

# Trên Linux / macOS / Git Bash
./mvnw spring-boot:run
```
* Backend sẽ lắng nghe tại `http://localhost:8080`.
* Kiểm tra endpoint trực tiếp: `http://localhost:8080/api/health`.

### Bước 4: Khởi động API Gateway
Mở một cửa sổ terminal mới:
```bash
cd gateway

# Trên Windows
.\mvnw.cmd spring-boot:run

# Trên Linux / macOS / Git Bash
./mvnw spring-boot:run
```
* Gateway sẽ lắng nghe tại `http://localhost:8081`.
* Kiểm tra định tuyến qua Gateway: `http://localhost:8081/api/health` (sẽ được proxy sang Backend).

### Bước 5: Khởi động Frontend
Mở một cửa sổ terminal mới:
```bash
cd frontend

# Cài đặt thư viện nếu chưa cài
npm install

# Chạy server development
npm run dev
```
* Truy cập ứng dụng tại: `http://localhost:5173`.
* Nhấn nút **"Test Connection"** trên trang chủ để kiểm tra luồng kết nối hoàn chỉnh: `Frontend (5173) -> Gateway (8081) -> Backend (8080)`.

---

## 5. ⚙️ Mô tả Biến Môi trường (.env)

| Tên biến | Giá trị mẫu | Mô tả |
| :--- | :--- | :--- |
| `POSTGRES_DB` | `fashion_store_db` | Tên database trong PostgreSQL |
| `POSTGRES_USER` | `fashion_user` | Tài khoản quản trị database |
| `POSTGRES_PASSWORD` | `fashion_secret_password` | Mật khẩu database |
| `DATABASE_HOST` | `localhost` | Host kết nối tới PostgreSQL |
| `DATABASE_PORT` | `5432` | Cổng kết nối PostgreSQL |
| `REDIS_HOST` | `localhost` | Host kết nối tới Redis |
| `REDIS_PORT` | `6379` | Cổng kết nối Redis |
| `BACKEND_PORT` | `8080` | Cổng chạy dịch vụ Backend |
| `GATEWAY_PORT` | `8081` | Cổng chạy dịch vụ API Gateway |
| `BACKEND_SERVICE_URL` | `http://localhost:8080` | URL Backend để Gateway reverse proxy |
| `VITE_API_BASE_URL` | `http://localhost:8081` | Base URL API mà Frontend gọi tới (qua Gateway) |
| `JWT_SECRET` | *(chuỗi 256-bit)* | Khóa bí mật ký JWT token |
| `JWT_EXPIRATION` | `86400000` | Thời hạn JWT (ms) - 24 giờ |
| `GOOGLE_CLIENT_ID` | `mock_client_id` | OAuth2 Client ID (dành cho roadmap sau) |
| `GOOGLE_CLIENT_SECRET` | `mock_client_secret` | OAuth2 Client Secret (dành cho roadmap sau) |
