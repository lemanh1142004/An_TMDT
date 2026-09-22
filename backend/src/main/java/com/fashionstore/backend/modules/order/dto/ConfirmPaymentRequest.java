package com.fashionstore.backend.modules.order.dto;

import com.fashionstore.backend.modules.order.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequest {
    private String transactionCode;
    private PaymentMethod paymentMethod;
    private String bankName;
}
