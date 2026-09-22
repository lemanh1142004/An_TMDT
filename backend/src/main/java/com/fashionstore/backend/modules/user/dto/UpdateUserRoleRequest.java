package com.fashionstore.backend.modules.user.dto;

import com.fashionstore.backend.modules.user.entity.RoleType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    @NotNull(message = "Role không được để trống")
    private RoleType role;
}
