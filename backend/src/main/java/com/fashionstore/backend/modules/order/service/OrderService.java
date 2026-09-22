package com.fashionstore.backend.modules.order.service;

import com.fashionstore.backend.modules.order.dto.ConfirmPaymentRequest;
import com.fashionstore.backend.modules.order.dto.CreateOrderRequest;
import com.fashionstore.backend.modules.order.dto.OrderDto;
import com.fashionstore.backend.modules.order.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface OrderService {
    OrderDto createOrder(String userEmail, CreateOrderRequest request);
    List<OrderDto> getMyOrders(String userEmail);
    List<OrderDto> getAllOrders();
    OrderDto getOrderById(Long id);
    OrderDto updateOrderStatus(Long id, UpdateOrderStatusRequest request, java.security.Principal principal);
    OrderDto confirmPayment(Long id, ConfirmPaymentRequest request, java.security.Principal principal);
}
