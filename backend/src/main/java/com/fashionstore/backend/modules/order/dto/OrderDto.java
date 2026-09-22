package com.fashionstore.backend.modules.order.dto;

import com.fashionstore.backend.modules.order.entity.OrderStatus;
import com.fashionstore.backend.modules.order.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String phone;
    private String address;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private PaymentMethod paymentMethod;
    private Boolean isPaid;
    private OrderStatus status;
    private String carrier;
    private String trackingCode;
    private String note;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
}
