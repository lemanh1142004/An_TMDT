package com.fashionstore.backend.modules.chat.dto;

import com.fashionstore.backend.modules.chat.entity.ChatChannelType;
import com.fashionstore.backend.modules.chat.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private Long id;
    private ChatChannelType channelType;
    private String conversationId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static ChatMessageDto fromEntity(ChatMessage entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .channelType(entity.getChannelType())
                .conversationId(entity.getConversationId())
                .senderId(entity.getSenderId())
                .senderName(entity.getSenderName())
                .senderEmail(entity.getSenderEmail())
                .senderRole(entity.getSenderRole())
                .content(entity.getContent())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
