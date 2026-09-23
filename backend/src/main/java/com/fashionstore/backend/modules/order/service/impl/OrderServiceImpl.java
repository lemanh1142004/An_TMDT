package com.fashionstore.backend.modules.order.service.impl;

import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.order.dto.ConfirmPaymentRequest;
import com.fashionstore.backend.modules.order.dto.CreateOrderRequest;
import com.fashionstore.backend.modules.order.dto.OrderDto;
import com.fashionstore.backend.modules.order.dto.OrderItemDto;
import com.fashionstore.backend.modules.order.dto.UpdateOrderStatusRequest;
import com.fashionstore.backend.modules.order.entity.Order;
import com.fashionstore.backend.modules.order.entity.OrderItem;
import com.fashionstore.backend.modules.order.entity.OrderStatus;
import com.fashionstore.backend.modules.order.entity.PaymentMethod;
import com.fashionstore.backend.modules.order.repository.OrderRepository;
import com.fashionstore.backend.modules.order.service.OrderService;
import com.fashionstore.backend.modules.product.entity.Product;
import com.fashionstore.backend.modules.product.repository.ProductRepository;
import com.fashionstore.backend.modules.user.entity.User;
import com.fashionstore.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderDto createOrder(String userEmail, CreateOrderRequest request) {
        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        if (user == null) {
            throw new AppException("Vui lòng đăng nhập tài khoản khách hàng để đặt hàng.", HttpStatus.UNAUTHORIZED);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        String orderCode = "ORD-2026-" + ThreadLocalRandom.current().nextInt(1000, 9999);
        String trackingCode = "GHTK-" + ThreadLocalRandom.current().nextInt(10000000, 99999999);

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .customerName(request.getCustomerName())
                .customerEmail(user.getEmail())
                .phoneNumber(request.getPhone())
                .shippingAddress(request.getAddress())
                .paymentMethod(request.getPaymentMethod())
                .isPaid(false)
                .status(OrderStatus.PENDING)
                .carrier("GHTK Express")
                .trackingCode(trackingCode)
                .note(request.getNote())
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new AppException("Sản phẩm ID=" + itemReq.getProductId() + " không tồn tại", HttpStatus.NOT_FOUND));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new AppException("Sản phẩm '" + product.getName() + "' không đủ số lượng tồn kho (còn " + product.getStock() + ")", HttpStatus.BAD_REQUEST);
            }

            // Deduct stock safely
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .size(itemReq.getSize() != null ? itemReq.getSize() : "L")
                    .color(itemReq.getColor() != null ? itemReq.getColor() : "Tiêu chuẩn")
                    .price(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();

            order.addItem(orderItem);
        }

        // Apply voucher discount logic
        BigDecimal discount = BigDecimal.ZERO;
        if ("FASHION20".equalsIgnoreCase(request.getDiscountCode())) {
            discount = subtotal.multiply(BigDecimal.valueOf(0.20)).setScale(0, RoundingMode.HALF_UP);
        } else if ("VIPMEMBER".equalsIgnoreCase(request.getDiscountCode())) {
            discount = BigDecimal.valueOf(50000);
        }

        // Shipping fee calculation
        BigDecimal shippingFee = (subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0 || "FREESHIP50K".equalsIgnoreCase(request.getDiscountCode()))
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(30000);

        BigDecimal totalAmount = subtotal.subtract(discount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        Order saved = orderRepository.save(order);
        log.info("Order created successfully: Code={}, Customer={}, Total={}", saved.getOrderCode(), saved.getCustomerName(), saved.getTotalAmount());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return List.of();
        }
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(userEmail);
        return orders.stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Đơn hàng không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, UpdateOrderStatusRequest request, java.security.Principal principal) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Đơn hàng không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        String callerEmail = principal != null ? principal.getName() : null;
        User caller = null;
        boolean isStaffOrAdmin = false;
        if (callerEmail != null) {
            caller = userRepository.findByEmail(callerEmail).orElse(null);
            if (caller != null) {
                isStaffOrAdmin = caller.getRoles().stream()
                        .anyMatch(r -> r.getName() == com.fashionstore.backend.modules.user.entity.RoleType.ROLE_STAFF 
                                || r.getName() == com.fashionstore.backend.modules.user.entity.RoleType.ROLE_ADMIN);
            }
        }

        if (!isStaffOrAdmin) {
            // Customer permissions check
            if (callerEmail == null || !callerEmail.equalsIgnoreCase(order.getCustomerEmail())) {
                throw new AppException("Bạn không có quyền cập nhật đơn hàng này.", HttpStatus.FORBIDDEN);
            }
            // Customer can only cancel order if not yet shipped, or confirm delivery for SHIPPED order
            if (request.getStatus() == OrderStatus.CANCELLED) {
                if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING) {
                    throw new AppException("Chỉ có thể hủy đơn hàng khi đơn chưa được bàn giao vận chuyển.", HttpStatus.BAD_REQUEST);
                }
            } else if (request.getStatus() == OrderStatus.DELIVERED) {
                if (order.getStatus() != OrderStatus.SHIPPED) {
                    throw new AppException("Chỉ có thể xác nhận nhận hàng khi đơn đang ở trạng thái Đang giao.", HttpStatus.BAD_REQUEST);
                }
            } else {
                throw new AppException("Khách hàng không được chuyển đơn hàng sang trạng thái này.", HttpStatus.FORBIDDEN);
            }
        }

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        // If newly cancelled, restore product stock!
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product p = item.getProduct();
                    p.setStock(p.getStock() + item.getQuantity());
                    productRepository.save(p);
                    log.info("Restored stock for product '{}' by +{}", p.getName(), item.getQuantity());
                }
            }
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setIsPaid(true);
        }
        if (request.getCarrier() != null && !request.getCarrier().isBlank()) {
            order.setCarrier(request.getCarrier());
        }
        if (request.getTrackingCode() != null && !request.getTrackingCode().isBlank()) {
            order.setTrackingCode(request.getTrackingCode());
        }

        if (isStaffOrAdmin && caller != null) {
            order.setProcessedBy(caller.getFullName());
            order.setProcessedByEmail(caller.getEmail());
            order.setProcessedAt(java.time.LocalDateTime.now());
        }

        Order saved = orderRepository.save(order);
        log.info("Updated order ID={} from {} to status {} by {}", id, oldStatus, saved.getStatus(), callerEmail);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public OrderDto confirmPayment(Long id, ConfirmPaymentRequest request, java.security.Principal principal) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Đơn hàng ID=" + id + " không tồn tại", HttpStatus.NOT_FOUND));

        String callerEmail = principal != null ? principal.getName() : (order.getCustomerEmail() != null ? order.getCustomerEmail() : "guest");

        // Verify authorization if principal is present
        if (principal != null) {
            User caller = userRepository.findByEmail(callerEmail).orElse(null);
            boolean isStaffOrAdmin = caller != null && caller.getRoles().stream()
                    .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_STAFF".equals(r.getName()));

            if (!isStaffOrAdmin && !order.getCustomerEmail().equalsIgnoreCase(callerEmail)) {
                throw new AppException("Bạn không có quyền thanh toán cho đơn hàng của người khác", HttpStatus.FORBIDDEN);
            }
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException("Không thể thanh toán cho đơn hàng đã bị hủy", HttpStatus.BAD_REQUEST);
        }

        order.setIsPaid(true);
        order.setPaidAt(java.time.LocalDateTime.now());

        if (request != null && request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }

        String txnCode = (request != null && request.getTransactionCode() != null && !request.getTransactionCode().isBlank())
                ? request.getTransactionCode()
                : ("TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9000 + 1000));
        order.setTransactionCode(txnCode);

        // Auto move PENDING to PROCESSING upon confirmed online payment
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.PROCESSING);
        }

        if (principal != null) {
            User caller = userRepository.findByEmail(callerEmail).orElse(null);
            if (caller != null && caller.getRoles().stream()
                    .anyMatch(r -> r.getName() == com.fashionstore.backend.modules.user.entity.RoleType.ROLE_ADMIN 
                            || r.getName() == com.fashionstore.backend.modules.user.entity.RoleType.ROLE_STAFF)) {
                order.setProcessedBy(caller.getFullName());
                order.setProcessedByEmail(caller.getEmail());
                order.setProcessedAt(java.time.LocalDateTime.now());
            }
        }

        Order saved = orderRepository.save(order);
        log.info("Payment confirmed successfully for order ID={} ({}), txnCode={}, paidAt={}, newStatus={}",
                saved.getId(), saved.getOrderCode(), saved.getTransactionCode(), saved.getPaidAt(), saved.getStatus());
        return mapToDto(saved);
    }

    private OrderDto mapToDto(Order o) {
        List<OrderItemDto> itemDtos = o.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .name(item.getProductName())
                        .size(item.getSize())
                        .color(item.getColor())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        return OrderDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .customerName(o.getCustomerName())
                .customerEmail(o.getCustomerEmail())
                .phone(o.getPhoneNumber())
                .address(o.getShippingAddress())
                .subtotal(o.getSubtotal())
                .discount(o.getDiscount())
                .shippingFee(o.getShippingFee())
                .total(o.getTotalAmount())
                .paymentMethod(o.getPaymentMethod())
                .isPaid(o.getIsPaid())
                .transactionCode(o.getTransactionCode())
                .paidAt(o.getPaidAt())
                .status(o.getStatus())
                .carrier(o.getCarrier())
                .trackingCode(o.getTrackingCode())
                .note(o.getNote())
                .processedBy(o.getProcessedBy())
                .processedByEmail(o.getProcessedByEmail())
                .processedAt(o.getProcessedAt())
                .items(itemDtos)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
