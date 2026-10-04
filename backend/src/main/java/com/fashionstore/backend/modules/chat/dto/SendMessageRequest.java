package com.fashionstore.backend.modules.chat.dto;

import com.fashionstore.backend.modules.chat.entity.ChatChannelType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private ChatChannelType channelType;

    private String conversationId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    private String senderName;

    private String senderEmail;
}
