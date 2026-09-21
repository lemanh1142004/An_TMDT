package com.fashionstore.backend.modules.user.dto;

import com.fashionstore.backend.modules.user.entity.RoleType;
import com.fashionstore.backend.modules.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private boolean active;
    private String authProvider;
    private Set<RoleType> roles;
    private Instant createdAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .authProvider(user.getAuthProvider())
                .roles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
