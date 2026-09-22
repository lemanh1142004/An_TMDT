package com.fashionstore.backend.modules.user.service;

import com.fashionstore.backend.modules.user.dto.UpdateUserRoleRequest;
import com.fashionstore.backend.modules.user.dto.UserSummaryDto;

import java.util.List;

public interface UserService {
    List<UserSummaryDto> getAllUsers();
    UserSummaryDto toggleUserStatus(Long userId);
    UserSummaryDto updateUserRole(Long userId, UpdateUserRoleRequest request);
}
