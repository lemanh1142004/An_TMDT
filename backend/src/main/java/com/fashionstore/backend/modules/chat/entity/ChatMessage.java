package com.fashionstore.backend.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatChannelType channelType;

    @Column(nullable = false)
    private String conversationId; // ID hội thoại, ví dụ: "customer_3" hoặc "internal_staff_admin"

    private Long senderId;

    @Column(nullable = false)
    private String senderName;

    private String senderEmail;

    @Column(nullable = false)
    private String senderRole; // ROLE_CUSTOMER, ROLE_STAFF, ROLE_ADMIN, GUEST

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
