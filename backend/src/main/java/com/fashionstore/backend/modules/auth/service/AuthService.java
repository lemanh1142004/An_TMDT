package com.fashionstore.backend.modules.auth.service;

import com.fashionstore.backend.modules.auth.dto.AuthResponse;
import com.fashionstore.backend.modules.auth.dto.LoginRequest;
import com.fashionstore.backend.modules.auth.dto.RefreshTokenRequest;
import com.fashionstore.backend.modules.auth.dto.RegisterRequest;
import com.fashionstore.backend.modules.user.dto.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    UserDto getCurrentUser();
    void logout(String refreshToken);
}
