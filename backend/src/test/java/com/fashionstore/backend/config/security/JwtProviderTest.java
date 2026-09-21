package com.fashionstore.backend.config.security;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

public class JwtProviderTest {

    private JwtProvider jwtProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(secret, expiration);
    }

    @Test
    void shouldGenerateAndValidateJwtToken() {
        String email = "customer@fashionstore.com";
        Long userId = 100L;
        List<String> roles = List.of("ROLE_CUSTOMER");

        String token = jwtProvider.generateTokenFromUsernameAndRoles(email, userId, roles);

        Assertions.assertNotNull(token);
        Assertions.assertTrue(jwtProvider.validateToken(token));
        Assertions.assertEquals(email, jwtProvider.getEmailFromToken(token));
    }

    @Test
    void shouldFailValidationForInvalidToken() {
        String invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
        Assertions.assertFalse(jwtProvider.validateToken(invalidToken));
    }
}
