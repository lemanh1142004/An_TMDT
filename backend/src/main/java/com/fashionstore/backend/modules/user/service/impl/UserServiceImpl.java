package com.fashionstore.backend.modules.user.service.impl;

import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.user.dto.UpdateUserRoleRequest;
import com.fashionstore.backend.modules.user.dto.UserSummaryDto;
import com.fashionstore.backend.modules.user.entity.Role;
import com.fashionstore.backend.modules.user.entity.User;
import com.fashionstore.backend.modules.user.repository.RoleRepository;
import com.fashionstore.backend.modules.user.repository.UserRepository;
import com.fashionstore.backend.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToSummary).toList();
    }

    @Override
    @Transactional
    public UserSummaryDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại với ID: " + userId, HttpStatus.NOT_FOUND));

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        log.info("Toggled user ID={} status to active={}", userId, saved.isActive());
        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public UserSummaryDto updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại với ID: " + userId, HttpStatus.NOT_FOUND));

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new AppException("Role không tồn tại: " + request.getRole(), HttpStatus.NOT_FOUND));

        user.setRoles(new HashSet<>(Set.of(role)));
        User saved = userRepository.save(user);
        log.info("Updated user ID={} role to {}", userId, request.getRole());
        return mapToSummary(saved);
    }

    private UserSummaryDto mapToSummary(User user) {
        String roleName = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("ROLE_CUSTOMER");

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(roleName)
                .active(user.isActive())
                .joinedDate(user.getCreatedAt())
                .build();
    }
}
