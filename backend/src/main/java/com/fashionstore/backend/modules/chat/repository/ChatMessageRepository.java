package com.fashionstore.backend.modules.chat.repository;

import com.fashionstore.backend.modules.chat.entity.ChatChannelType;
import com.fashionstore.backend.modules.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    List<ChatMessage> findByChannelTypeOrderByCreatedAtAsc(ChatChannelType channelType);

    List<ChatMessage> findByChannelTypeOrderByCreatedAtDesc(ChatChannelType channelType);

    long countByConversationIdAndIsReadFalse(String conversationId);
}
