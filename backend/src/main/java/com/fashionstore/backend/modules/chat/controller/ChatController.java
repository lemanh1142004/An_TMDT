package com.fashionstore.backend.modules.chat.controller;

import com.fashionstore.backend.modules.chat.dto.ChatMessageDto;
import com.fashionstore.backend.modules.chat.dto.ChatThreadDto;
import com.fashionstore.backend.modules.chat.dto.SendMessageRequest;
import com.fashionstore.backend.modules.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(chatService.sendMessage(request, email));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<ChatMessageDto>> getCustomerMessages(
            @RequestParam(required = false) String guestId,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(chatService.getCustomerMessages(email, guestId));
    }

    @GetMapping("/threads")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<List<ChatThreadDto>> getCustomerThreads() {
        return ResponseEntity.ok(chatService.getCustomerThreads());
    }

    @GetMapping("/thread/{conversationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<List<ChatMessageDto>> getMessagesByConversation(
            @PathVariable String conversationId
    ) {
        return ResponseEntity.ok(chatService.getMessagesByConversation(conversationId));
    }

    @GetMapping("/internal")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<List<ChatMessageDto>> getInternalMessages() {
        return ResponseEntity.ok(chatService.getInternalMessages());
    }

    @PatchMapping("/thread/{conversationId}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<Void> markThreadAsRead(@PathVariable String conversationId) {
        chatService.markThreadAsRead(conversationId);
        return ResponseEntity.ok().build();
    }
}
