package com.fashionstore.backend.modules.chat.service;

import com.fashionstore.backend.modules.chat.dto.ChatMessageDto;
import com.fashionstore.backend.modules.chat.dto.ChatThreadDto;
import com.fashionstore.backend.modules.chat.dto.SendMessageRequest;

import java.util.List;

public interface ChatService {

    ChatMessageDto sendMessage(SendMessageRequest request, String currentUserEmail);

    List<ChatMessageDto> getMessagesByConversation(String conversationId);

    List<ChatMessageDto> getCustomerMessages(String currentUserEmail, String guestConversationId);

    List<ChatMessageDto> getInternalMessages();

    List<ChatThreadDto> getCustomerThreads();

    void markThreadAsRead(String conversationId);
}
