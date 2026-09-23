package com.fashionstore.backend.modules.order.controller;

import com.fashionstore.backend.common.dto.PageResponse;
import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.order.dto.ConfirmPaymentRequest;
import com.fashionstore.backend.modules.order.dto.CreateOrderRequest;
import com.fashionstore.backend.modules.order.dto.OrderDto;
import com.fashionstore.backend.modules.order.dto.UpdateOrderStatusRequest;
import com.fashionstore.backend.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Principal principal
    ) {
        if (principal == null) {
            throw new AppException("Vui lòng đăng nhập tài khoản khách hàng để đặt hàng.", HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(principal.getName(), request));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<OrderDto> confirmPayment(
            @PathVariable Long id,
            @RequestBody(required = false) ConfirmPaymentRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(orderService.confirmPayment(id, request, principal));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDto>> getMyOrders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(orderService.getMyOrders(principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/page")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN')")
    public ResponseEntity<PageResponse<OrderDto>> getOrdersPaginated(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(orderService.getOrdersPaginated(page, size, status, search, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN')")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request, principal));
    }
}
