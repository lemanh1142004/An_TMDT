package com.fashionstore.backend.config;

import com.fashionstore.backend.modules.order.entity.Order;
import com.fashionstore.backend.modules.order.entity.OrderItem;
import com.fashionstore.backend.modules.order.entity.OrderStatus;
import com.fashionstore.backend.modules.order.entity.PaymentMethod;
import com.fashionstore.backend.modules.order.repository.OrderRepository;
import com.fashionstore.backend.modules.product.entity.Category;
import com.fashionstore.backend.modules.product.entity.Product;
import com.fashionstore.backend.modules.product.repository.CategoryRepository;
import com.fashionstore.backend.modules.product.repository.ProductRepository;
import com.fashionstore.backend.modules.user.entity.Role;
import com.fashionstore.backend.modules.user.entity.RoleType;
import com.fashionstore.backend.modules.user.entity.User;
import com.fashionstore.backend.modules.user.repository.RoleRepository;
import com.fashionstore.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        log.info("Checking initial system roles, default demo accounts, products, and orders...");

        // 1. Seed Roles
        Role customerRole = seedRole(RoleType.ROLE_CUSTOMER, "Khách hàng mua sắm");
        Role adminRole = seedRole(RoleType.ROLE_ADMIN, "Quản trị viên hệ thống");
        Role staffRole = seedRole(RoleType.ROLE_STAFF, "Nhân viên vận hành & quản lý đơn");

        // 2. Seed Default Admin (Strictly ROLE_ADMIN only)
        seedUserIfNotExists(
                "admin@fashionstore.com",
                "AdminPassword123!",
                "Fashion Store Administrator",
                "0901234567",
                Set.of(adminRole)
        );

        // Ensure existing admin account only has ROLE_ADMIN (strictly isolated)
        userRepository.findByEmail("admin@fashionstore.com").ifPresent(adminUser -> {
            if (adminUser.getRoles().size() > 1 || !adminUser.getRoles().contains(adminRole)) {
                adminUser.setRoles(new HashSet<>(Set.of(adminRole)));
                userRepository.save(adminUser);
                log.info("Synchronized admin account roles: [ROLE_ADMIN]");
            }
        });

        // 3. Seed Default Staff
        seedUserIfNotExists(
                "staff@fashionstore.com",
                "StaffPassword123!",
                "Nguyễn Văn Nhân Viên",
                "0902345678",
                Set.of(staffRole)
        );

        // 4. Seed Default Customer
        User customerUser = seedUserIfNotExists(
                "customer@fashionstore.com",
                "CustomerPassword123!",
                "Trần Thị Khách Hàng",
                "0903456789",
                Set.of(customerRole)
        );

        // 5. Seed Additional Customers for Admin list testing
        seedUserIfNotExists(
                "long.le@gmail.com",
                "CustomerPassword123!",
                "Lê Hoàng Long",
                "0988123456",
                Set.of(customerRole)
        );

        // 6. Seed Categories & Products if empty
        seedCatalogIfEmpty();

        // 7. Seed Orders if empty
        seedOrdersIfEmpty(customerUser);
    }

    private void seedCatalogIfEmpty() {
        if (categoryRepository.count() == 0) {
            log.info("Categories table is empty. Seeding initial categories...");
            Category women = categoryRepository.save(Category.builder().name("Thời trang Nữ").slug("thoi-trang-nu").description("Bộ sưu tập thời trang nữ thiết kế cao cấp").build());
            Category men = categoryRepository.save(Category.builder().name("Thời trang Nam").slug("thoi-trang-nam").description("Lịch lãm, hiện đại và chuẩn mực").build());
            Category accessories = categoryRepository.save(Category.builder().name("Phụ kiện").slug("phu-kien").description("Túi da, thắt lưng & trang sức tối giản").build());
            Category unisex = categoryRepository.save(Category.builder().name("Unisex").slug("unisex").description("Phong cách thời trang phi giới tính tự do").build());

            if (productRepository.count() == 0) {
                log.info("Products table is empty. Seeding initial product catalog...");
                productRepository.saveAll(List.of(
                        Product.builder()
                                .name("Áo Blazer Minimalist Oversize")
                                .category(men)
                                .price(BigDecimal.valueOf(950000))
                                .originalPrice(BigDecimal.valueOf(1350000))
                                .stock(28)
                                .image("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80")
                                .tag("Giảm 30%")
                                .rating(4.9)
                                .reviewsCount(84)
                                .description("Áo khoác blazer tối giản may đo cao cấp với chất liệu wool blend giữ form hoàn hảo.")
                                .active(true)
                                .build(),
                        Product.builder()
                                .name("Đầm Lụa Satin Maxi Dạ Tiệc")
                                .category(women)
                                .price(BigDecimal.valueOf(1200000))
                                .originalPrice(BigDecimal.valueOf(1600000))
                                .stock(12)
                                .image("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80")
                                .tag("Bán chạy")
                                .rating(5.0)
                                .reviewsCount(112)
                                .description("Đầm lụa mềm mại rủ nhẹ tôn dáng quý phái, phù hợp các buổi tiệc dạ hội trang trọng.")
                                .active(true)
                                .build(),
                        Product.builder()
                                .name("Áo Sơ Mi Oxford Cotton Premium")
                                .category(men)
                                .price(BigDecimal.valueOf(550000))
                                .originalPrice(BigDecimal.valueOf(690000))
                                .stock(45)
                                .image("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80")
                                .tag("New")
                                .rating(4.8)
                                .reviewsCount(65)
                                .description("Chất vải 100% cotton Oxford thoáng khí, cổ bẻ thanh lịch chống nhăn công sở.")
                                .active(true)
                                .build(),
                        Product.builder()
                                .name("Quần Tây Form Ý Dáng Rộng")
                                .category(men)
                                .price(BigDecimal.valueOf(680000))
                                .originalPrice(null)
                                .stock(18)
                                .image("https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80")
                                .tag("Hot")
                                .rating(4.7)
                                .reviewsCount(42)
                                .description("Quần tây ly xòe nhẹ phong cách Sartorial Ý hiện đại kết hợp dễ dàng.")
                                .active(true)
                                .build(),
                        Product.builder()
                                .name("Túi Xách Da Crossbody Nữ Tinh Tế")
                                .category(accessories)
                                .price(BigDecimal.valueOf(850000))
                                .originalPrice(BigDecimal.valueOf(1100000))
                                .stock(4)
                                .image("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80")
                                .tag("Giảm 23%")
                                .rating(4.9)
                                .reviewsCount(98)
                                .description("Túi đeo chéo da nhân tạo cao cấp đường chỉ may tỉ mỉ, khóa mạ vàng champagne.")
                                .active(true)
                                .build(),
                        Product.builder()
                                .name("Áo Len Dệt Kim Cổ Lọ Thu Đông")
                                .category(unisex)
                                .price(BigDecimal.valueOf(720000))
                                .originalPrice(null)
                                .stock(3)
                                .image("https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80")
                                .tag("New Season")
                                .rating(4.8)
                                .reviewsCount(53)
                                .description("Sợi len tự nhiên giữ ấm tối ưu mà không gây bí ráp, phong cách Bắc Âu.")
                                .active(true)
                                .build()
                ));
                log.info("Product catalog seeded with 6 default fashion items.");
            }
        }
    }

    private void seedOrdersIfEmpty(User customerUser) {
        if (orderRepository.count() == 0) {
            log.info("Orders table is empty. Seeding initial demo orders...");
            List<Product> products = productRepository.findAll();
            Product p1 = products.size() > 0 ? products.get(0) : null;
            Product p2 = products.size() > 1 ? products.get(1) : null;
            Product p3 = products.size() > 2 ? products.get(2) : null;

            if (p1 != null && p2 != null) {
                // Order 1: Shipped
                Order o1 = Order.builder()
                        .orderCode("ORD-2026-901")
                        .user(customerUser)
                        .customerName("Trần Thị Khách Hàng")
                        .customerEmail("customer@fashionstore.com")
                        .phoneNumber("0903456789")
                        .shippingAddress("Số 45, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh")
                        .subtotal(BigDecimal.valueOf(1500000))
                        .discount(BigDecimal.ZERO)
                        .shippingFee(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.valueOf(1500000))
                        .paymentMethod(PaymentMethod.VNPAY)
                        .isPaid(true)
                        .status(OrderStatus.SHIPPED)
                        .carrier("GHTK Express")
                        .trackingCode("GHTK-88129034")
                        .note("Giao giờ hành chính")
                        .build();

                o1.addItem(OrderItem.builder().product(p1).productName(p1.getName()).size("L").color("Đen Charcoal").price(p1.getPrice()).quantity(1).build());
                if (p3 != null) {
                    o1.addItem(OrderItem.builder().product(p3).productName(p3.getName()).size("L").color("Trắng").price(p3.getPrice()).quantity(1).build());
                }
                orderRepository.save(o1);

                // Order 2: Delivered
                Order o2 = Order.builder()
                        .orderCode("ORD-2026-880")
                        .user(customerUser)
                        .customerName("Trần Thị Khách Hàng")
                        .customerEmail("customer@fashionstore.com")
                        .phoneNumber("0903456789")
                        .shippingAddress("Số 45, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh")
                        .subtotal(BigDecimal.valueOf(1200000))
                        .discount(BigDecimal.ZERO)
                        .shippingFee(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.valueOf(1200000))
                        .paymentMethod(PaymentMethod.COD)
                        .isPaid(true)
                        .status(OrderStatus.DELIVERED)
                        .carrier("Viettel Post")
                        .trackingCode("VTP-44218890")
                        .build();

                o2.addItem(OrderItem.builder().product(p2).productName(p2.getName()).size("M").color("Xanh Emerald").price(p2.getPrice()).quantity(1).build());
                orderRepository.save(o2);

                // Order 3: Pending (for Staff review)
                Order o3 = Order.builder()
                        .orderCode("ORD-2026-905")
                        .user(null)
                        .customerName("Hoàng Minh Tuấn")
                        .customerEmail("hoangminh@gmail.com")
                        .phoneNumber("0912345678")
                        .shippingAddress("128 Cầu Giấy, P. Quan Hoa, Cầu Giấy, Hà Nội")
                        .subtotal(BigDecimal.valueOf(680000))
                        .discount(BigDecimal.ZERO)
                        .shippingFee(BigDecimal.valueOf(30000))
                        .totalAmount(BigDecimal.valueOf(710000))
                        .paymentMethod(PaymentMethod.COD)
                        .isPaid(false)
                        .status(OrderStatus.PENDING)
                        .carrier("Chờ gán bưu tá")
                        .trackingCode("CHỜ-XỬ-LÝ")
                        .note("Gọi trước khi giao hàng 15 phút")
                        .build();

                o3.addItem(OrderItem.builder().product(p1).productName(p1.getName()).size("M").color("Đen").price(BigDecimal.valueOf(680000)).quantity(1).build());
                orderRepository.save(o3);

                log.info("Seeded 3 demo orders with OrderItems in PostgreSQL.");
            }
        }
    }

    private User seedUserIfNotExists(String email, String rawPassword, String fullName, String phone, Set<Role> roles) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .phoneNumber(phone)
                    .active(true)
                    .authProvider("LOCAL")
                    .roles(new HashSet<>(roles))
                    .build();

            User saved = userRepository.save(user);
            log.info("Default account created: {} [{}]", email, roles.stream().map(r -> r.getName().name()).toList());
            return saved;
        });
    }

    private Role seedRole(RoleType roleType, String description) {
        return roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(roleType)
                            .description(description)
                            .build();
                    return roleRepository.save(role);
                });
    }
}
