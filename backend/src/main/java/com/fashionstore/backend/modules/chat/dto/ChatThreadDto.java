package com.fashionstore.backend.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatThreadDto {
    private String conversationId;
    private String customerName;
    private String customerEmail;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;
}
