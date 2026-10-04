package com.fashionstore.backend.modules.chat.service.impl;

import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.chat.dto.ChatMessageDto;
import com.fashionstore.backend.modules.chat.dto.ChatThreadDto;
import com.fashionstore.backend.modules.chat.dto.SendMessageRequest;
import com.fashionstore.backend.modules.chat.entity.ChatChannelType;
import com.fashionstore.backend.modules.chat.entity.ChatMessage;
import com.fashionstore.backend.modules.chat.repository.ChatMessageRepository;
import com.fashionstore.backend.modules.chat.service.ChatService;
import com.fashionstore.backend.modules.user.entity.RoleType;
import com.fashionstore.backend.modules.user.entity.User;
import com.fashionstore.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ChatMessageDto sendMessage(SendMessageRequest request, String currentUserEmail) {
        User user = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            user = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        ChatChannelType channel = request.getChannelType() != null 
                ? request.getChannelType() 
                : ChatChannelType.CUSTOMER_SUPPORT;

        String conversationId = request.getConversationId();
        Long senderId = user != null ? user.getId() : null;
        String senderName = request.getSenderName();
        String senderEmail = request.getSenderEmail();
        String senderRole = "GUEST";

        if (user != null) {
            senderName = user.getFullName();
            senderEmail = user.getEmail();
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
            boolean isStaff = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_STAFF);

            if (isAdmin) {
                senderRole = "ROLE_ADMIN";
            } else if (isStaff) {
                senderRole = "ROLE_STAFF";
            } else {
                senderRole = "ROLE_CUSTOMER";
            }
        }

        if (channel == ChatChannelType.INTERNAL) {
            if (user == null || (!"ROLE_ADMIN".equals(senderRole) && !"ROLE_STAFF".equals(senderRole))) {
                throw new AppException("Kênh nội bộ chỉ dành cho Nhân viên và Quản trị viên.", HttpStatus.FORBIDDEN);
            }
            conversationId = "internal_staff_admin";
        } else {
            // CUSTOMER_SUPPORT
            if ("ROLE_CUSTOMER".equals(senderRole)) {
                if (conversationId == null || conversationId.isBlank()) {
                    conversationId = "customer_" + user.getId();
                }
            } else if ("GUEST".equals(senderRole)) {
                if (conversationId == null || conversationId.isBlank()) {
                    conversationId = "guest_" + UUID.randomUUID().toString().substring(0, 8);
                }
                if (senderName == null || senderName.isBlank()) {
                    senderName = "Khách hàng";
                }
            } else {
                // Staff or Admin replying to a customer
                if (conversationId == null || conversationId.isBlank()) {
                    throw new AppException("Vui lòng cung cấp conversationId của khách hàng để trả lời.", HttpStatus.BAD_REQUEST);
                }
            }
        }

        ChatMessage message = ChatMessage.builder()
                .channelType(channel)
                .conversationId(conversationId)
                .senderId(senderId)
                .senderName(senderName)
                .senderEmail(senderEmail)
                .senderRole(senderRole)
                .content(request.getContent().trim())
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        log.info("Saved chat message #{} in channel {} [conversation: {}] by {}", 
                saved.getId(), channel, conversationId, senderName);

        return ChatMessageDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessagesByConversation(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return Collections.emptyList();
        }
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(ChatMessageDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getCustomerMessages(String currentUserEmail, String guestConversationId) {
        String targetConvId = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            User user = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (user != null) {
                targetConvId = "customer_" + user.getId();
            }
        }
        if (targetConvId == null) {
            targetConvId = guestConversationId;
        }

        if (targetConvId == null || targetConvId.isBlank()) {
            return Collections.emptyList();
        }

        return getMessagesByConversation(targetConvId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getInternalMessages() {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc("internal_staff_admin")
                .stream()
                .map(ChatMessageDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatThreadDto> getCustomerThreads() {
        List<ChatMessage> messages = chatMessageRepository.findByChannelTypeOrderByCreatedAtDesc(ChatChannelType.CUSTOMER_SUPPORT);
        Map<String, ChatThreadDto> threadMap = new LinkedHashMap<>();

        for (ChatMessage msg : messages) {
            String convId = msg.getConversationId();
            if (!threadMap.containsKey(convId)) {
                String custName = "Khách hàng";
                String custEmail = "";
                if ("ROLE_CUSTOMER".equals(msg.getSenderRole()) || "GUEST".equals(msg.getSenderRole())) {
                    custName = msg.getSenderName();
                    custEmail = msg.getSenderEmail() != null ? msg.getSenderEmail() : "";
                }

                threadMap.put(convId, ChatThreadDto.builder()
                        .conversationId(convId)
                        .customerName(custName)
                        .customerEmail(custEmail)
                        .lastMessage(msg.getContent())
                        .lastMessageTime(msg.getCreatedAt())
                        .unreadCount(Boolean.FALSE.equals(msg.getIsRead()) && !"ROLE_ADMIN".equals(msg.getSenderRole()) && !"ROLE_STAFF".equals(msg.getSenderRole()) ? 1L : 0L)
                        .build());
            } else {
                ChatThreadDto dto = threadMap.get(convId);
                if (("Khách hàng".equals(dto.getCustomerName()) || dto.getCustomerEmail().isBlank())
                        && ("ROLE_CUSTOMER".equals(msg.getSenderRole()) || "GUEST".equals(msg.getSenderRole()))) {
                    dto.setCustomerName(msg.getSenderName());
                    if (msg.getSenderEmail() != null) {
                        dto.setCustomerEmail(msg.getSenderEmail());
                    }
                }
                if (Boolean.FALSE.equals(msg.getIsRead()) && !"ROLE_ADMIN".equals(msg.getSenderRole()) && !"ROLE_STAFF".equals(msg.getSenderRole())) {
                    dto.setUnreadCount(dto.getUnreadCount() + 1);
                }
            }
        }

        return new ArrayList<>(threadMap.values());
    }

    @Override
    @Transactional
    public void markThreadAsRead(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) return;
        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        for (ChatMessage m : messages) {
            if (Boolean.FALSE.equals(m.getIsRead())) {
                m.setIsRead(true);
            }
        }
        chatMessageRepository.saveAll(messages);
    }
}
